# ANIMATION_GUIDE.md — Motion

> **Owns:** motion principles, tokens, and the allowed animation inventory. Motion must never compromise the low-end Android budget ([PERFORMANCE.md](PERFORMANCE.md) §4).

## 1. Principles

1. **Motion is feedback, not decoration.** Every animation answers "what just happened?" — no idle/looping animation anywhere.
2. **Fast and interruptible.** Nothing blocks input; users can act mid-transition.
3. **Cheap by construction.** Native-driver transforms/opacity only (no animated layout thrash, no JS-driven frame loops). Implementation: `react-native-reanimated` (already in the Expo/Router dependency graph — [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md)).

## 2. Motion tokens

| Token | Value | Use |
|---|---|---|
| `motion.fast` | 150 ms, ease-out | Press feedback, toggles, chips |
| `motion.base` | 250 ms, ease-in-out | Sheets, dialogs, list item enter/exit |
| `motion.slow` | 400 ms, ease-out | Health ring fill, chart bars grow-in |
| `motion.spring` | damping 18, stiffness 180 | Sheet snap, tab center-button press |

## 3. Allowed inventory (exhaustive — additions need a reason)

- Screen transitions: platform defaults from the navigator (never custom per-screen transitions).
- Bottom sheets: slide-up + backdrop fade (`motion.base`/`motion.spring`).
- Press states: opacity 0.7 or scale 0.97 (`motion.fast`).
- `HealthRing`: sweep to value on appear/score change (`motion.slow`); no continuous effects.
- Chart bars: single grow-in on first mount (`motion.slow`); none on data refresh.
- List add/remove: fade+height (`motion.base`) — only on user-visible mutations (undo, delete).
- Snackbar/toast: slide+fade (`motion.fast`).
- Status changes (pill color): crossfade (`motion.fast`).
- Theme switch: full-screen cross-dissolve — overlay in the outgoing theme's `bg.page` fades 1 → 0 (`motion.base`), opacity-only, native driver ([THEME_GUIDE.md](THEME_GUIDE.md) §4); instant swap under reduced motion.
- Skeletons: static blocks with a subtle opacity pulse (1.2 s) — permitted exception to "no loops" since it signals loading; disabled under reduced motion.

## 4. Forbidden

Parallax, physics playgrounds, animated splash beyond the static logo fade, confetti (a small success moment on first-ever log is allowed as a static illustration, not particles), auto-playing anything, animation on every keystroke.

## 5. Reduced motion

`AccessibilityInfo.isReduceMotionEnabled` → all §3 animations swap to instant state changes (or ≤ 80 ms fades where abrupt swaps disorient). Mandatory, tested in the a11y pass ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §8).

## 6. Evolution

**MVP:** inventory above. **Phase 2:** scanner capture feedback and QR reveal use the same tokens. **Phase 3+:** no change of principles; fleet dashboards on web use CSS equivalents of the same tokens.
