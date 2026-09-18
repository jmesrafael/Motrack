/**
 * One-shot flag so a theme change that's already animating itself (the web
 * circular reveal) can tell ThemeProvider to skip its own cross-dissolve —
 * otherwise both transitions would run over the same theme swap at once.
 * Plain module state, not a store: this is a stage direction for exactly the
 * next theme change, not something any component needs to read/render from.
 */
let skipNextFade = false;

export function skipNextThemeFade(): void {
  skipNextFade = true;
}

export function consumeSkipNextThemeFade(): boolean {
  const value = skipNextFade;
  skipNextFade = false;
  return value;
}
