# EscapeOps (GitHub Pages)

אפליקציית תפעול מובייל-פירסט למפעילי חדרי בריחה עבור:
- אלם סטריט
- הקצביה

## הרצה מקומית

מכיוון שיש שימוש ב-ES modules, מומלץ להגיש עם שרת סטטי:

```bash
python3 -m http.server 4173
```

ואז לפתוח:
`http://localhost:4173`

## מבנה קבצים

- `index.html` — מעטפת המסכים
- `src/data/rooms.js` — קונפיגורציית חדרים, שלבים ויעדים
- `src/lib/timer.js` — מנוע סטופר + localStorage
- `src/lib/progression.js` — סטטוס התקדמות, איחורים והתראות
- `src/main.js` — ניהול state, UI events, rendering
- `src/styles/main.css` — עיצוב RTL כהה ומובייל-פירסט

## תכונות ממומשות

- בחירת חדר בלחיצה אחת
- טיימר 60 דקות (Start/Pause/Resume)
- כפתור מעבר שלב: "עברנו לחדר הבא"
- טיימליין שלבים (הושלם/נוכחי/הבא)
- חיווי איחור (בזמן / באיחור קל / באיחור משמעותי)
- התראות: approaching / overdue / severe / final 10 / time up
- modal סיכום סשן
- שחזור סשן אחרי רענון (`localStorage`)
- mute להתראות
