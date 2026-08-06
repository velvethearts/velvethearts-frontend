# Velvet Hearts Frontend

Last updated: August 6th, 2026  
Source of truth: `/docs/Administrator_Manual.docx` and `/docs/User_Manual.docx`

This folder contains the Velvet Hearts browser application. It is a Vite + React single-page application that serves the public landing page, registration/login flow, onboarding, discover, matching, chat, profile, settings, safety center, and admin UI surfaces.

Velvet Hearts is a safety-oriented dating and connection platform. The frontend is responsible for the user experience, local UI state, Firebase Google Sign-In, REST API calls to the backend, and Socket.IO client connections.

## What is in this folder

| Path | Purpose |
|---|---|
| `src/App.jsx` | Top-level application shell, tab routing, approval-gated UI states, and admin sub-page routing. |
| `src/context/AppContext.jsx` | Main client state provider: session restoration, profile hydration, discover/match/chat actions, local settings, and Socket.IO lifecycle. |
| `src/lib/api.js` | REST API client, access/refresh token storage, automatic token refresh retry on `401`, and endpoint wrappers. |
| `src/lib/firebase.js` | Firebase Web SDK initialization and Google popup sign-in helper. |
| `src/lib/socket.js` | Socket.IO client setup and helpers for joining/leaving conversations and typing events. |
| `src/pages/Auth` | Phone number entry, Google account linking, and Google sign-in screens. |
| `src/pages/Onboarding` | Multi-step profile setup flow. |
| `src/pages/Discover` | Discover feed, profile search/filtering, and discover preferences. |
| `src/pages/Matches` | Mutual connections and sent interests. |
| `src/pages/Chat` | Chat list, conversation view, typing events, block/report actions. |
| `src/pages/Profile`, `src/pages/ProfileDetail` | Own-profile view/editing and profile detail views. |
| `src/pages/Settings` | Theme, accessibility, notification preferences, and account deletion. |
| `src/pages/Safety` | Safety center, blocked users, report history, and support entry. |
| `src/pages/Admin` | Admin dashboard, pending verification queue, and phone/audit history UI. |
| `src/components` | Shared UI and app components. |
| `src/assets` | Static images used by the app. |
| `public` | Public static assets such as favicon and icons. |
| `.env.example` | Example frontend environment variable names. Values are placeholders only. |
| `package.json` | Frontend scripts and dependencies. |
| `vite.config.js` | Vite configuration. |

## Main responsibilities

- Render the Velvet Hearts SPA through Vite and React.
- Initialize Firebase Web SDK for Google Sign-In.
- Send Firebase ID tokens to the backend for Google login/register.
- Store app-issued JWT access and refresh tokens in browser local storage.
- Call backend REST APIs under `VITE_API_URL`.
- Connect to the backend Socket.IO server for approved users.
- Enforce client-side UI gating for pending users while the backend enforces true authorization.
- Provide admin UI surfaces when `userRole` is `ADMIN` or `SUPER_ADMIN`.
- Persist local UI preferences such as theme, accessibility options, and notification settings.

## Technology stack

| Area | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing/navigation | App-level React state and tabs |
| Icons | `@phosphor-icons/react` |
| Authentication client | Firebase Web SDK |
| Realtime client | `socket.io-client` |
| Linting | ESLint |

## Prerequisites

- Node.js and npm installed.
- A running backend service, either local or deployed.
- Firebase Web app configuration values.
- For full social/admin testing, a database with users in appropriate approval/role states.

The repository does not declare a specific Node engine in `package.json`. Use a current Node LTS version compatible with the installed Vite/React toolchain.

## Environment variables

Create a local `.env` file in `/frontend`. Vite exposes only variables prefixed with `VITE_`, so do not place backend secrets in this file.

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend REST API and Socket.IO server. | `http://localhost:4000` or `https://your-render-service.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK API key. | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain. | `project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID. | `velvet-hearts-prod` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase app config field. Cloudinary is used for application uploads. | `project-id.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase app config field. | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Firebase Web app ID. | `1:123:web:abc` |

Security notes:

- These variables are bundled into the client and must be treated as public configuration.
- Never add backend secrets, JWT secrets, Cloudinary API secrets, database URLs, or Firebase Admin SDK private keys to the frontend.
- For local development, use non-production Firebase/backend resources where possible.

## Local development setup

From the repository root:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` with real local or staging values.

Start the development server:

```bash
npm run dev
```

Vite normally serves the app on:

```txt
http://localhost:5173
```

When using a local backend, the backend should allow this origin through `CORS_ORIGIN`, usually:

```txt
CORS_ORIGIN=http://localhost:5173
```

## Running with the backend locally

1. Start the backend first from `/backend`.
2. Confirm the backend health endpoint works:

   ```txt
   http://localhost:4000/health
   ```

3. Set frontend `VITE_API_URL` to:

   ```txt
   http://localhost:4000
   ```

