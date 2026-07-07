// Learn more https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web worker loads a .wasm module (wa-sqlite) directly — Metro
// must treat it as an asset (SQLITE_GUIDE.md is silent on web since the MVP
// target is native only, but this keeps `expo start --web` from hard-failing).
config.resolver.assetExts.push('wasm');

module.exports = config;
