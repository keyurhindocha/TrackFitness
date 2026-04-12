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
- React Native
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

## Project Structure

```text
.
├── App.js
├── src
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

The app stores workout and cheat day data locally using AsyncStorage. No backend or account setup is required.

## Scripts

```bash
npm start
npm run ios
npm run android
npm run web
```

Note: web support may require additional Expo web dependencies if they are not installed in the project yet.

## Future Improvements

- Editing existing workouts
- Filtering and searching workout history
- Exporting workout data
- Cloud sync and backup
- More detailed nutrition tracking
