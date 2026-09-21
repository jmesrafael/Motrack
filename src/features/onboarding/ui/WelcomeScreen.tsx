import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useTutorialStore } from '@/stores/useTutorialStore';
import { LanguageStep } from './LanguageStep';
import { OnboardingCarousel } from './OnboardingCarousel';

/**
 * First-launch onboarding (S-00a). Never a wall: both paths mark welcome
 * completed and move on — the final CTA into the optional bike-setup wizard,
 * Skip straight to the app with an empty garage. Language choice comes first
 * so the carousel and setup that follow already render in the picked
 * language.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const [languagePicked, setLanguagePicked] = useState(false);
  const markWelcomeCompleted = useTutorialStore((s) => s.markWelcomeCompleted);
  const markSetup = useTutorialStore((s) => s.markSetup);

  const getStarted = () => {
    markWelcomeCompleted();
    router.replace('/onboarding/setup');
  };
  const skipAll = () => {
    markWelcomeCompleted();
    markSetup('skipped');
    router.replace('/(tabs)');
  };

  if (!languagePicked) {
    return <LanguageStep onContinue={() => setLanguagePicked(true)} />;
  }

  return <OnboardingCarousel onSkip={skipAll} onFinish={getStarted} />;
}
