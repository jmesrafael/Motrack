import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML document for the static web export. Expo's default web template
 * ships a viewport meta tag without `viewport-fit=cover`, so on browsers that
 * expose safe-area insets (notch/home-indicator devices, installed PWAs)
 * `env(safe-area-inset-*)` — and therefore react-native-safe-area-context's
 * web insets — always resolve to 0. That silently defeated every safe-area
 * fix in the native app whenever it ran on web, since there is no other
 * place to declare this for a static export. `interactive-widget=resizes-content`
 * additionally keeps focused inputs above the on-screen keyboard.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
