# TheGauge

AI mock interview practice. Record spoken answers by voice, get them transcribed in the browser, and receive scored feedback on confidence, clarity, structure and pacing.

## Features

- Voice-recorded practice interviews across seven roles and 67 questions
- In-browser speech transcription with no third-party API or key
- Scoring derived from the transcript: filler words, hedging, STAR structure, words per minute
- Audio playback of every answer, from any device you sign in on
- Per-session reports with per-question breakdown and rule-based improvement areas
- Progress tracking across sessions

## Tech Stack

- Next.js 16 (App Router, Turbopack) and React 19
- TypeScript in strict mode
- Tailwind CSS v4
- Firebase Authentication and Cloud Firestore
- Recharts, Zod, Sonner, lucide-react

## Setup

Requires Node.js 20 or newer and a Firebase project.

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root. All six are required. If any is missing, `next build` fails and names exactly which ones, so a misconfigured deploy never goes live.

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console, Project settings, General, Your apps, Config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same panel |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same panel |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same panel |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same panel |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same panel |

These are client-side values and are safe to expose in the browser bundle. Firestore security rules, not key secrecy, protect user data.

### Firebase Setup

1. **Enable Authentication.** Console, Authentication, Sign-in method. Enable both **Email/Password** and **Google**, since the sign-in screen offers both. A disabled provider fails with `auth/operation-not-allowed`.
2. **Create a Firestore database.** Console, Firestore Database, Create database.
3. **Publish the security rules.** Either paste [`firestore.rules`](./firestore.rules) into Console, Firestore, Rules, Publish, or run:
   ```bash
   npx firebase login
   npx firebase deploy --only firestore:rules
   ```
   Without this, every read fails with `Missing or insufficient permissions`.

## Running

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

## Deployment

Works on any host that supports Next.js. Vercel and Netlify both need two manual steps.

1. **Set the environment variables** in your host's dashboard. `.env` is gitignored, so the build fails until you add all six values there.
2. **Authorise your domain in Firebase.** Console, Authentication, Settings, Authorized domains, then add your `*.vercel.app` or `*.netlify.app` domain. Sign-in fails with `auth/unauthorized-domain` on any origin not on that list, even though localhost works.

## Architecture

```
app/
  libs/            Domain logic, framework free
    env.ts               Zod validation of Firebase config
    firebase.ts          SDK initialisation
    sessions.ts          Firestore reads and writes
    session-types.ts     Shared domain types
    scoring.ts           Tiers and derived session metrics
    speech-analysis.ts   Transcript scoring engine
    speech-patterns.ts   Filler, hedge and STAR vocabularies
    recommendations.ts   Rule-based improvement areas
    audio-store.ts       AudioStore interface
    firestore-audio-store.ts  Chunked audio persistence
    recording-storage.ts Selects the active audio backend
  hooks/           React state over those libraries
  components/      Dashboard UI
  <route>/         Route segments with their own components
components/        Shared UI used across routes
```

**Data model.** Sessions live at `users/{uid}/sessions/{sessionId}`. Audio lives beneath each session at `recordings/{questionNum}`, holding metadata plus a `chunks` subcollection. Firestore caps a document at 1 MiB, so base64 audio is split into 700,000 character chunks and written in a single batch. Chunk ids are zero padded so ordering by name reassembles them correctly.

**Why Firestore holds the audio.** Cloud Storage for Firebase requires the Blaze plan. Firestore is available on the free Spark plan, reuses the same owner-only security rules, and needs no second provider. It is a deliberate trade-off rather than the ideal design: 1 GiB of free storage is roughly 250 sessions. Swapping to Cloud Storage means writing one `AudioStore` implementation and changing the single line in `recording-storage.ts`.

**Scoring.** Nothing is random and nothing calls a paid API. `useSpeechTranscription` runs the browser Web Speech API alongside `MediaRecorder`, then `analyseTranscript` derives every metric from that text and the measured duration. Answers with no detected speech are marked `analyzed: false`, shown as not scored, and excluded from averages and charts.

## Known Limitations

- **Firefox does not implement the Web Speech API.** Recording and playback work there, but answers are not transcribed or scored. The session screen warns before recording.
- **Transcription accuracy depends on the browser engine.** Accents, background noise and technical vocabulary all affect it, and the scores inherit that error.
- **Filler detection is conservative.** Words like "like", "actually" and "basically" are not counted, because distinguishing filler use from ordinary use needs real parsing. Counts undercount rather than accuse.
- **Free tier limits.** Spark allows 1 GiB stored, 50,000 reads and 20,000 writes per day across all users.