4. Start the frontend:

   ```bash
   npm run dev
   ```

5. Open the Vite URL in a browser.

## Authentication and approval flow

The frontend follows the flow documented in the administrator manual:

1. A new user enters a phone number.
2. The user links a Google account through Firebase Google Sign-In.
3. Firebase Web SDK returns an ID token.
4. The frontend sends the token to `/api/v1/auth/google-register` or `/api/v1/auth/google-login`.
5. The backend verifies the Firebase ID token and issues app JWTs.
6. The frontend stores the access and refresh tokens.
7. Pending users can complete onboarding but cannot use discover, matches, or chat.
8. Approved users can access social features.

Development note: `src/lib/firebase.js` contains a local development Google-auth bypass controlled by local storage. This is only intended for development mode and must not be treated as production authentication.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Create a production build in `dist`. |
| `npm run preview` | Preview the built production bundle locally. |
| `npm run lint` | Run ESLint against the frontend project. |

## Building for production

```bash
cd frontend
npm install
npm run build
```

The build output is:

```txt
frontend/dist
```

Preview the production build:

```bash
npm run preview
```

## Production deployment on Vercel

The administrator manual identifies Vercel as the frontend host.

Recommended Vercel project settings:

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework preset | Vite |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `dist` |

Deployment checklist:

1. Import the GitHub repository into Vercel.
2. Set the project root directory to `frontend`.
3. Configure all `VITE_*` environment variables for production.
4. Deploy.
5. Copy the production Vercel origin.
6. Add that origin to backend `CORS_ORIGIN`.
7. Add the Vercel domain to Firebase Authentication authorized domains if required.
8. Smoke test landing, sign-up, sign-in, onboarding, under-review, discover, chat, settings, and admin access with appropriate test accounts.

Important: Vite client environment variables are baked into the build. If you change a `VITE_*` value in Vercel, redeploy the frontend.

## Feature overview

### Landing and authentication

- Public landing page introduces the platform.
- Sign-up collects phone number and then links a Google account.
- Sign-in authenticates returning users through the registered Google account.

### Onboarding

Collects profile information used for approval and discovery:

- Name and date of birth.
- City.
- Gender/orientation and visibility preferences.
- Relationship intent and relationship status.
- Interests.
- Story/about section.
- Disability information and visibility preference.
- Photos.

### Approval gate

Pending users see an under-review state for restricted social features. Full access is available only after backend approval.

### Discover and matching

Approved users can:

- Browse the discover feed.
- Search and filter profiles.
- Save profiles locally.
- Send interests.
- Create mutual matches when interest is reciprocal.

### Chat

Approved matched users can chat. The frontend uses REST for persisted messages and Socket.IO helpers for room/typing behavior.

### Safety and settings

Users can:

- Block users.
- Report users.
- Submit support-ticket-style entries from the Safety Center.
- Change theme, motion, contrast, text size, and notification preferences.
- Delete their account.

### Admin UI

Admin users can access:

- Dashboard.
- Pending verification queue.
- User approval/rejection controls.
- Phone/audit history surfaces.

Backend authorization remains the source of truth for admin permissions.

## Troubleshooting

| Problem | Likely cause | What to check |
|---|---|---|
| `Backend API URL is not configured` | `VITE_API_URL` missing or empty. | Set `VITE_API_URL` in `/frontend/.env` and restart Vite. |
| Firebase popup fails | Firebase config missing, popup blocked, or unauthorized domain. | Check all `VITE_FIREBASE_*` values and Firebase authorized domains. |
| Google login says account not found | Google email is not registered as an active user. | Register first or use the Google account originally linked during signup. |
| User remains under review | Account is still `PENDING`. | Admin must approve the user in the backend/admin panel. |
| Approved user still appears pending | Stale JWT or stale session state. | Sign out/in or refresh token; confirm backend `approvalStatus`. |
| REST calls fail with CORS error | Backend `CORS_ORIGIN` does not match frontend origin. | Set exact Vercel/local origin in backend environment. |
| Socket connection fails | Wrong API URL, invalid/expired JWT, or CORS mismatch. | Check `VITE_API_URL`, backend logs, token state, and `CORS_ORIGIN`. |
| Build fails on Vercel | Wrong root directory, missing env vars, dependency issue. | Confirm root is `frontend`, build command is `npm run build`, and env vars exist. |
| Firebase works locally but not in production | Production domain not authorized. | Add the production Vercel domain in Firebase Authentication settings. |
| Images do not persist as expected | Upload/profile save flow is incomplete or backend upload failed. | Check backend `/upload`, Cloudinary credentials, and profile save response. |

## Operational notes

- The frontend is not the source of truth for roles, approval, deletion, or suspension. The backend enforces those rules.
- Local storage is used for app tokens and UI preferences; signing out clears app auth state.
- Support contact from the user manual: `velvethearts.in@gmail.com`.
- Full production setup and operational procedures are documented in `/docs/Administrator_Manual.docx`.
