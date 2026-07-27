import { router } from 'expo-router';
import { View } from 'react-native';

import { ToggleRow } from '@/components/ui/toggle-row';
import { WizardStep } from '@/components/ui/wizard-step';
import { useCheckin } from '@/context/checkin-context';
import { SYMPTOMS } from '@/lib/assessment-fields';
import type { AssessmentIn } from '@/types/api';

export default function CheckinStep2() {
  const { draft, update } = useCheckin();

  return (
    <WizardStep
      step={2}
      total={4}
      title="Síntomas"
      subtitle="¿Has notado algo de esto últimamente?"
      onNext={() => router.push('/(checkin)/paso-3')}
      onBack={() => router.back()}
    >
      <View>
        {SYMPTOMS.map(({ key, label }) => (
          <ToggleRow
            key={key}
            label={label}
            value={draft[key] as boolean}
            onChange={(value) => update({ [key]: value } as Partial<AssessmentIn>)}
          />
        ))}
      </View>
    </WizardStep>
  );
}
