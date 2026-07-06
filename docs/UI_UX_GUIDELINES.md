# UI_UX_GUIDELINES.md — Visual & Interaction Principles

> **Owns:** the interaction principles and copy rules every screen follows. **Does not own:** tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)), per-screen layouts ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)), i18n mechanics ([LOCALIZATION.md](LOCALIZATION.md)), motion specs ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)).

## 1. Design principles (priority order)

1. **Speed of entry beats completeness of entry.** The fast path (≤ 3 fields) is the default on every form; detail is progressive disclosure. Persona rule: when P1/P2 friction conflicts with P4 depth, P1/P2 win ([USER_PERSONAS.md](USER_PERSONAS.md)).
2. **Status at a glance.** Color + icon + text triple-encode every status (never color alone — accessibility and sunlight readability on cheap screens).
3. **One primary action per screen**, visually dominant (`primary` token). Secondary actions are quiet.
4. **Nothing blocks on optional data.** Saves succeed with minimums; enrichment is always possible later.
5. **The app never scolds.** Overdue states are matter-of-fact + actionable, not alarmist ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §8 tone).

## 2. Layout & structure

- Single-column layouts; 16 pt gutters; cards on `bg.page`; max content width unconstrained (phone-first, [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §6).
- Lists: row min-height 56; leading icon, title + caption, trailing value/status; swipe actions max 2 per row (Log / more).
- Bottom sheets for quick tasks (Quick Log, switcher, pickers); full screens for forms with > 4 fields.
- Safe areas respected; keyboard never covers the focused field (scroll-into-view + sticky Save above keyboard).

## 3. Forms

- Label above field; inline validation on blur; submit re-validates all and scrolls to first error with a summary banner.
- Numeric entry uses purpose-built keypads (`OdoInput`, `MoneyInput` — [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)) with large keys.
- Pre-fill aggressively: last-used values per field per component; today's date; projected odometer ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §4).
- Optional fields sit under a "Details" divider, collapsed on Quick paths.
- Field validation rules live in [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md); forms are implemented with React Hook Form + Zod schemas shared with the service layer ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §5).

## 4. Feedback

- Every mutation gets instant optimistic UI (< 100 ms perceived, [PERFORMANCE.md](PERFORMANCE.md) §3) + a toast/snackbar confirmation.
- Destructive actions: soft-delete + 5 s undo snackbar as the default pattern; typed-confirmation dialogs only for compound destruction (delete bike, delete all data, restore-over-data).
- Recalculation consequences are surfaced when meaningful ("Heads up: CVT cleaning now due in 150 km" after odometer update, F-5).

## 5. Navigation & state behaviors

- Tabs keep independent stacks; state restored on tab return.
- Android back = header back everywhere; unsaved-changes prompt on dirty forms (discard/keep editing).
- Deep links (from notifications) land on the exact task surface (Quick Log pre-filled), with back leading Home — never into a dead end ([USER_FLOWS.md](USER_FLOWS.md) F-3).
- Empty states teach: illustration + one sentence + primary CTA (specified per screen in [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)).

## 6. Copy rules (voice)

- Plain language, no jargon without necessity; where a technical term is unavoidable, add a parenthetical ("CVT (your scooter's transmission)"). Glossary terms: [GLOSSARY.md](GLOSSARY.md).
- Sentence case everywhere; no ALL CAPS except `type.label` chrome.
- Numbers with units: "1,500 km", "₱150.00" — formatting rules in [LOCALIZATION.md](LOCALIZATION.md) §5.
- Taglish acceptability: Filipino locale may use natural Taglish where pure Filipino is stilted; translation guidance in [LOCALIZATION.md](LOCALIZATION.md) §6.
- All strings via i18n keys — hard-coded user-visible strings are lint errors ([LOCALIZATION.md](LOCALIZATION.md) §3).

## 7. Themes & environments

Dark mode is first-class, and every screen must hold up in **every registered theme** (MVP: light + dark; the engine supports unlimited future themes — [THEME_GUIDE.md](THEME_GUIDE.md)); test each screen per theme. Sunlight legibility: rely on contrast + size, not thin grays — riders check the app outdoors. One-handed use: primary actions in the bottom half of the screen where possible.

## 8. Accessibility baseline (MVP-required)

- Touch targets ≥ 44×44 pt; contrast per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §6; status never color-alone (§1.2).
- Screen readers (TalkBack/VoiceOver): every interactive element has `accessibilityLabel`/`Role`/`State`; custom controls (keypads, ring, chips) expose value and actions; sheets trap focus; toasts announced via accessibility live region.
- Dynamic type to 130% without losing data or actions (truncation allowed only on decorative text).
- Reduced motion honored ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) §5).
- Keyboard/switch access: standard RN focus order — verify forms are traversable.
- Acceptance: the checklist in [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §2 gates every screen.

## 9. Evolution

**MVP:** all above. **Phase 2:** smart-notification phrasing and receipt-scan flows follow the same tone/feedback rules; onboarding A/B variants must keep the ≤ 3-minute bar. **Phase 3:** community/workshop surfaces get their own content guidelines appended here (moderation tone). **Long-term:** web parity of these principles via shared tokens.
