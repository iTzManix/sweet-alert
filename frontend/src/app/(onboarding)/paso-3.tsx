import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Input } from '@/components/ui/input';
import { WizardStep } from '@/components/ui/wizard-step';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/onboarding-context';
import { api } from '@/lib/api';
import type { ProfileIn } from '@/types/api';

export default function OnboardingStep3() {
  const { draft, update } = useOnboarding();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.putProfile({ ...draft, occupation: draft.occupation || null } as ProfileIn);
      await refreshProfile();
      router.replace('/(app)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <WizardStep
      step={3}
      total={3}
      title="Casi listo"
      subtitle="Un último dato opcional."
      onNext={handleSubmit}
      onBack={() => router.back()}
      nextLabel="Finalizar"
      nextLoading={loading}
    >
      <Input
        label="Ocupación (opcional)"
        placeholder="ej. Enfermera"
        value={draft.occupation ?? ''}
        onChangeText={(occupation) => update({ occupation })}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </WizardStep>
  );
}
