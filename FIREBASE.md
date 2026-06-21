# Firebase setup

This app uses **Firebase Auth (Google only)** + **Cloud Firestore**. Local
development runs against the **emulators** with zero credentials; production
uses your real Firebase project.

## Local development (emulators)

```bash
npm install
npm run dev   # boots Auth (:9099) + Firestore (:8080) emulators, then Vite (:4000)
```

`npm run dev` runs `scripts/dev.sh`, which uses `firebase emulators:exec` to bring
up the Auth + Firestore emulators on the offline `demo-uno` project, start Vite
with `VITE_APP_ENV=dev`, and tear it all down on Ctrl+C. Emulator UI is on :4001.
Click **Continue with Google** → the Auth emulator shows a fake account picker, so
you can sign in without real Google OAuth. Firestore data is in-memory and resets
on each run. (Need just the emulators? `npm run emulators`.)

## Production setup (your real project)

You already have a project. Do these once in the Firebase console:

1. **Authentication → Sign-in method →** enable **Google**.
2. **Authentication → Settings → Authorized domains →** add the domain you
   deploy to (localhost is allowed by default).
3. **Project settings → Your apps → Web app →** copy the config values.

Then provide the config as build-time environment variables (the `VITE_` prefix
exposes them to the client; these web-config values are public by design —
access is enforced by `firestore.rules`):

```
VITE_APP_ENV=prd
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

For local production-style builds, put them in an env file Vite loads only in
build mode — e.g. `.env.production.local` (already git-ignored via `*.local`).
In CI/hosting, set them as environment variables instead.

## Deploy rules & indexes

`.firebaserc` already targets your real project (`uno-scores-eed2f`):

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

## Data model

```
users/{uid}                     profile mirror (displayName, email, photoURL, …)
games/{gameId}                  ownerId, name, status: active|finished,
                                players: [{ id, name, baseline }], finishedAt, …
games/{gameId}/rounds/{roundId} ownerId (denormalized), roundNumber,
                                results: [{ playerId, points }], …
```

- **Penalty scoring:** lowest total leads; the round winner is the lowest score
  that round.
- A player's total = `baseline + Σ` their points across rounds. Rounds are the
  source of truth, so editing/deleting a round recomputes totals and stats.
- `baseline` carries imported (migrated) totals and is **excluded** from
  round-level stats.
- The Stats page aggregates the `rounds` collectionGroup filtered by `ownerId`.
