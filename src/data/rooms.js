export const APP_CONFIG = {
  totalMinutes: 60,
  approachingWarnMinutes: 2,
  severeDelayMinutes: 5,
  finalStretchStartMinute: 50,
  storageKey: 'escapeops_session_v3'
};

export const ROOMS = {
  elm: {
    id: 'elm',
    name: 'אלם סטריט',
    durationMinutes: 60,
    stageCountLabel: '4 שלבים',
    notes: [
      'בדיקת קצב פתרון כבר בדקה 15–20.',
      'אם יש עיכוב בחדר 3, לשקול רמז ממוקד.'
    ],
    stages: [
      { name: 'חדר 1 — החצר', targetMinute: 20 },
      { name: 'חדר 2 — חדר השינה', targetMinute: 30 },
      { name: 'חדר 3 — חדר הצינורות', targetMinute: 45 },
      { name: 'חדר 4 — המשרפה', targetMinute: 60 }
    ]
  },
  katzia: {
    id: 'katzia',
    name: 'הקצביה',
    durationMinutes: 60,
    stageCountLabel: '3 שלבים מרכזיים',
    notes: [
      'במעבר לחדר הלבבות לוודא שהקבוצה מסונכרנת.',
      'בשלב הסיום לתת דגש על קצב סיום נקי.'
    ],
    stages: [
      { name: 'המעדניה', targetMinute: 20 },
      { name: 'חדר הלבבות', targetMinute: 40 },
      { name: 'חדר אחרון / פרדריק / סיום', targetMinute: 60 }
    ]
  }
};

export const roomList = Object.values(ROOMS);
