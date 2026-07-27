import { router } from 'expo-router';

import { Stepper } from '@/components/ui/stepper';
import { WizardStep } from '@/components/ui/wizard-step';
import { useCheckin } from '@/context/checkin-context';

export default function CheckinStep3() {
  const { draft, update } = useCheckin();

  return (
    <WizardStep
      step={3}
      total={4}
      title="Estilo de vida"
      subtitle="Sin sensores: usa las referencias como guía, no hace falta ser exacto."
      onNext={() => router.push('/(checkin)/paso-4')}
      onBack={() => router.back()}
    >
      <Stepper
        label="Horas de sueño anoche"
        unit="h"
        min={0}
        max={24}
        step={0.5}
        value={draft.sleep_duration_hours}
        onChange={(sleep_duration_hours) => update({ sleep_duration_hours })}
        bands={[
          { upTo: 5, label: 'poco' },
          { upTo: 9, label: 'recomendado' },
          { upTo: 24, label: 'mucho' },
        ]}
      />

      <Stepper
        label="Calidad del sueño"
        min={1}
        max={10}
        value={draft.sleep_quality}
        onChange={(sleep_quality) => update({ sleep_quality })}
        bands={[
          { upTo: 3, label: 'muy mala' },
          { upTo: 6, label: 'regular' },
          { upTo: 10, label: 'excelente' },
        ]}
      />

      <Stepper
        label="Nivel de actividad física"
        min={0}
        max={100}
        step={5}
        value={draft.physical_activity_level}
        onChange={(physical_activity_level) => update({ physical_activity_level })}
        bands={[
          { upTo: 30, label: 'bajo' },
          { upTo: 70, label: 'moderado' },
          { upTo: 100, label: 'alto' },
        ]}
      />

      <Stepper
        label="Nivel de estrés"
        min={1}
        max={10}
        value={draft.stress_level}
        onChange={(stress_level) => update({ stress_level })}
        bands={[
          { upTo: 3, label: 'muy bajo' },
          { upTo: 6, label: 'moderado' },
          { upTo: 10, label: 'muy alto' },
        ]}
      />

      <Stepper
        label="Pasos diarios"
        min={0}
        max={50000}
        step={500}
        value={draft.daily_steps}
        onChange={(daily_steps) => update({ daily_steps })}
        bands={[
          { upTo: 3000, label: 'sedentario' },
          { upTo: 10000, label: 'activo' },
          { upTo: 50000, label: 'muy activo' },
        ]}
      />

      <Stepper
        label="Frecuencia cardíaca en reposo"
        unit="lpm"
        min={40}
        max={200}
        value={draft.heart_rate}
        onChange={(heart_rate) => update({ heart_rate })}
      />
    </WizardStep>
  );
}
