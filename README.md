# EscapeOps — לוח בקרה למפעיל

A purpose-built operator control panel for live escape room sessions.
Designed for mobile-first use in a control-room context — fast, dark, readable under pressure.

---

## What it does

- **Room selection** — choose between אלם סטריט or הקצביה
- **Precision stopwatch** — counts up from 00:00, SVG progress ring around the clock
- **Stage tracking** — advance stages manually, see elapsed time per stage vs. target
- **Smart alerts** — visual + audio + vibration alerts at key moments
- **Session persistence** — page refresh restores the session automatically
- **Session summary** — shows stage timing and lateness on game end or manual close

---

## Deployment (GitHub Pages)

### First-time setup

1. Create a new GitHub repository (e.g. `escapeops`)
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → `main` → `/root`**
4. Upload `index.html` to the root of the repository
5. Your app will be live at: `https://yourusername.github.io/escapeops/`

### Updating

1. Edit `index.html` locally or on GitHub's web UI
2. Commit the file to the `main` branch
3. GitHub Pages rebuilds automatically (usually within 30–60 seconds)

---

## Customizing room configuration

All room data is at the top of the `<script>` section, inside the `ROOMS` constant.

To change stage names, targets, or notes:

```javascript
const ROOMS = {
  katzia: {
    stages: [
      {
        name:          'המעדניה',
        displayName:   'שלב 1 — המעדניה',
        targetMinutes: 20,    // ← change this
        notes: 'הערת מפעיל...'  // ← change this
      },
      // ...
    ]
  }
}
```

To change alert thresholds:

```javascript
const CFG = {
  APPROACHING_WARN_MIN: 2,   // warn 2 min before stage deadline
  SEVERE_DELAY_MIN:     5,   // "severe delay" after 5 min past deadline
  FINAL_STRETCH_MIN:    50,  // final 10-min visual at minute 50
  TOTAL_MIN:            60   // game length
};
```

---

## Alert types

| Alert | Trigger | Display |
|-------|---------|---------|
| Approaching | 2 min before stage deadline | Amber banner, 2 beeps |
| Overdue | Stage deadline just passed | Red banner, 3 descending beeps |
| Severe delay | 5+ min past deadline | Pulsing red banner, 4 urgent beeps |
| Final 10 min | Elapsed reaches 50:00 | Amber banner, clock turns amber |
| Time up | 60:00 reached | Flashing red banner + timer, urgent sound |

---

## Controls

| Button | Action |
|--------|--------|
| **התחל** | Start timer (first press) |
| **⏸ השהה** | Pause timer |
| **▶ המשך** | Resume paused timer |
| **עברנו לחדר הבא ›** | Mark stage complete, advance to next |
| **סיים משחק** (last stage) | End game, show session summary |
| **↺** | Reset session (with confirmation) |
| **🔔 / 🔇** | Toggle audio alerts |
| **← חזרה** | Pause and return to room selection (session saved) |

---

## Technical notes

- Single HTML file — no build step, no dependencies, no server needed
- Fonts loaded from Google Fonts (requires internet on first load; cached after)
- Audio uses Web Audio API (no external files) — works on iOS after first user tap
- Vibration uses `navigator.vibrate()` — works on Android, not on iOS
- Session stored in `localStorage` under key `escapeops_v2`
- To clear a saved session manually: open browser DevTools → Application → Local Storage → delete `escapeops_v2`

---

## Architecture (for developers)

All logic lives in the single `<script>` tag, structured in clear sections:

```
ROOMS CONFIG      — all room/stage data, timing, notes
CFG               — alert thresholds
APP STATE (S)     — single mutable state object
PERSISTENCE       — localStorage save/load/clear
TIMER ENGINE      — elapsed calc, start/pause/tick
PROGRESSION       — stage status, labels
ALERTS ENGINE     — threshold checks, fire/dismiss
AUDIO ENGINE      — Web Audio API beep patterns
UI RENDERER       — stateless render functions
SCREEN MANAGEMENT — showScreen, initTimerScreen
USER HANDLERS     — all onclick logic
INIT              — app startup + session restore
```
