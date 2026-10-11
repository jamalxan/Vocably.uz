# Implementation Plan - Vocabulary World
**Date:** 2026-10-11
**Owner:** Claude Code
**Status:** Active

## 1. Strategy Overview
The implementation will follow a "Vertical Slice" approach. Instead of building all systems partially, we will build one fully functional path (Starter Island $\rightarrow$ Memory Match) to verify the entire pipeline from MongoDB to 3D Render.

## 2. Phase-by-Phase Execution

### Phase 1: Infrastructure (Current)
- [ ] Setup `/vocabulary-world` route with `next/dynamic` loading.
- [ ] Implement `WorldCanvas` (R3F Base) and `GameEngine` state machine.
- [ ] Build `VocabularyAdapter` to bridge `src/lib/models.js` $\rightarrow$ Game Prompts.
- [ ] Create `GameSession` and `WorldProgress` Mongoose schemas.

### Phase 2: Backend & Security
- [ ] Implement Server Actions for `startSession`, `submitAnswer`, `finishSession`.
- [ ] Add `auth()` guards and ownership validation for all game APIs.
- [ ] Implement idempotent XP awarding logic in `XpEvent` collection.

### Phase 3: 3D Foundation (Starter Island)
- [ ] Implement Player Controller (WASD/Joystick) with `deltaTime` smoothing.
- [ ] Build Basic Terrain and Environment (Starter Island).
- [ ] Implement Third-Person Camera with collision avoidance.
- [ ] Integrate `SoundManager` for ambient and UI audio.

### Phase 4: Memory Match (The First Slice)
- [ ] Build the 3D Memory Match game loop.
- [ ] Connect to `VocabularyAdapter` for dynamic word pairs.
- [ ] Implement server-side validation of matches.
- [ ] Integrate result summary and XP reward flow.

### Phase 5: Word Runner & Word Lab
- [ ] Implement "Gate" collision system for Word Runner.
- [ ] Build the Lab interaction UI (Spelling/Listening).
- [ ] Connect both modes to the common `GameEngine`.

### Phase 6: Boss Battle
- [ ] Build the Boss State Machine (Intro $\rightarrow$ Attack $\rightarrow$ Defeat).
- [ ] Implement "Answer-to-Damage" logic.
- [ ] Implement Victory/Defeat server-side verification.

### Phase 7: Visual Polish & Production
- [ ] Replace primitive placeholders with licensed GLB assets.
- [ ] Implement PBR Materials and Lighting/Fog.
- [ ] Performance Profiling (FPS, Draw Calls) on mobile/desktop.
- [ ] Full Regression Testing of existing Vocably features.

## 3. Definition of Done (DoD)
A phase is "Done" only when:
1. Code is committed.
2. Unit/Integration tests pass.
3. Result is verified in a real browser (screenshots attached to `PRODUCTION_VERIFICATION_REPORT.md`).
4. No regressions in the main Vocably platform.
