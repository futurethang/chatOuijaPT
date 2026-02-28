# Chat OuijaPT — Production Polish: The Séance Experience

## Mission

Transform Chat OuijaPT from a functional Ouija board demo into an **atmospheric, immersive séance experience**. The tech is simple — it's a chat interface over GPT. The experience is everything. Every pixel, every sound, every millisecond of timing must serve the mood: you are sitting in a dark room, candles guttering, mist curling at your feet, and something on the other side is trying to speak.

This is a Next.js 15 app (React 19, TypeScript, SCSS modules). The codebase is small and well-organized. All work happens in `src/app/` and `src/components/`.

---

## Architecture Context

**Key files you'll be modifying:**

| File | Purpose |
|---|---|
| `src/app/page.tsx` | Root component, state machine (`idle`, `touch`, `asking`, `revealing`, `revealed`, `error`). Add `initializing` mode. |
| `src/app/page.module.scss` | Main layout styles. Intro animation classes, candle glow, responsive adjustments. |
| `src/app/globals.scss` | CSS custom properties, global keyframes. New flicker/candle keyframes go here. |
| `src/components/MistEffect.tsx` | 4-layer mist + vignette. Needs intensity prop, edge-hugging behavior, intro density transition. |
| `src/components/MistEffect.module.scss` | Mist layer animations. Intro state (dense) → idle state (parted center, dense edges). |
| `src/components/LetterFade.tsx` | Per-character reveal with phase animation (in/hold/out). Needs slower timing, jitter, initial pause, sound + haptic triggers. |
| `src/components/LetterFade.module.scss` | Letter glow/fade styles. Adjust phase split, ghost trail persistence. |
| `src/components/Loading.tsx` | "Reaching across the veil..." spinner. May add rumble sound trigger here. |

**Files you'll create:**

| File | Purpose |
|---|---|
| `src/hooks/useSoundscape.ts` | Custom hook for Web Audio API sound management. Preloads audio, exposes `startAmbient()`, `playWhisper()`, `playLetterTick()`, `playRumble()`, `playGoodbye()`, `stopAll()`. |
| `public/sounds/*.mp3` (or `.webm`/`.ogg`) | Audio assets — ambient loop, letter tick, whisper, rumble, goodbye. See Sound Design section for specs. |

**Existing dependencies (no new packages needed):**
- `next`, `react`, `react-dom`, `sass`, `openai`
- Web Audio API (browser-native)
- Vibration API (browser-native, already used in `TouchGate.tsx`)

---

## Implementation Specifications

### 1. Sound Design (HIGHEST PRIORITY)

Create a `useSoundscape` hook using the Web Audio API. No external libraries.

**Hook API:**
```typescript
interface Soundscape {
  startAmbient: () => void      // Fade in ambient drone loop
  stopAmbient: () => void       // Fade out ambient
  playRumble: () => void        // Low rumble while waiting for spirit
  stopRumble: () => void        // Stop rumble when response arrives
  playWhisper: () => void       // Breathy exhale when reveal starts
  playLetterTick: () => void    // Tiny organic tap per letter
  playGoodbye: () => void       // Final/closing sound
  setMasterVolume: (v: number) => void
  isReady: boolean              // True once all audio buffers are decoded
}
```

