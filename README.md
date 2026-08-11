# Chameleon

A full-stack multiplayer party game built with React, inspired by the board game Chameleon. Play locally with pass-and-play, or host a real-time online game with friends using Firebase.

[Live Demo](https://chameleonai.netlify.app/)

## How to Play

One player is secretly the Impostor. Everyone else sees a secret word from a chosen category — the Impostor only sees the category name. Players take turns giving one-word hints related to the secret word, trying to prove they know it without giving it away to the Impostor. After two rounds of hints, everyone votes on who they think the Impostor is.

- If the group votes out the real Impostor, the Impostor gets one final chance at redemption: if they guess the secret word correctly they still win.
- If the group votes wrong, the Impostor wins outright.
- If the vote ties, the group writes another round of hints and votes again.

## Features

- **Pass and Play** — play locally on one device, passing it around for each player's turn
- **Online Multiplayer** — create or join a room with a 6-digit code and play across separate devices in real time
- **Custom categories** — select which topic categories to draw secret words from
- **Live game sync** — player lists, turns, hints, and votes update instantly across all connected devices
- **Tie-breaking** — automatically extends into another hint round on a tied vote
- **Redemption mechanic** — a caught Impostor gets one shot to guess the word and steal the win
- **Responsive design** — built mobile-first, works across phone and desktop screens

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, [lucide-react](https://lucide.dev/) icons
- **Backend / Real-time sync:** Firebase Firestore (NoSQL, live listeners)
- **Hosting:** Netlify, with continuous deployment from GitHub
- **Version control:** Git / GitHub

## Project Structure

```
src/
├── App.jsx           # Top-level routing: home screen, mode selection
├── PassAndPlay.jsx    # Local single-device game mode and all its logic
├── Online.jsx          # Firebase-backed multiplayer game mode and all its logic
├── firebase.js          # Firebase project configuration and Firestore setup
├── categories.js         # Category names and their word lists
└── index.css               # Tailwind import and global styles
```

## Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/aryabc2004/Chameleon.git
   cd Chameleon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your own Firebase project config:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

   Open the local URL it prints (usually `http://localhost:5173`).

## Deployment

The app is set up for continuous deployment on Netlify: any push to `main` triggers an automatic rebuild and redeploy. Firebase environment variables are configured separately in Netlify's site settings, since `.env` is not committed to the repo.

## Firebase Setup

This project uses Firestore in a single `lobbies` collection — one document per game room, containing player list, round state, hints, and votes, all synced live via `onSnapshot` listeners. See `firebase.js` for the connection setup.


## Future Features
 
- Bot / AI players for solo or smaller-group games (UI stub already in place)
- Tighter Firestore security rules, scoped to authenticated players rather than open read/write
- Presence detection to handle disconnects and abandoned lobbies automatically
- A round cap on the tie-breaking loop, with a defined fallback outcome
- User-created custom categories, beyond the built in list.

## License

Personal project — not currently licensed for reuse.