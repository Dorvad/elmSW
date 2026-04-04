import { APP_CONFIG, ROOMS, roomList } from './data/rooms.js';
import {
  createInitialState,
  startTimer,
  pauseTimer,
  resumeTimer,
  getElapsedMs,
  formatClock,
  saveSession,
  loadSession,
  clearSession
} from './lib/timer.js';
import {
  getCurrentStage,
  getDelayMinutes,
  getStatusByDelay,
  computeAlerts,
  summarizeSession
} from './lib/progression.js';

const state = createInitialState();
let tickHandle = null;

const els = {
  selectScreen: document.getElementById('screen-select'),
  timerScreen: document.getElementById('screen-timer'),
  roomCards: document.getElementById('room-cards'),
  roomName: document.getElementById('room-name'),
  timerValue: document.getElementById('timer-value'),
  remainingValue: document.getElementById('remaining-value'),
  statusText: document.getElementById('status-text'),
  stageTitle: document.getElementById('stage-title'),
  stageDeadline: document.getElementById('stage-deadline'),
  nextExpected: document.getElementById('next-expected'),
  stageTimeline: document.getElementById('stage-timeline'),
  alerts: document.getElementById('alerts'),
  startPauseBtn: document.getElementById('btn-start-pause'),
  resetBtn: document.getElementById('btn-reset'),
  advanceBtn: document.getElementById('btn-advance'),
  muteBtn: document.getElementById('btn-mute'),
  backBtn: document.getElementById('btn-back'),
  notesToggle: document.getElementById('notes-toggle'),
  notesPanel: document.getElementById('notes-panel'),
  summaryModal: document.getElementById('summary-modal'),
  summaryBody: document.getElementById('summary-body'),
  quickRestart: document.getElementById('quick-restart'),
  closeSummary: document.getElementById('close-summary'),
  toast: document.getElementById('toast')
};

function renderRoomCards() {
  els.roomCards.innerHTML = roomList.map((room) => `
    <button class="room-card" data-room-id="${room.id}">
      <h2>${room.name}</h2>
      <p>משך ממוצע: ${room.durationMinutes} דקות</p>
      <p>${room.stageCountLabel}</p>
    </button>
  `).join('');

  els.roomCards.querySelectorAll('.room-card').forEach((button) => {
    button.addEventListener('click', () => selectRoom(button.dataset.roomId));
  });
}

function selectRoom(roomId) {
  state.selectedRoomId = roomId;
  switchScreen('timer');
  render();
  persist();
}

function switchScreen(name) {
  els.selectScreen.classList.toggle('active', name === 'select');
  els.timerScreen.classList.toggle('active', name === 'timer');
}

function currentRoom() {
  return ROOMS[state.selectedRoomId];
}

function persist() {
  saveSession(APP_CONFIG.storageKey, state);
}

function render() {
  const room = currentRoom();
  if (!room) return;

  const elapsedMs = getElapsedMs(state);
  state.elapsedMs = elapsedMs;

  const elapsedMinutes = elapsedMs / 60000;
  const remainingMs = Math.max(0, APP_CONFIG.totalMinutes * 60000 - elapsedMs);
  const stage = getCurrentStage(room, state);
  const delay = getDelayMinutes(elapsedMs, stage.targetMinute);
  const status = getStatusByDelay(delay, APP_CONFIG.severeDelayMinutes);

  els.roomName.textContent = room.name;
  els.timerValue.textContent = formatClock(elapsedMs);
  els.remainingValue.textContent = formatClock(remainingMs);
  els.statusText.textContent = status.label;
  els.statusText.className = `status ${status.key}`;
  els.stageTitle.textContent = `שלב ${Math.min(state.currentStageIndex + 1, room.stages.length)}: ${stage.name}`;
  els.stageDeadline.textContent = `יעד: עד דקה ${stage.targetMinute}`;
  els.nextExpected.textContent = `מעבר צפוי הבא: ${stage.targetMinute}:00`;

  renderTimeline(room);
  renderNotes(room);
  renderControls(room);
  renderToast();
  checkAndShowAlerts(room, elapsedMs);
}

function renderTimeline(room) {
  els.stageTimeline.innerHTML = room.stages.map((stage, index) => {
    const cls = index < state.currentStageIndex ? 'done' : index === state.currentStageIndex ? 'current' : 'upcoming';
    return `<div class="stage-node ${cls}">
      <strong>שלב ${index + 1}</strong>
      <span>${stage.name}</span>
      <small>יעד: ${stage.targetMinute}:00</small>
    </div>`;
  }).join('');
}

function renderNotes(room) {
  els.notesPanel.innerHTML = `<ul>${room.notes.map((n) => `<li>${n}</li>`).join('')}</ul>`;
}

