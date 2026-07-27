import { createContext, useContext, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import type { ProfileIn } from '@/types/api';

type Draft = Partial<ProfileIn>;

interface OnboardingContextValue {
  draft: Draft;
  update: (patch: Partial<ProfileIn>) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  // Si ya existe un perfil (flujo de edición desde Perfil), precargarlo.
  const [draft, setDraft] = useState<Draft>(
    profile ?? { height_cm: 165, education_level: 4, income_level: 4 }
  );

  function update(patch: Partial<ProfileIn>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  return <OnboardingContext.Provider value={{ draft, update }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding debe usarse dentro de <OnboardingProvider>');
  return ctx;
}
