export function getCurrentStage(room, state) {
  return room.stages[Math.min(state.currentStageIndex, room.stages.length - 1)];
}

export function getDelayMinutes(elapsedMs, stageTargetMinute) {
  const elapsedMinutes = elapsedMs / 60000;
  return elapsedMinutes - stageTargetMinute;
}

export function getStatusByDelay(delayMinutes, severeThreshold) {
  if (delayMinutes <= 0) return { key: 'good', label: 'בזמן' };
  if (delayMinutes <= severeThreshold) return { key: 'warn', label: 'באיחור קל' };
  return { key: 'danger', label: 'באיחור משמעותי' };
}

export function computeAlerts({ elapsedMs, room, state, config }) {
  const elapsedMinutes = elapsedMs / 60000;
  const alerts = [];
  const stage = getCurrentStage(room, state);
  const target = stage.targetMinute;

  const approachingKey = `approaching_${state.currentStageIndex}`;
  if (
    target - elapsedMinutes <= config.approachingWarnMinutes
    && target - elapsedMinutes > 0
    && !state.alertsShown[approachingKey]
  ) {
    alerts.push({
      type: 'approaching',
      key: approachingKey,
      text: 'עוד 2 דקות הם אמורים לעבור חדר'
    });
  }

  const overdueKey = `overdue_${state.currentStageIndex}`;
  if (elapsedMinutes >= target && !state.alertsShown[overdueKey]) {
    alerts.push({
      type: 'overdue',
      key: overdueKey,
      text: 'הקבוצה מתעכבת בחדר הנוכחי'
    });
  }

  const severeKey = `severe_${state.currentStageIndex}`;
  if (elapsedMinutes >= target + config.severeDelayMinutes && !state.alertsShown[severeKey]) {
    alerts.push({
      type: 'severe',
      key: severeKey,
      text: 'איחור משמעותי — שווה לשקול התערבות'
    });
  }

  if (elapsedMinutes >= config.finalStretchStartMinute && !state.alertsShown.finalStretch) {
    alerts.push({
      type: 'final',
      key: 'finalStretch',
      text: 'נכנסנו ל-10 הדקות האחרונות'
    });
  }

  if (elapsedMinutes >= config.totalMinutes && !state.alertsShown.timeup) {
    alerts.push({
      type: 'timeup',
      key: 'timeup',
      text: 'נגמר הזמן — 60:00'
    });
  }

  return alerts;
}

export function summarizeSession(room, state) {
  return room.stages.map((stage, index) => {
    const transition = state.stageTransitions[index];
    const actualMinute = transition ? transition.elapsedMs / 60000 : null;
    const diff = actualMinute === null ? null : +(actualMinute - stage.targetMinute).toFixed(1);
    return {
      stageName: stage.name,
      targetMinute: stage.targetMinute,
      actualMinute,
      diff
    };
  });
}
