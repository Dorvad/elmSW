export function createInitialState() {
  return {
    selectedRoomId: null,
    isRunning: false,
    isPaused: false,
    sessionStartTimestamp: null,
    elapsedMs: 0,
    currentStageIndex: 0,
    stageTransitions: [],
    muteAlerts: false,
    sessionEnded: false,
    alertsShown: {},
    shownTips: {},
    toastMessage: '',
    toastUntil: 0
  };
}

export function nowMs() {
  return Date.now();
}

export function startTimer(state) {
  if (state.isRunning && !state.isPaused) return state;
  const base = state.elapsedMs;
  state.sessionStartTimestamp = nowMs() - base;
  state.isRunning = true;
  state.isPaused = false;
  return state;
}

export function pauseTimer(state) {
  if (!state.isRunning || state.isPaused) return state;
  state.elapsedMs = getElapsedMs(state);
  state.isPaused = true;
  return state;
}

export function resumeTimer(state) {
  if (!state.isRunning || !state.isPaused) return state;
  state.sessionStartTimestamp = nowMs() - state.elapsedMs;
  state.isPaused = false;
  return state;
}

export function resetSession(state) {
  return Object.assign(state, createInitialState());
}

export function getElapsedMs(state) {
  if (!state.isRunning || state.isPaused || !state.sessionStartTimestamp) {
    return state.elapsedMs;
  }
  return Math.max(0, nowMs() - state.sessionStartTimestamp);
}

export function saveSession(storageKey, state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

export function loadSession(storageKey) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession(storageKey) {
  localStorage.removeItem(storageKey);
}

export function formatClock(ms) {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
