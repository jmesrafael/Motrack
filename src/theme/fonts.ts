import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import * as Font from 'expo-font';

/**
 * Brand font registration. Loaded once at startup (root layout gates on it);
 * failure falls back to the platform font, so the app never blocks on type.
 * typeStyle() reads areBrandFontsLoaded() to decide fontFamily vs fontWeight.
 */

let loaded = false;

export const BRAND_FONTS = {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} as const;

export async function loadBrandFonts(): Promise<boolean> {
  try {
    await Font.loadAsync(BRAND_FONTS);
    loaded = true;
  } catch {
    loaded = false;
  }
  return loaded;
}

export function areBrandFontsLoaded(): boolean {
  return loaded;
}
