import { useRouter } from 'expo-router';

import { useTutorialStore } from '@/stores/useTutorialStore';
import { OnboardingCarousel } from './OnboardingCarousel';

/**
 * First-launch onboarding (S-00a). Never a wall: both paths mark welcome
 * completed and move on — the final CTA into the optional bike-setup wizard,
 * Skip straight to the app with an empty garage.
 */
export function WelcomeScreen() {
  const router = useRouter();
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

  return <OnboardingCarousel onSkip={skipAll} onFinish={getStarted} />;
}
