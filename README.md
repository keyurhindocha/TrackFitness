# TrackFitness

TrackFitness is a lightweight Expo app for logging workouts, reviewing lifting progress, checking workout history on a calendar, and keeping an eye on cheat days.

## Features

- Log workouts by exercise and set
- Review previous workouts with expandable session details
- Track exercise progress and session trends
- View workout history on a calendar
- Log and review cheat days
- Store data locally on-device with AsyncStorage

## Tech Stack

- Expo
- React Native (+ `react-native-web` for the browser build)
- React Navigation
- AsyncStorage
- `react-native-calendars`
- `react-native-chart-kit`

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo CLI tooling through `npx expo`

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm start
```

Then open it in:

- iOS simulator with `npm run ios`
- Android emulator with `npm run android`

## Run as a website

The same codebase compiles to a static website with `react-native-web` — no
separate frontend, no backend, no account. Data is stored in the browser's
`localStorage` (via AsyncStorage), so each browser keeps its own history.

Build the static site into `dist/`:

```bash
npm run build:web
npm run serve:web   # preview at http://localhost:3000
```

### Hosting it free

`dist/` is a plain static folder, so any free static host works.

**GitHub Pages (automated).** `.github/workflows/deploy-web.yml` builds and
deploys on every push to `main`, and enables Pages itself on the first run. The
site publishes to `https://<user>.github.io/<repo>/`.

If that first run fails to create the site, the repository setting can be
flipped by hand instead: **Settings → Pages → Source → GitHub Actions**, then
re-run the workflow.

**Netlify / Vercel / Cloudflare Pages.** Point the project at this repo and use:

| Setting | Value |
| --- | --- |
| Build command | `npm run build:web` |
| Publish directory | `dist` |

### Base URL

Hosts that serve from a sub-path (like GitHub Pages, at `/<repo>/`) need the
asset prefix set at build time:

```bash
EXPO_WEB_BASE_URL=/TrackFitness npm run build:web
```

Leave `EXPO_WEB_BASE_URL` unset when serving from a domain root — that is the
default for Netlify, Vercel, and Cloudflare Pages. The Pages workflow sets it
automatically from the repository name.

### Platform differences

Everything works in the browser, with two behaviours implemented separately for
web in `src/utils/backup.web.js` and `src/components/AlertHost.js`:

- **Backups** use a file download and a file picker instead of the iOS share
  sheet and document picker.
- **Confirmation dialogs** render as an in-app modal, because
  `react-native-web` ships `Alert.alert` as a no-op.


## Project Structure

```text
.
├── App.js
├── app.config.js          # web base-URL handling
├── src
│   ├── components
│   │   └── AlertHost.js   # cross-platform Alert
│   ├── navigation
│   │   └── AppNavigator.js
│   ├── screens
│   │   ├── WorkoutsScreen.js
│   │   ├── LogWorkoutScreen.js
│   │   ├── ProgressScreen.js
│   │   ├── ProgressDetailScreen.js
│   │   ├── CalendarScreen.js
│   │   └── CheatDaysScreen.js
│   ├── storage
│   │   └── storage.js
│   └── utils
│       ├── backup.js      # native export/import
│       ├── backup.web.js  # browser export/import
│       ├── helpers.js
│       └── theme.js
└── package.json
```

## Main Screens

### Workouts

Browse saved workouts, expand sessions, and start a new log.

### Log Workout

Add exercises, enter sets with weight and reps, and save the full workout for the current day.

### Progress

See exercise trends, top weights, and drill into detailed history for each movement.

### Calendar

View which days have workouts logged and inspect the exercises completed on a selected date.

### Cheat Days

Track off-plan meals or snacks by date and review recent entries.

## Data Storage

The app stores workout and cheat day data locally using AsyncStorage — on-device on iOS and Android, and in `localStorage` in the browser. No backend or account setup is required.

Because storage is per-device and per-browser, use **Settings → Export Backup** to move data between them.

## Scripts

```bash
npm start           # Expo dev server
npm run ios         # iOS simulator / device
npm run android     # Android emulator
npm run web         # web dev server
npm run build:web   # static site into dist/
npm run serve:web   # preview the built site
```

## Future Improvements

- Editing existing workouts
- Filtering and searching workout history
- Exporting workout data
- Cloud sync and backup
- More detailed nutrition tracking
