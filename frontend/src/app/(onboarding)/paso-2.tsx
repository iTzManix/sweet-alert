import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { OptionChips } from '@/components/ui/option-chips';
import { WizardStep } from '@/components/ui/wizard-step';
import { useOnboarding } from '@/context/onboarding-context';

const EDUCATION_OPTIONS = [
  { value: 1, label: 'Sin estudios' },
  { value: 2, label: 'Primaria' },
  { value: 3, label: 'Secundaria incompleta' },
  { value: 4, label: 'Secundaria completa' },
  { value: 5, label: 'Universidad incompleta / técnico' },
  { value: 6, label: 'Universidad completa o posgrado' },
];

const INCOME_OPTIONS = [
  { value: 1, label: 'Menos de $10,000' },
  { value: 2, label: '$10,000 – $15,000' },
  { value: 3, label: '$15,000 – $20,000' },
  { value: 4, label: '$20,000 – $25,000' },
  { value: 5, label: '$25,000 – $35,000' },
  { value: 6, label: '$35,000 – $50,000' },
  { value: 7, label: '$50,000 – $75,000' },
  { value: 8, label: '$75,000 o más' },
];

export default function OnboardingStep2() {
  const { draft, update } = useOnboarding();
  const isValid = !!draft.education_level && !!draft.income_level;

  return (
    <WizardStep
      step={2}
      total={3}
      title="Educación e ingresos"
      subtitle="Ayuda al modelo a calibrar el riesgo con tu contexto (ingreso anual del hogar, en USD)."
      onNext={() => router.push('/(onboarding)/paso-3')}
      onBack={() => router.back()}
      nextDisabled={!isValid}
    >
      <View className="gap-3">
        <Text className="text-sm font-medium text-slate-700">Nivel educativo</Text>
        <OptionChips
          options={EDUCATION_OPTIONS}
          value={draft.education_level}
          onChange={(education_level) => update({ education_level })}
        />
      </View>

      <View className="gap-3">
        <Text className="text-sm font-medium text-slate-700">Ingreso anual del hogar</Text>
        <OptionChips
          options={INCOME_OPTIONS}
          value={draft.income_level}
          onChange={(income_level) => update({ income_level })}
        />
      </View>
    </WizardStep>
  );
}
