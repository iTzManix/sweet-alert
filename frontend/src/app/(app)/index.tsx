import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckin } from '@/context/checkin-context';
import { api } from '@/lib/api';
import { riskSeverity } from '@/lib/theme';
import type { AssessmentOut } from '@/types/api';

export default function Dashboard() {
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="gap-4 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-slate-900">Hola 👋</Text>

        {loading ? (
          <ActivityIndicator color="#1c5ff0" />
        ) : latest ? (
          <Card className="gap-2">
            <Text className="text-sm font-medium text-slate-500">
              Tu último check-in — {new Date(latest.created_at).toLocaleDateString()}
            </Text>
            <Badge label={latest.risk_level} severity={riskSeverity(latest.risk_level)} />
            <Text className="text-sm text-slate-500">
              Probabilidad de riesgo: {Math.round(latest.risk_probability * 100)}%
            </Text>
          </Card>
        ) : (
          <Card className="gap-2">
            <Text className="text-base font-semibold text-slate-900">Aún no tienes check-ins</Text>
            <Text className="text-sm text-slate-500">
              Haz tu primer check-in para conocer tu riesgo de diabetes hoy.
            </Text>
          </Card>
        )}

        <Button
          label="Nuevo check-in"
          onPress={() => {
            startNew();
            router.push('/(checkin)/paso-1');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
