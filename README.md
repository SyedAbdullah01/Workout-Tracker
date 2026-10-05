# Workout Tracker

A clean, fully client-side workout tracking app for planning your weekly routine, logging sets live during a workout, and tracking your progress over time. No backend, no build step, no sign-up: everything is stored locally in your browser.

**Live demo:** (https://prtrack.vercel.app/#dashboard)

## Features

- **Dashboard**: at-a-glance view of today's workout, this month's stats (workouts/sets completed), a weekly training-consistency chart, and your most recent sessions.
- **My Routine**: assign a workout to any day of the week, or leave it as a rest day. Add, edit, or remove exercises and target sets per day.
- **Start Workout**: pulls in whichever day you pick (defaults to today), lets you log actual weight and reps per set in real time, mark sets done, and add extra sets on the fly.
- **History**: every finished workout is saved automatically. Filter by workout name or time range, and expand any entry to see the exact weight/reps logged per set.
- **Progress**: pick an exercise and see a chart of your heaviest logged set across every session you've done it in.
- **Settings**: set your name, export all your data as a JSON backup, or clear everything and start fresh.
- Fully responsive: a sidebar + topbar layout on desktop, and a bottom tab bar with a slide-out menu on mobile.

## Tech Stack

- **HTML5 + vanilla JavaScript**, no framework, no bundler
- **[Tailwind CSS](https://tailwindcss.com/)** (via CDN) for styling
- **[Lucide](https://lucide.dev/)** (via CDN) for icons
- **`localStorage`** for all data persistence. Nothing ever leaves your browser

## Project Structure

```
.
├── index.html      # markup for all pages (Dashboard, My Routine, Start Workout, History, Progress, Settings)
├── script.js       # all app logic: routing, data persistence, rendering
└── styles.css      # custom styles beyond Tailwind's utility classes
```

## Getting Started

This is a static site, so there's nothing to install or build.

1. Clone the repo:
   ```
   git clone https://github.com/SyedAbdullah01/Workout-Tracker.git
   cd Workout-Tracker
   ```
2. Open `index.html` directly in a browser, **or** serve it locally (recommended, since some browsers restrict `localStorage` on `file://` pages), for example with VS Code's [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, or:
   ```
   npx serve .
   ```

## How Your Data Works

All routine, workout, and settings data is stored in your browser's `localStorage` under the `workoutTracker.*` keys. That means:

- Your data is private to your browser. Nothing is sent to a server.
- It won't sync across devices or browsers.
- Clearing your browser's site data (or using the in-app "Clear Data" button) erases it permanently. Use **Settings → Export Data** first if you want a backup.

## Deployment

The app is a static site with no build command, so it deploys cleanly to any static host (Vercel, GitHub Pages, Netlify, etc.) straight from this repo with zero configuration.

## Possible Future Additions

- Editing or deleting a single past History entry
- Removing a set mid-workout (currently only adding is supported)
- Multi-device sync via an actual backend