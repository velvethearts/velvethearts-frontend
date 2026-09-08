# Velvet Hearts Frontend

Last updated: September 8th, 2026 (v1.2.0 Release)  
Source of truth: `/docs/Administrator_Manual.docx` and `/docs/User_Manual.docx`

This folder contains the Velvet Hearts browser application. It is a Vite + React single-page application that serves the public landing page, registration/login flow, onboarding, discover, matching, chat, profile, settings, safety center, and admin UI surfaces.

Velvet Hearts is a safety-oriented dating and connection platform. The frontend is responsible for the user experience, local UI state, Firebase Google Sign-In, REST API calls to the backend, and Socket.IO client connections.

## What is in this folder

| Path | Purpose |
|---|---|
| `src/App.jsx` | Top-level application shell, dynamic `document.title` routing, tab navigation, approval-gated UI states, route-level `React.lazy()` code splitting with `<Suspense>`, theme-aware `ErrorBoundary` with reload action, and admin sub-page routing. |
| `src/context/AppContext.jsx` | Main client state provider: session restoration, profile hydration (including Spark Notes), discover/match/chat actions, feature tour orchestration, local settings, Socket.IO lifecycle, and HMR context fallback resilience. |
| `src/lib/api.js` | REST API client, access/refresh token storage, automatic token refresh retry on `401`, and endpoint wrappers. |
| `src/lib/firebase.js` | Firebase Web SDK initialization and Google popup sign-in helper. |
| `src/lib/socket.js` | Socket.IO client setup and helpers for joining/leaving conversations and typing events. |
| `src/pages/Auth` | Phone number entry, Google account linking, and Google sign-in screens. |
| `src/pages/Onboarding` | Multi-step profile setup flow including Step 4 2-minute voice snippet recording and mandatory face quality validation. |
| `src/pages/Discover` | Discover feed, profile search/filtering, deck/grid view modes (with `Invite Sent ✓` retention in grid view), and discover preferences. |
| `src/pages/Matches` | Mutual connections carousel, Instagram-style floating Spark Notes (20-char limit, vertical multi-line stacking, interactive 1-tap note replies), 24h spark countdown ring, 3s long press voice playback, sound equalizer, and sent interests. Injects tour demo items during guided walkthrough. |
| `src/pages/Chat` | Chat list with conversation pinning, conversation view with individual message pinning, typing events, slow-connection image compression, and block/report actions. |
| `src/pages/Profile`, `src/pages/ProfileDetail` | Own-profile view/editing, 2-minute voice intro management (play, 1-tap delete, re-record), face cross-referencing, and profile detail views. |
| `src/pages/Settings` | Theme, accessibility, notification preferences, interactive app tour replay trigger, and account deletion. |
| `src/pages/Safety` | Safety center, blocked users, report history, and support entry. |
| `src/pages/Admin` | Admin dashboard, pending registration and photo verification queues, warning manager, and phone/audit history UI. |
| `src/components/UI/FeatureTourGuide.jsx` | Multi-page 12-step interactive onboarding tour guide with transparent spotlight masks, keyboard trapping, smart viewport visibility, and account-scoped persistence. |
| `src/components/UI/WarningAlertModal.jsx` | User-facing compliance warning modal displaying violation details, severity tags, 24h countdown deadline, and appeal submission with proof image upload. |
| `src/components/UI/PhotoVerificationModal.jsx` | Biometric pose selfie capture modal submitting photo verification requests to the admin queue. |
| `src/components/UI/VoiceRecorder.jsx` | HTML5 MediaRecorder 2-minute voice snippet recorder component. |
| `src/components/UI/PWAInstallModal.jsx` | PWA install prompt modal with custom pill-shaped action buttons. |
| `src/utils/faceBiometrics.js` & `src/utils/imageFingerprint.js` | Client-side face detection, primary photo quality gate, secondary photo cross-referencing, and perceptual duplicate image hash detection. |
| `src/components` | Shared UI and app components. |
| `src/assets` | Static images used by the app. |
| `public/llms.txt` & `public/llms-full.txt` | Standardized LLM grounding files (llmstxt.org) establishing brand identity and entity disambiguation for AI search engines. |
| `public/robots.txt` & `public/sitemap.xml` | Search engine indexing, AI crawler permissions (`GPTBot`, `PerplexityBot`, `ClaudeBot`), and directive files. |
| `public` | Public static assets such as favicon, icons, manifest, and service worker. |
| `.env.example` | Example frontend environment variable names. Values are placeholders only. |
| `package.json` | Frontend scripts and dependencies. |
| `vite.config.js` | Vite configuration with Rollup `manualChunks` code splitting and `esbuild` console drop. |

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

