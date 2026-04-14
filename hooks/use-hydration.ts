import { useState, useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuthStore } from '@/store/auth-store';

export function useHydration() {
  const [hydrated, setHydrated] = useState(
    () =>
      useOnboardingStore.persist.hasHydrated() &&
      useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;

    let onboardingDone = useOnboardingStore.persist.hasHydrated();
    let authDone = useAuthStore.persist.hasHydrated();

    const check = () => {
      if (onboardingDone && authDone) setHydrated(true);
    };

    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(() => {
      onboardingDone = true;
      check();
    });

    const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
      authDone = true;
      check();
    });

    // In case both already hydrated before subscriptions were attached
    check();

    return () => {
      unsubOnboarding();
      unsubAuth();
    };
  }, []);

  return hydrated;
}
