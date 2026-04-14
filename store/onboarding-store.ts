import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { expoSecureStorage } from "@/lib/storage";

type OnboardingState = {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => expoSecureStorage),
    },
  ),
);