- Public landing page introduces the platform with preloaded high-priority hero branding (`velvet-heart-logo.png`), semantic `<main>` HTML5 layout, and an interactive **Frequently Asked Questions (FAQ) Accordion**.
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
- 2-Minute Voice Intro Snippet recording option (Step 4).
- Disability information and visibility preference.
- **Photos & Mandatory Face Quality Gate**: Requires a clear, single human face on Primary Photo (Slot #1) validated via client-side face biometrics before submission can proceed. Rejects obscured, group, or non-human primary photos. Secondary photos (slots 2-6) provide real-time cross-reference similarity cues. Duplicate image hash detection prevents identical photo uploads.

### Approval gate

Pending users see an under-review state for restricted social features. Full access is available only after backend approval.

### Discover and matching

Approved users can:

- Browse the discover feed with Vibe Match calculations (starting from 50%).
- Search and filter profiles.
- **0ms Instant Discover Render**: LocalStorage profile caching (`vh-discover-profiles`) with quiet background syncing and preloaded candidate card images.
- **Super Spark & Card Progression**: Instant card deck progression when sending an interest or Super Sparking (`'super'`).
- Save profiles locally.
- Send interests.
- Create mutual matches when interest is reciprocal.
- Access the **Recent Sparks** interactive story carousel:
  - **24-Hour Spark Countdown Ring**: Rose-gold SVG timer ring (`#F3C68F` → `#FF6B81`) displayed during the first 24 hours of matching if no text has been sent yet.
  - **24h Unsent Notice Toast**: Automatic notification toast triggered after 24 hours if users haven't chatted.
  - **3-Second Long Press Voice Playback**: Holding any spark circle for 3 seconds plays their 2-minute voice snippet with live animated sound equalizer waves overlay and glowing pulse aura.
  - **Quick Icebreaker Popover**: Floating chips (`Say Hello`, `Coffee?`, `Nudge Spark`) for instant connection starters.
  - **Dynamic Avatar Rings**: Emerald green glowing rings for online matches, Velvet Burgundy & Rose Gold borders for offline matches.

### Chat

Approved matched users can chat. The frontend uses REST for persisted messages and Socket.IO helpers for room/typing behavior.
- **Individual Message Pinning (Instagram-Style)**: Pin or unpin any individual message bubble. Displays a sticky pinned message banner below the active chat header with sender attribution and snippet preview. Tapping the banner smoothly scrolls to the message and highlights it with an ambient pulse animation; single-tap unpinning via banner or message action button. Persisted per conversation in `localStorage`.
- **Conversation Pinning**: Direct pin/unpin action buttons on conversation list items and within the 3-dots chat header options menu. Pinned conversations dynamically float to the top of the conversation list.
- **Message Replies**: Quoted replies, active glassmorphic reply banner, quoted cards inside message bubbles, and smooth scroll-to-quoted-message with rounded pulse highlight animation (`.voice-note-player`, `.message-bubble-text`, `.message-image-attachment`, `.message-video-attachment-wrapper`, `.message-file-attachment`, `.quoted-reply-card`).
- **Mobile Viewport & Layout Ergonomics**:
  - Completely eliminated bottom gaps below the chat input box across all screens via dynamic `100dvh` layout sizing.
  - Replaced `scrollIntoView()` with container-only scrolling (`chatLogContainerRef.current.scrollTo`), preventing mobile window scroll displacement and ensuring the chat back button is never obscured.
  - Locked viewport scrolling (`body.chat-active-conversation`) and automatically hid the bottom navigation bar while inside active conversations.
  - Instant unread badge clearing upon viewing a conversation without requiring navigation away and back.
- **Slow-Connection Client Compression**: Camera photos (4MB–12MB) are automatically compressed client-side to ~150KB–250KB before upload, ensuring instantaneous delivery even on weak mobile data connections.
- **Lightbox Media Viewer**: Fullscreen image preview with loading spinners, retry controls, and auto-dismiss on background tap.
- **Low-Latency Messaging**: Optimized in-memory conversation target resolution (eliminating blocking `await api.getConversations()` calls) and non-blocking background push notification dispatching.

### Profile management

Users can:
- Review public profile details and photos.
- Edit profile attributes with real-time secondary photo face cross-referencing against the primary profile photo.
- Manage 2-minute Voice Intro Snippets (play, 1-tap delete, or re-record) with direct database persistence.
- **Pose Selfie Photo Verification**: In-app photo verification modal capturing live pose selfies, generating biometric comparison metrics, and submitting verification requests to the admin review queue.
- **Deleted Account Fail-Safe Protection**: Global `handleUserNotFound(profileId)` auto-purges deleted accounts from local state/cache and alerts `"This user no longer exists or has deleted their account."` when attempting to interact with a non-existent account.

### PWA and Installation

- Custom PWA install prompt modal (`PWAInstallModal.jsx`) featuring redesigned pill-shaped **Install App** and **Not Now** action buttons.
- Standalone offline manifest support (`public/manifest.json`).

### Feature Tour Guide & Onboarding Walkthrough

- **12-Step Guided Walkthrough**: Interactive multi-page tour orchestrating transitions across Discover (Story Deck & Actions), Matches (Mutual Connections, 2-Minute Voice Intros with live sound equalizer, Received Super Sparks, Sent Interests tracking), Private Chat, Real-Time Notifications, Public Profile & Bookmarks, and Safety Center.
- **Crystal-Clear Targeted Spotlights**: Precise coordinate highlight masks with translucent backdrops, keeping targeted UI components 100% visible and uncluttered.
- **Accessibility & Focus Trapping**: Fully compliant keyboard isolation (`Tab` / `Shift+Tab` cyclic trapping, `Escape` key skip) and auto-restoring focus to the triggering element upon exit.
- **Smart Target Selection**: `findVisibleElement` ignores collapsed or off-screen viewport duplicates.
- **Account-Scoped Persistence**: State tracked via `vh-tour-completed-${uid}` so new accounts and reset accounts experience the tour once, with on-demand replay available anytime under **Settings → Interactive App Tour**.

### Performance & Vercel Optimizations

- **LCP Preloading & DNS Prefetch**: `velvet-heart-logo.png` preloaded in `index.html` head (`fetchpriority="high"`). DNS prefetch links for Firebase Auth and identity endpoints.
- **Bundle Code Splitting**: Rollup `manualChunks` in `vite.config.js` (`vendor-react`, `vendor-icons`, `vendor-utils`) and route-level `React.lazy()` code splitting with `<Suspense>` fallbacks in `App.jsx`.
- **Production Console Drop**: `esbuild: { drop: ['console', 'debugger'] }` strips logging statements in production builds to optimize main thread CPU performance.
- **SEO, Search Indexing & Generative Engine Optimization (GEO)**:
  - **AI Entity Grounding (`llms.txt` & `llms-full.txt`)**: Standardized AI scraper manifests (llmstxt.org) providing canonical context and disambiguating Velvet Hearts (`https://www.velvethearts.in`) from unrelated SMS/text quote mobile apps (`jnm.love.sms`).
  - **AI Crawler Permissions**: Explicit `Allow: /` rules in `robots.txt` for `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Amazonbot`, and `cohere-ai`.
  - Full `<noscript>` fallback content in `index.html` allowing JS-disabled search engines and LLM indexers to parse platform features and FAQs.
  - Dynamic `document.title` routing per active tab state.
  - Multi-schema JSON-LD structured data (`WebApplication`, `Organization`, `Brand`, `FAQPage`, `BreadcrumbList`) with explicit `disambiguatingDescription`.
  - Canonical links (`https://www.velvethearts.in/`), OpenGraph 1200x630 sharing cards, and Twitter summary cards.
  - Expanded `public/sitemap.xml` with 8 crawlable routes and priority hierarchy.
  - Crawler-friendly `public/robots.txt` with `Disallow: /assets/` and `Crawl-delay: 1`.
  - Semantic HTML5 landmarks, section `id`s, `aria-labelledby`, and `aria-controls` bindings on Landing Page.

### Safety and settings

Users can:

- Block users.
- Report users.
- Submit support-ticket-style entries from the Safety Center.
- **Compliance Warnings & Appeals**: Receive official compliance warnings (`WarningAlertModal.jsx`) detailing specific violation rules, severity levels (`LOW`, `MEDIUM`, `HIGH`), and a 24-hour compliance deadline countdown. Users can acknowledge the warning or submit an appeal with optional proof image attachments.
- Change theme, motion, contrast, text size, and notification preferences.
- Delete their account.

### Admin UI

Admin users can access:

- Dashboard stats with real-time counters.
- Pending registration verification queue.
- **Photo Verification Queue**: Side-by-side inspection of live pose selfie vs. primary profile photo with 1-tap Approve/Reject decisions and automatic badge assignment.
- **Warnings & Compliance Manager**: Issue warnings with preset violation templates, review user appeals and uploaded proof images, track 24h compliance statuses, and resolve warnings with real-time Socket.IO synchronization (`admin_warning_updated`).
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
