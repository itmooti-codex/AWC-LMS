AWC LMS Frontend (Static)

Overview
- Static ES‑module frontend that integrates with the VitalStats SDK to display:
  - User notifications (alerts)
  - Enrolled courses (nav + home grid)
- No bundler/build; pages live in `public/` and import modules from `src/`.

Project Layout
- `public/` — HTML pages and minimal CSS
  - `home.html` — Courses home (also renders nav notifications/courses)
  - `alerts.html` — Notifications page (also renders nav courses)
- `src/sdk/` — SDK loader and config
  - `init.js` — Loads VitalStats SDK and initializes a `plugin`
  - `config.js` — Holds `slug` + `apiKey` and default user preference toggles
  - `userConfig.js` — Reads `window.loggedinuserid`/`window.loggedinuserType` and exposes preferences
- `src/alerts/` — Notifications data + UI
  - `NotificationCore.js` — Queries/subscribes to `EduflowproAlert` and renders
  - `NotificationUI.js` — Renders alert cards
  - `NotificationUtils.js` — Mapping + time‑ago helper
  - `index.js` — Page bootstrap, mark‑as‑read actions
- `src/courses/` — Courses (enrolments) data + UI
  - `CourseCore.js` — Queries `EduflowproEnrolment` with related `Course`/`Class`
  - `CourseUI.js` — Renders course items for nav/home
  - `CourseUtils.js` — Maps SDK records to UI
- `src/utils/` — DOM helpers (`onReady`, dropdowns, image fallback, name renderer)

Configuration
- Edit `src/sdk/config.js`:
  - `slug`: Your VitalStats account slug
  - `apiKey`: A valid API key for that account
  - Preference toggles default to "Yes"/"No" strings and are merged via `UserConfig`.
- The host page (or testing setup) should define:
  - `window.loggedinuserid` (number)
  - `window.loggedinuserType` (e.g., `"Student"`, `"Teacher"`, or `"admin"`)

Security Note
- Do not commit real API keys. Prefer injecting `slug`/`apiKey` at deploy time or via server‑side templating.

Running Locally
Because ES modules are imported by file path, open the pages via a local HTTP server (not `file://`).

Option A: Python
- From the repo root:
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000/public/home.html` or `.../alerts.html`

Option B: Node (if installed globally)
- `npx http-server public -p 8000` then visit `http://localhost:8000`

Notes
- The VitalStats SDK is loaded from a hosted script inside the modules at runtime.
- Query executions that call `.fetch()` pipe through `window.toMainInstance(true)` per the SDK guide.

Known Spots
- API key is hardcoded in `src/sdk/config.js` for convenience; replace with a safer injection for production.
- `NotificationCore.buildQuery()` uses `UserConfig.userId` to bind the current user and filters classes for non‑admin roles.
