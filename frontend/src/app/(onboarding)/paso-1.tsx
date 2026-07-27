import { router } from 'expo-router';

import { DateField } from '@/components/ui/date-field';
import { OptionChips } from '@/components/ui/option-chips';
import { Stepper } from '@/components/ui/stepper';
import { WizardStep } from '@/components/ui/wizard-step';
import { useOnboarding } from '@/context/onboarding-context';
import type { Sex } from '@/types/api';

const now = new Date();
const MAX_BIRTH_DATE = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
const MIN_BIRTH_DATE = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

export default function OnboardingStep1() {
  const { draft, update } = useOnboarding();
  const isValid = !!draft.sex && !!draft.birth_date && !!draft.height_cm;

  return (
    <WizardStep
      step={1}
      total={3}
      title="Empecemos por lo básico"
      subtitle="Estos datos no cambian entre check-ins, solo los pedimos una vez."
      onNext={() => router.push('/(onboarding)/paso-2')}
      nextDisabled={!isValid}
    >
      <OptionChips<Sex>
        options={[
          { value: 'F', label: 'Femenino' },
          { value: 'M', label: 'Masculino' },
        ]}
        value={draft.sex}
        onChange={(sex) => update({ sex })}
      />

      <DateField
        label="Fecha de nacimiento"
        value={draft.birth_date ?? ''}
        onChange={(birth_date) => update({ birth_date })}
        minimumDate={MIN_BIRTH_DATE}
        maximumDate={MAX_BIRTH_DATE}
      />

      <Stepper
        label="Estatura"
        unit="cm"
        min={100}
        max={250}
        step={1}
        value={draft.height_cm ?? 165}
        onChange={(height_cm) => update({ height_cm })}
      />
    </WizardStep>
  );
}
