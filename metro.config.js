// Learn more https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web worker loads a .wasm module (wa-sqlite) directly — Metro
// must treat it as an asset (SQLITE_GUIDE.md is silent on web since the MVP
// target is native only, but this keeps `expo start --web` from hard-failing).
config.resolver.assetExts.push('wasm');

// expo-sqlite's web backend uses SharedArrayBuffer. Browsers only expose that
// API in cross-origin isolated pages, so Expo web dev needs these headers.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      middleware(req, res, next);
    };
  },
};

module.exports = config;
