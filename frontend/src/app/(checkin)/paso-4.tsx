import { router } from 'expo-router';

import { Stepper } from '@/components/ui/stepper';
import { WizardStep } from '@/components/ui/wizard-step';
import { useCheckin } from '@/context/checkin-context';

export default function CheckinStep4() {
  const { draft, update } = useCheckin();

  return (
    <WizardStep
      step={4}
      total={4}
      title="Nutrición de hoy"
      subtitle="Un estimado está bien, no hace falta pesar la comida."
      onNext={() => router.push('/(checkin)/resumen')}
      onBack={() => router.back()}
    >
      <Stepper
        label="Calorías consumidas"
        min={500}
        max={6000}
        step={50}
        value={draft.daily_calories}
        onChange={(daily_calories) => update({ daily_calories })}
      />

      <Stepper
        label="Azúcar"
        unit="g"
        min={0}
        max={200}
        step={5}
        value={draft.sugar_g}
        onChange={(sugar_g) => update({ sugar_g })}
        bands={[
          { upTo: 50, label: 'dentro del límite OMS' },
          { upTo: 200, label: 'por encima del límite' },
        ]}
      />

      <Stepper
        label="Carbohidratos"
        unit="g"
        min={0}
        max={500}
        step={10}
        value={draft.carbs_g}
        onChange={(carbs_g) => update({ carbs_g })}
      />

      <Stepper
        label="Proteína"
        unit="g"
        min={0}
        max={300}
        step={5}
        value={draft.protein_g}
        onChange={(protein_g) => update({ protein_g })}
      />

      <Stepper
        label="Grasa"
        unit="g"
        min={0}
        max={200}
        step={5}
        value={draft.fat_g}
        onChange={(fat_g) => update({ fat_g })}
      />

      <Stepper
        label="Fibra"
        unit="g"
        min={0}
        max={60}
        step={1}
        value={draft.fiber_g}
        onChange={(fiber_g) => update({ fiber_g })}
        bands={[
          { upTo: 24, label: 'por debajo de lo recomendado' },
          { upTo: 60, label: 'recomendado (~25-30g)' },
        ]}
      />

      <Stepper
        label="Agua"
        unit="L"
        min={0}
        max={10}
        step={0.25}
        value={draft.water_l}
        onChange={(water_l) => update({ water_l })}
        bands={[
          { upTo: 1.5, label: 'poca' },
          { upTo: 3, label: 'recomendado (~2L)' },
          { upTo: 10, label: 'mucha' },
        ]}
      />

      <Stepper
        label="Porciones de fruta"
        min={0}
        max={20}
        value={draft.fruit_servings}
        onChange={(fruit_servings) => update({ fruit_servings })}
      />

      <Stepper
        label="Porciones de verdura"
        min={0}
        max={20}
        value={draft.veggie_servings}
        onChange={(veggie_servings) => update({ veggie_servings })}
      />
    </WizardStep>
  );
}