function renderControls(room) {
  if (!state.isRunning) {
    els.startPauseBtn.textContent = 'התחל';
  } else if (state.isPaused) {
    els.startPauseBtn.textContent = 'המשך';
  } else {
    els.startPauseBtn.textContent = 'השהה';
  }

  els.advanceBtn.disabled = state.currentStageIndex >= room.stages.length - 1;
  els.muteBtn.textContent = state.muteAlerts ? '🔇' : '🔔';
}

function showToast(message) {
  state.toastMessage = message;
  state.toastUntil = Date.now() + 1600;
}

function renderToast() {
  if (Date.now() < state.toastUntil) {
    els.toast.textContent = state.toastMessage;
    els.toast.classList.add('visible');
  } else {
    els.toast.classList.remove('visible');
  }
}

function checkAndShowAlerts(room, elapsedMs) {
  const alerts = computeAlerts({ elapsedMs, room, state, config: APP_CONFIG });
  if (!alerts.length) return;
  const alert = alerts[0];
  state.alertsShown[alert.key] = true;
  els.alerts.innerHTML = `<div class="alert ${alert.type}">${alert.text}</div>`;
  if (!state.muteAlerts) signalAlert(alert.type);
}

function signalAlert(type) {
  if ('vibrate' in navigator) navigator.vibrate(type === 'timeup' ? [200, 120, 200] : 120);
}

function setupEvents() {
  els.startPauseBtn.addEventListener('click', () => {
    if (!state.isRunning) startTimer(state);
    else if (state.isPaused) resumeTimer(state);
    else pauseTimer(state);
    render();
    persist();
  });

  els.resetBtn.addEventListener('click', () => openSummary(true));

  els.advanceBtn.addEventListener('click', () => {
    const room = currentRoom();
    if (!room || state.currentStageIndex >= room.stages.length - 1) return;
    const elapsedMs = getElapsedMs(state);
    state.stageTransitions.push({ stageIndex: state.currentStageIndex, elapsedMs });
    state.currentStageIndex += 1;
    showToast('מעבר שלב נשמר בהצלחה');
    render();
    persist();
  });

  els.muteBtn.addEventListener('click', () => {
    state.muteAlerts = !state.muteAlerts;
    render();
    persist();
  });

  els.backBtn.addEventListener('click', () => {
    if (state.isRunning && !state.isPaused) pauseTimer(state);
    switchScreen('select');
    persist();
  });

  els.notesToggle.addEventListener('click', () => {
    els.notesPanel.classList.toggle('open');
  });

  els.quickRestart.addEventListener('click', () => {
    const sameRoom = state.selectedRoomId;
    Object.assign(state, createInitialState(), { selectedRoomId: sameRoom });
    switchScreen('timer');
    closeSummary();
    render();
    persist();
  });

  els.closeSummary.addEventListener('click', () => {
    closeSummary();
    Object.assign(state, createInitialState());
    clearSession(APP_CONFIG.storageKey);
    switchScreen('select');
  });
}

function openSummary(fromReset = false) {
  const room = currentRoom();
  if (!room) return;
  if (!state.sessionEnded) {
    state.sessionEnded = true;
    state.isRunning = false;
    state.isPaused = true;
  }

  const items = summarizeSession(room, state)
    .map((item) => {
      const actual = item.actualMinute === null ? '—' : `${item.actualMinute.toFixed(1)} דק׳`;
      const diff = item.diff === null ? '—' : `${item.diff > 0 ? '+' : ''}${item.diff} דק׳`;
      return `<tr><td>${item.stageName}</td><td>${item.targetMinute}</td><td>${actual}</td><td>${diff}</td></tr>`;
    }).join('');

  els.summaryBody.innerHTML = `
    <p>משך כולל: ${formatClock(state.elapsedMs)}</p>
    <table>
      <thead><tr><th>שלב</th><th>יעד</th><th>בפועל</th><th>פער</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <p>${fromReset ? 'בוצע איפוס לסשן הנוכחי.' : 'סיכום משחק.'}</p>
  `;
  els.summaryModal.showModal();
  persist();
}

function closeSummary() {
  els.summaryModal.close();
}

function bootTick() {
  if (tickHandle) clearInterval(tickHandle);
  tickHandle = setInterval(() => {
    if (state.selectedRoomId) {
      render();
      persist();
    }
  }, 250);
}

function tryRestore() {
  const saved = loadSession(APP_CONFIG.storageKey);
  if (!saved) return;
  Object.assign(state, createInitialState(), saved);
  if (state.selectedRoomId) switchScreen('timer');
}

function init() {
  renderRoomCards();
  setupEvents();
  tryRestore();
  if (!state.selectedRoomId) switchScreen('select');
  render();
  bootTick();
}

init();
