import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { riskSeverity } from '@/lib/theme';
import type { AssessmentOut } from '@/types/api';

export default function Historial() {
  const [items, setItems] = useState<AssessmentOut[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api
        .getAssessments()
        .then((list) => {
          if (active) setItems(list);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#1c5ff0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 p-6"
        ListHeaderComponent={<Text className="mb-1 text-2xl font-bold text-slate-900">Historial</Text>}
        ListEmptyComponent={
          <Card>
            <Text className="text-slate-500">Todavía no tienes check-ins.</Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(app)/historial/${item.id}`)}>
            <Card className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Text className="text-xs text-slate-400">
                  Estilo de vida: {item.lifestyle_category} · Nutrición: {item.nutrition_category}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Badge label={item.risk_level} severity={riskSeverity(item.risk_level)} />
                <Text className="text-slate-300">›</Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
