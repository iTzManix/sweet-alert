import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { OptionChips } from '@/components/ui/option-chips';
import { Stepper } from '@/components/ui/stepper';
import { ToggleRow } from '@/components/ui/toggle-row';
import { WizardStep } from '@/components/ui/wizard-step';
import { useCheckin } from '@/context/checkin-context';
import { CONFIRM_TOGGLES, GEN_HEALTH_OPTIONS } from '@/lib/assessment-fields';
import type { AssessmentIn } from '@/types/api';

export default function CheckinStep1() {
  const { draft, update } = useCheckin();

  return (
    <WizardStep
      step={1}
      total={4}
      title="Tu cuerpo hoy"
      subtitle="Confirma lo de siempre y cuéntanos cómo te sientes."
      onNext={() => router.push('/(checkin)/paso-2')}
      onBack={() => router.back()}
    >
      <Stepper
        label="Peso actual"
        unit="kg"
        min={20}
        max={300}
        value={draft.weight_kg}
        onChange={(weight_kg) => update({ weight_kg })}
      />

      <View className="gap-1">
        <Text className="text-sm font-medium text-slate-700">Confirma lo de siempre</Text>
        <View>
          {CONFIRM_TOGGLES.map(({ key, label }) => (
            <ToggleRow
              key={key}
              label={label}
              value={draft[key] as boolean}
              onChange={(value) => update({ [key]: value } as Partial<AssessmentIn>)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm font-medium text-slate-700">Salud general autopercibida</Text>
        <OptionChips
          options={GEN_HEALTH_OPTIONS}
          value={draft.gen_health}
          onChange={(gen_health) => update({ gen_health })}
        />
      </View>

      <Stepper
        label="Días con mala salud mental (último mes)"
        min={0}
        max={30}
        value={draft.ment_health_days}
        onChange={(ment_health_days) => update({ ment_health_days })}
      />

      <Stepper
        label="Días con mala salud física (último mes)"
        min={0}
        max={30}
        value={draft.phys_health_days}
        onChange={(phys_health_days) => update({ phys_health_days })}
      />
    </WizardStep>
  );
}
