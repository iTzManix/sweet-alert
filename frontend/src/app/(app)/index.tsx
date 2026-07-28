import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/context/auth-context';
import { useCheckin } from '@/context/checkin-context';
import { api } from '@/lib/api';
import { lifestyleSeverity, nutritionSeverity, riskSeverity, SEVERITY_STYLES } from '@/lib/theme';
import type { AssessmentOut } from '@/types/api';

export default function Dashboard() {
  const { session } = useAuth();
  const { startNew } = useCheckin();
  const [latest, setLatest] = useState<AssessmentOut | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api
        .getAssessments()
        .then((list) => {
          if (active) setLatest(list[0] ?? null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const name = session?.user.email?.split('@')[0] ?? '';
  const riskPct = latest ? Math.round(latest.risk_probability * 100) : 0;
  const riskSev = latest ? riskSeverity(latest.risk_level) : 'good';
  const riskStyle = SEVERITY_STYLES[riskSev];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerClassName="gap-5 p-6 pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-sm font-medium text-slate-400">Hola de nuevo</Text>
          <Text className="text-2xl font-bold capitalize text-slate-900">{name}</Text>
        </View>

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#1c5ff0" />
          </View>
        ) : latest ? (
          <>
            <Card className="gap-4 !border-brand-600 !bg-brand-600 shadow-brand-200">
              <View className="flex-row items-center justify-between">
                <View className="gap-1">
                  <Text className="text-sm font-medium text-white/80">Riesgo de diabetes</Text>
                  <Text className="text-4xl font-extrabold text-white">{riskPct}%</Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: riskStyle.hex }} />
                  <Text className="text-sm font-bold capitalize text-white">{latest.risk_level}</Text>
                </View>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-white/20">
                <View className="h-2 rounded-full bg-white" style={{ width: `${riskPct}%` }} />
              </View>
              <Text className="text-xs text-white/70">
                Último check-in — {new Date(latest.created_at).toLocaleDateString()}
              </Text>
            </Card>

            <View className="flex-row gap-3">
              <StatCard
                icon="pulse-outline"
                label="Síntomas"
                value={latest.symptoms_level}
                severity={riskSeverity(latest.symptoms_level)}
              />
              <StatCard
                icon="walk-outline"
                label="Estilo de vida"
                value={latest.lifestyle_category}
                severity={lifestyleSeverity(latest.lifestyle_category)}
              />
              <StatCard
                icon="nutrition-outline"
                label="Nutrición"
                value={latest.nutrition_category}
                severity={nutritionSeverity(latest.nutrition_category)}
              />
            </View>

            <Card className="gap-3 !border-brand-100 !bg-brand-50">
              <View className="flex-row items-center gap-2">
                <Ionicons name="bulb-outline" size={18} color="#1949c9" />
                <Text className="text-base font-semibold text-brand-900">Recomendaciones</Text>
              </View>
              <Text className="text-sm text-brand-900">{latest.llm_recommendation.resumen}</Text>
              <View className="gap-2 pt-1">
                {latest.llm_recommendation.recomendaciones.slice(0, 3).map((item, i) => (
                  <View key={i} className="flex-row gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#1c5ff0" style={{ marginTop: 1 }} />
                    <Text className="flex-1 text-sm text-brand-900">{item}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : (
          <Card className="items-center gap-3 py-8">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-50">
              <Ionicons name="analytics-outline" size={24} color="#1c5ff0" />
            </View>
            <Text className="text-base font-semibold text-slate-900">Aún no tienes check-ins</Text>
            <Text className="text-center text-sm text-slate-500">
              Haz tu primer check-in para conocer tu riesgo de diabetes hoy.
            </Text>
          </Card>
        )}

        <Button
          label={latest ? 'Nuevo check-in' : 'Hacer mi primer check-in'}
          onPress={() => {
            startNew();
            router.push('/(checkin)/paso-1');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