**Implementation details:**
- Single shared `AudioContext`, created on first user interaction (browser autoplay policy requires user gesture).
- Use `fetch()` + `decodeAudioData()` to preload all sound files into `AudioBuffer` objects.
- Ambient loop: connect to a `GainNode` at 0.10-0.15 gain. Use `loop = true` on the `AudioBufferSourceNode`. Fade in/out using `gainNode.gain.linearRampToValueAtTime()`.
- Rumble: separate `GainNode` at ~0.12 gain, loop while active, fade in over 500ms.
- Letter tick, whisper, goodbye: one-shot playback. Create a new `AudioBufferSourceNode` each time (they're single-use by spec). Gain ~0.2-0.3.
- All gain values should be conservative. The sounds should be felt, not blasted.
- Provide a mute/volume toggle (small speaker icon, bottom corner). Persist preference in `localStorage`.

**Audio assets needed:**
You'll need to source or generate 5 audio files. Place them in `public/sounds/`. Acceptable formats: `.mp3` or `.webm`. Keep files small (<200KB each, ambient loop can be up to 500KB).

1. `ambient-loop.mp3` — 15-30 second seamless loop. Low wind, distant atonal hum, barely audible texture. Think: empty church at midnight.
2. `letter-tick.mp3` — <0.5 second. Organic tap — fingernail on glass, quiet wooden creak, or a soft pluck. Not a UI click. Not digital.
3. `whisper.mp3` — 1-2 seconds. Breathy exhale with slight reverb. Gender-neutral. Not a word, just breath.
4. `rumble.mp3` — 3-5 second loop. Subsonic low-frequency texture. Felt more than heard. Think: the floor vibrating.
5. `goodbye.mp3` — 1-2 seconds. Something final. A distant door closing, wind dying down, a low resonant tone fading.

**If you cannot source audio files**, generate them programmatically using the Web Audio API's `OscillatorNode` and noise generation. This is acceptable for the rumble and ambient. For the tick, a short burst of filtered noise works. Document this approach with comments.

**Integration points in existing code:**
- `page.tsx`: Call `startAmbient()` when mode transitions from `initializing` → `idle`
- `page.tsx`: Call `playRumble()` when mode → `asking`, `stopRumble()` + `playWhisper()` when mode → `revealing`
- `LetterFade.tsx`: Call `playLetterTick()` at the start of each character's `in` phase
- `page.tsx`: Call `playGoodbye()` when the revealed response is "GOOD BYE"

---

### 2. Opening Ceremony (Initializing Experience)

Add a new mode `'initializing'` to the state machine. This is the default mode on mount, before `idle`.

**Sequence (~4-5 seconds total, CSS-driven):**

| Beat | Time | What happens |
|---|---|---|
| 1 | 0s | Screen is pure black. Mist begins rolling in — thick, full opacity, all layers at max. |
| 2 | ~1.5s | Candlelight glow begins pulsing at viewport edges. Ambient sound fades in. |
| 3 | ~2.5s | Mist parts in center (opacity transition on mist layers). Planchette fades up — opacity 0→1, scale 0.92→1.0, ease-out. |
| 4 | ~4.0s | Title "Chat OuijaPT" resolves (opacity 0→0.25). Controls slide up from below (translateY). |
| 5 | ~4.5s | `animationend` event on last sequenced element → `setMode('idle')`. Ready. |

**Implementation:**
- Add `initializing` to the `AppMode` type union.
- Set initial state: `useState<AppMode>('initializing')`.
- Add a CSS class `.initializing` on `<main>` when mode is `initializing`.
- All sequenced animations use `animation-delay` on child elements — no JavaScript timers.
- The planchette, title, and controls start with `opacity: 0` and `pointer-events: none` during `initializing`.
- Listen for `animationend` on the controls wrapper (the last element to animate in) to transition to `idle`.
- Mist component receives a prop like `phase: 'intro' | 'idle' | 'active'` to control density.

**CSS approach:**
```scss
.main.initializing {
  .planchetteArea {
    opacity: 0;
    animation: fadeInPlanchette 1.5s ease-out 2.5s forwards;
  }
  .title {
    opacity: 0;
    animation: fadeInTitle 1s ease-out 3.5s forwards;
  }
  .controls {
    opacity: 0;
    transform: translateY(30px);
    animation: slideInControls 0.8s ease-out 4s forwards;
  }
}
```

---

### 3. Slower Letter Reveal + Haptics

**Current state:** 800ms per character, 25/45/30 phase split (in/hold/out), no jitter, no initial pause.

**New timing:**
- Base delay: **1300ms** per character (up from 800ms)
- Phase split: **20/35/45** (longer fade-out = more lingering presence)
  - `in`: 260ms (was 200ms)
  - `hold`: 455ms (was 360ms)
  - `out`: 585ms (was 240ms)
- **Random jitter:** ±150ms per character (`delay + (Math.random() * 300 - 150)`). Spirits don't keep time.
- **Initial pause:** 600ms before the first character begins. The spirit is arriving.
- **Ghost trail:** Slow the opacity decay in `.ghostTrail` — transition duration from current to ~0.8s.

**Haptic patterns (Vibration API):**
Guard all calls with `if ('vibrate' in navigator)`.

| Event | Pattern | Notes |
|---|---|---|
| Each letter appears (`in` phase start) | `navigator.vibrate(8)` | So short you question if you felt it |
| Spirit arrives (reveal starts, before first letter) | `navigator.vibrate([5, 30, 8, 50, 3])` | ~96ms total. Something shifting. |
| "GOOD BYE" revealed | `navigator.vibrate([10, 100, 10, 100, 10])` | Three deliberate taps. Unmistakable. |
| Error state | `navigator.vibrate(40)` | Single short buzz. Something went wrong on the other side. |

**Integration:**
- Modify `LetterFade.tsx` — adjust delay calculation, add jitter, add initial pause, fire haptic + sound on each `in` phase.
- Pass the `playLetterTick` callback as a prop or use context/ref.
- Add haptic calls in `page.tsx` for spirit-arrives, goodbye, and error events.

---

### 4. Candlelight Flicker

Replace the static vignette with a living, breathing candlelight effect.

**New keyframes in `globals.scss`:**
```scss
@keyframes candleFlicker1 {
  0%, 100% { opacity: 0.4; }
  20% { opacity: 0.55; }
  40% { opacity: 0.35; }
  60% { opacity: 0.5; }
  80% { opacity: 0.3; }
}

@keyframes candleFlicker2 {
  0%, 100% { opacity: 0.35; }
  30% { opacity: 0.5; }
  50% { opacity: 0.25; }
  70% { opacity: 0.45; }
}

@keyframes candleFlicker3 {
  0%, 100% { opacity: 0.3; }
  25% { opacity: 0.45; }
  55% { opacity: 0.2; }
  85% { opacity: 0.4; }
}
```

Use **prime-number-adjacent durations** (2.3s, 3.1s, 2.7s) so the flickers never synchronize — this creates organic, non-repeating patterns.

**Implementation:**
- Replace the single `.vignetteOverlay` in `MistEffect.module.scss` with 3 overlapping pseudo-elements (or 3 divs), each with:
  - A radial gradient from transparent center to warm amber/burnt-orange edges
  - Different `animation-duration` values
  - Slightly offset gradient centers (48% 50%, 52% 48%, 50% 52%)
- Add a very subtle full-screen ambient light pulse on `<main>`: opacity oscillating between 1.0 and 0.97 on a 4s cycle. Almost imperceptible but your brain registers it.

---

### 5. Enhanced Mist Behavior

**Current state:** 4 uniform layers drifting continuously. Static density.

**Changes:**

**A. Edge-hugging (idle state):**
Adjust the `background` radial gradients on mist layers to concentrate at the periphery. The center (where the planchette sits) should be mostly clear. Think: mist pooling at the edges of a room.

```scss
// Instead of centered gradients, use off-center ones that avoid the middle
background: radial-gradient(
  ellipse at 15% 50%,
  rgba($mist-color, 0.4) 0%,
  transparent 60%
);
```

**B. Reactive density (mode-driven):**
- `MistEffect` receives a `intensity` prop: `'intro' | 'idle' | 'active'`
  - `intro`: All layers at high opacity (0.6-0.8). Dense, obscuring.
  - `idle`: Current-ish opacity (0.3-0.5) with edge concentration.
  - `active` (during `asking`/`revealing`): Opacity bumps to 0.5-0.7. Mist creeps inward slightly. The spirit's presence thickens the air.
- Use CSS transitions on `.mistLayer` opacity (1s ease) so changes feel organic, not switched.

**C. Intro → idle transition:**
During `initializing`, mist layers have a class `.dense`. On transition to `idle`, the class is removed, and CSS transitions handle the fade from dense → edge-hugging over ~1.5s.

---

## Execution Strategy: Agent Team

Deploy **three parallel agents** to maximize throughput and manage context windows. Each agent owns a vertical slice and can work independently.

### Agent 1: Sound & Haptics
**Scope:** Everything audio and tactile.
- Create `src/hooks/useSoundscape.ts` with full Web Audio API implementation
- Generate or source audio assets → `public/sounds/`
- Add volume toggle UI (small speaker icon) to `page.tsx`
- Wire haptic patterns into `page.tsx` (spirit arrives, goodbye, error)
- Wire `playLetterTick` into `LetterFade.tsx`
- Add `playRumble`/`stopRumble` calls to asking/revealing mode transitions

**Validation:** Build succeeds. Hook initializes without errors. Ambient sound plays on first user interaction. Each letter tick fires during reveal. Haptic fires on mobile (or gracefully no-ops on desktop).

### Agent 2: Opening Ceremony + Mist Enhancement
**Scope:** The initializing experience and mist system upgrade.
- Add `'initializing'` to `AppMode` type in `page.tsx`
- Set initial mode to `'initializing'`
- Build CSS animation sequence in `page.module.scss` (planchette fade-in, title resolve, controls slide-up)
- Add `animationend` listener to transition `initializing` → `idle`
- Modify `MistEffect.tsx` to accept `intensity` prop (`'intro' | 'idle' | 'active'`)
- Update `MistEffect.module.scss` with edge-hugging gradients, density states, and intro → idle transition
- Wire `intensity` prop from `page.tsx` based on current mode

**Validation:** Build succeeds. On load, the full intro sequence plays (~4-5s). Mist starts dense and parts to reveal planchette. Mist intensifies during `asking`/`revealing` modes. No layout shift during transitions.

### Agent 3: Letter Reveal Pacing + Candlelight
**Scope:** Timing refinement and visual atmosphere.
- Modify `LetterFade.tsx`: new base delay (1300ms), phase split (20/35/45), random jitter (±150ms), initial 600ms pause
- Update `LetterFade.module.scss`: adjust transition durations to match new phase timing, extend ghost trail persistence
- Add candlelight flicker keyframes to `globals.scss`
- Replace static vignette in `MistEffect.module.scss` with 3 flickering candle-glow layers
- Add subtle ambient light pulse to `page.module.scss` on `<main>`

**Validation:** Build succeeds. Letter reveal feels noticeably slower and more suspenseful. Each letter has slightly different timing (jitter). Candlelight flicker is visible at viewport edges and never synchronizes into a pattern. Ghost trail lingers longer.

### Integration & Final Validation
After all three agents complete:
- Run `npm run build` — must succeed with zero errors
- Run `npm run lint` — must pass
- Verify no TypeScript errors
- Manual checklist:
  - [ ] App loads with full intro ceremony
  - [ ] Ambient sound fades in during intro
  - [ ] Mist parts to reveal planchette
  - [ ] Candlelight flickers at edges
  - [ ] Typing a question and submitting triggers rumble sound
  - [ ] Spirit response reveals slowly with jitter and letter ticks
  - [ ] Haptic pulses are present but extremely subtle
  - [ ] "GOOD BYE" response triggers farewell sound + triple-tap haptic
  - [ ] Volume toggle mutes/unmutes all audio
  - [ ] Touch mode still works (existing functionality preserved)
  - [ ] No console errors, no layout shifts, no visual regressions

---

## Constraints

- **No new npm dependencies.** Web Audio API and Vibration API are browser-native.
- **Mobile-first.** All effects must perform well on mid-range phones. Use `will-change` sparingly. Prefer `opacity` and `transform` animations (GPU-composited).
- **Progressive enhancement.** If Web Audio isn't available, the app works silently. If Vibration API isn't available, it works without haptics. Never crash on missing APIs.
- **Taste over spectacle.** Every effect should make the user lean in, not lean back. If something feels too loud, too fast, or too flashy — pull it back. The goal is unease and wonder, not a theme park ride.
- **Preserve all existing functionality.** Text input, voice input, touch gate, chat history, session clear, error handling — all must continue to work exactly as they do now.
