import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useCheckin } from '@/context/checkin-context';

function SummaryCard({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: { label: string; value: string }[];
  onEdit: () => void;
}) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
        <Pressable onPress={onEdit}>
          <Text className="text-sm font-semibold text-brand-600">Editar</Text>
        </Pressable>
      </View>
      <View className="gap-1.5">
        {rows.map((row) => (
          <View key={row.label} className="flex-row justify-between">
            <Text className="text-sm text-slate-500">{row.label}</Text>
            <Text className="text-sm font-medium text-slate-800">{row.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function CheckinResumen() {
  const { draft, submit, editingId } = useCheckin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symptomCount = [
    draft.polyuria,
    draft.polydipsia,
    draft.sudden_weight_loss,
    draft.weakness,
    draft.polyphagia,
    draft.genital_thrush,
    draft.visual_blurring,
    draft.itching,
    draft.irritability,
    draft.delayed_healing,
    draft.partial_paresis,
    draft.muscle_stiffness,
    draft.alopecia,
    draft.obesity,
  ].filter(Boolean).length;

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await submit();
      router.replace('/(checkin)/resultado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el check-in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-4">
        <ProgressBar step={5} total={5} label="Resumen" />
        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-4 pb-8"
        >
          <View className="gap-1">
            <Text className="text-2xl font-bold text-slate-900">
              {editingId ? 'Revisa antes de guardar' : 'Revisa antes de enviar'}
            </Text>
            <Text className="text-base text-slate-500">Toca "Editar" en cualquier tarjeta si algo cambió.</Text>
          </View>

          <SummaryCard
            title="Tu cuerpo hoy"
            onEdit={() => router.push('/(checkin)/paso-1')}
            rows={[
              { label: 'Peso', value: `${draft.weight_kg} kg` },
              { label: 'Salud general', value: `${draft.gen_health}/5` },
            ]}
          />
          <SummaryCard
            title="Síntomas"
            onEdit={() => router.push('/(checkin)/paso-2')}
            rows={[{ label: 'Síntomas marcados', value: `${symptomCount} de 14` }]}
          />
          <SummaryCard
            title="Estilo de vida"
            onEdit={() => router.push('/(checkin)/paso-3')}
            rows={[
              { label: 'Sueño', value: `${draft.sleep_duration_hours} h` },
              { label: 'Pasos diarios', value: `${draft.daily_steps}` },
              { label: 'Estrés', value: `${draft.stress_level}/10` },
            ]}
          />
          <SummaryCard
            title="Nutrición"
            onEdit={() => router.push('/(checkin)/paso-4')}
            rows={[
              { label: 'Calorías', value: `${draft.daily_calories} kcal` },
              { label: 'Agua', value: `${draft.water_l} L` },
            ]}
          />

          {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
        </ScrollView>
        <View className="gap-3 pb-4 pt-2">
          <Button
            label={editingId ? 'Guardar cambios' : 'Enviar check-in'}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
