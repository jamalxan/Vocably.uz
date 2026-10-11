# Game Architecture - Vocabulary World
**Date:** 2026-10-11
**Stack:** Next.js 15, MongoDB/Mongoose, React Three Fiber (R3F), Three.js

## 1. High-Level Layering
To ensure the game doesn't bloat the main platform and remains secure, the architecture is divided into four strict layers:

### A. Presentation Layer (Client-side)
- **Route:** `/vocabulary-world` (Dynamic import)
- **HUD:** React-based overlay for XP, Level, and Quest objectives.
- **3D Runtime:** R3F Canvas managing the scene, lighting, and assets.
- **Controls:** Desktop (WASD + Mouse) and Mobile (Virtual Joystick).

### B. Game Domain Layer (Client-side Logic)
- **GameEngine:** Manages the state machine (`ready` $\rightarrow$ `in_progress` $\rightarrow$ `completed`).
- **Mode Registry:** Handles the logic for different mini-games (Memory Match, Runner, etc.).
- **Input Manager:** Translates raw inputs into game actions (Move, Interact).

### C. Game Application Layer (Server-side Actions)
- **Auth Guard:** Uses existing `auth()` to verify identity.
- **Session Manager:** Creates and validates `GameSession` documents in MongoDB.
- **Scoring Engine:** Calculates XP and Grades server-side to prevent spoofing.
- **SRS Adapter:** Integrates with `src/lib/models.js` to fetch words due for review.

### D. Data Layer (MongoDB)
- **User Model:** (Existing) Source of truth for vocabulary and total XP.
- **GameSession:** (New) Tracks active sessions, prompts, and attempts.
- **WorldProgress:** (New) Tracks unlocked areas and achievements.
- **ReviewEvent:** (Existing) Audit log for all vocabulary attempts.

## 2. Data Flow (The "Anti-Spoof" Loop)
1. **Start:** Client requests a session $\rightarrow$ Server creates `GameSession` $\rightarrow$ Returns initial state.
2. **Prompt:** Server fetches a word via `VocabularyAdapter` $\rightarrow$ Returns prompt (without the answer).
3. **Interaction:** Client sends `interactionEvent` (e.g., "picked gate B") $\rightarrow$ Server validates against session context.
4. **Reward:** Server calculates score $\rightarrow$ Updates `User.xp` and `ReviewEvent` $\rightarrow$ Returns success/fail.

## 3. Performance Strategy
- **Dynamic Loading:** The entire `@react-three/fiber` and `three` bundle is loaded only on the `/vocabulary-world` route using `next/dynamic`.
- **Asset Pipeline:** GLB models are hosted on S3/CDN and loaded via `useGLTF` with a loading manager.
- **Frame-Rate Independence:** All movement uses `deltaTime` to ensure consistent speed across devices.
