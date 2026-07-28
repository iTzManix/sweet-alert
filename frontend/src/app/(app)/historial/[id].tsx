import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { useCheckin } from '@/context/checkin-context';
import {
  CONFIRM_TOGGLES,
  GEN_HEALTH_OPTIONS,
  LIFESTYLE_ROWS,
  NUTRITION_ROWS,
  SYMPTOMS,
} from '@/lib/assessment-fields';
import { api } from '@/lib/api';
import { lifestyleSeverity, nutritionSeverity, riskSeverity } from '@/lib/theme';
import type { AssessmentOut } from '@/types/api';

export default function HistorialDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { startEdit } = useCheckin();
  const [item, setItem] = useState<AssessmentOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api.getAssessments().then((list) => {
        if (active) {
          setItem(list.find((a) => a.id === id) ?? null);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, [id])
  );

  function handleEdit() {
    if (!item) return;
    startEdit(item);
    router.push('/(checkin)/paso-1');
  }

  function handleDelete() {
    if (!item) return;
    Alert.alert('Eliminar check-in', 'Esta acción no se puede deshacer. ¿Eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.deleteAssessment(item.id);
            router.replace('/(app)/historial');
          } catch (err) {
            setDeleting(false);
            Alert.alert('No se pudo eliminar', err instanceof Error ? err.message : 'Intenta de nuevo');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#1c5ff0" />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-slate-500">No se encontró este check-in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="gap-4 p-6 pb-32" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-slate-500">{new Date(item.created_at).toLocaleString()}</Text>

        <Card className="gap-2">
          <Text className="text-sm font-medium text-slate-500">Riesgo de diabetes</Text>
          <Badge label={item.risk_level} severity={riskSeverity(item.risk_level)} />
          <Text className="text-sm text-slate-500">
            {Math.round(item.risk_probability * 100)}% de probabilidad
          </Text>
        </Card>

        <Card className="gap-1">
          <Text className="mb-1 text-base font-semibold text-slate-900">Tu cuerpo</Text>
          <DetailRow label="Peso" value={`${item.weight_kg} kg`} />
          <DetailRow
            label="Salud general"
            value={GEN_HEALTH_OPTIONS.find((o) => o.value === item.gen_health)?.label ?? `${item.gen_health}/5`}
          />
          <DetailRow label="Días con mala salud mental" value={`${item.ment_health_days}`} />
          <DetailRow label="Días con mala salud física" value={`${item.phys_health_days}`} />
          {CONFIRM_TOGGLES.map(({ key, label }) => (
            <DetailRow key={key} label={label} value={item[key] ? 'Sí' : 'No'} />
          ))}
        </Card>

        <Card className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-900">Síntomas</Text>
            <Badge label={item.symptoms_level} severity={riskSeverity(item.symptoms_level)} />
          </View>
          <View className="gap-1">
            {SYMPTOMS.map(({ key, label }) => (
              <DetailRow key={key} label={label} value={item[key] ? 'Sí' : 'No'} />
            ))}
          </View>
        </Card>

        <Card className="gap-1">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-900">Estilo de vida</Text>
            <Badge label={item.lifestyle_category} severity={lifestyleSeverity(item.lifestyle_category)} />
          </View>
          {LIFESTYLE_ROWS.map(({ key, label, unit }) => (
            <DetailRow key={key} label={label} value={`${item[key]}${unit ?? ''}`} />
          ))}
        </Card>

        <Card className="gap-1">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-900">Nutrición</Text>
            <Badge label={item.nutrition_category} severity={nutritionSeverity(item.nutrition_category)} />
          </View>
          {NUTRITION_ROWS.map(({ key, label, unit }) => (
            <DetailRow key={key} label={label} value={`${item[key]}${unit ? ` ${unit}` : ''}`} />
          ))}
        </Card>

        <Card className="gap-3 !bg-brand-50">
          <Text className="text-base font-semibold text-brand-900">Recomendación</Text>
          <Text className="text-sm text-brand-900">{item.llm_recommendation.resumen}</Text>
          <View className="gap-2">
            {item.llm_recommendation.recomendaciones.map((rec, i) => (
              <View key={i} className="flex-row gap-2">
                <Text className="text-sm text-brand-700">•</Text>
                <Text className="flex-1 text-sm text-brand-900">{rec}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="Editar" variant="secondary" onPress={handleEdit} disabled={deleting} />
          </View>
          <View className="flex-1">
            <Button label="Eliminar" variant="ghost" onPress={handleDelete} loading={deleting} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
