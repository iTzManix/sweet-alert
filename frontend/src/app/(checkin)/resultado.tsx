import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckin } from '@/context/checkin-context';
import { lifestyleSeverity, nutritionSeverity, riskSeverity } from '@/lib/theme';

export default function CheckinResultado() {
  const { result, editingId } = useCheckin();

  useEffect(() => {
    if (!result) router.replace('/(app)');
  }, [result]);

  if (!result) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="gap-4 p-6 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-slate-900">Tu resultado</Text>

        <Card className="gap-2">
          <Text className="text-sm font-medium text-slate-500">Riesgo de diabetes</Text>
          <Badge label={result.risk_level} severity={riskSeverity(result.risk_level)} />
          <Text className="text-sm text-slate-500">
            Probabilidad estimada: {Math.round(result.risk_probability * 100)}%
          </Text>
        </Card>

        <Card className="gap-2">
          <Text className="text-sm font-medium text-slate-500">Síntomas compatibles</Text>
          <Badge label={result.symptoms_level} severity={riskSeverity(result.symptoms_level)} />
        </Card>

        <Card className="gap-2">
          <Text className="text-sm font-medium text-slate-500">Estilo de vida</Text>
          <Badge label={result.lifestyle_category} severity={lifestyleSeverity(result.lifestyle_category)} />
        </Card>

        <Card className="gap-2">
          <Text className="text-sm font-medium text-slate-500">Nutrición de hoy</Text>
          <Badge
            label={result.nutrition_category}
            severity={nutritionSeverity(result.nutrition_category)}
          />
        </Card>

        <Card className="gap-3 bg-brand-50">
          <Text className="text-base font-semibold text-brand-900">Recomendación</Text>
          <Text className="text-sm text-brand-900">{result.llm_recommendation.resumen}</Text>
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase text-brand-700">Factor principal</Text>
            <Text className="text-sm text-brand-900">{result.llm_recommendation.factor_principal}</Text>
          </View>
          <View className="gap-2">
            {result.llm_recommendation.recomendaciones.map((item, i) => (
              <View key={i} className="flex-row gap-2">
                <Text className="text-sm text-brand-700">•</Text>
                <Text className="flex-1 text-sm text-brand-900">{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Button
          label={editingId ? 'Volver al historial' : 'Ir al inicio'}
          onPress={() => router.replace(editingId ? '/(app)/historial' : '/(app)')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
