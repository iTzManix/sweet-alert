import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

const EDUCATION_LABELS: Record<number, string> = {
  1: 'Sin estudios',
  2: 'Primaria',
  3: 'Secundaria incompleta',
  4: 'Secundaria completa',
  5: 'Universidad incompleta / técnico',
  6: 'Universidad completa o posgrado',
};

export default function Perfil() {
  const { profile, session, signOut } = useAuth();
  const [total, setTotal] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api
        .getAssessments()
        .then((list) => {
          if (active) setTotal(list.length);
        })
        .catch(() => {
          if (active) setTotal(null);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const email = session?.user.email ?? '';
  const initial = email.charAt(0).toUpperCase();
  const age = profile
    ? Math.floor(
        (Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="gap-5 p-6 pb-32" showsVerticalScrollIndicator={false}>
        <View className="items-center gap-3 pt-2">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-600">
            <Text className="text-3xl font-bold text-white">{initial}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-slate-900">{email}</Text>
            <Text className="text-sm text-slate-400">Cuenta personal</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <StatCard
            icon="document-text-outline"
            label="Check-ins"
            value={total === null ? '—' : String(total)}
            severity="good"
          />
          <StatCard
            icon="calendar-outline"
            label="Edad"
            value={age === null ? '—' : `${age} años`}
            severity="good"
          />
          <StatCard
            icon="resize-outline"
            label="Estatura"
            value={profile ? `${profile.height_cm} cm` : '—'}
            severity="good"
          />
        </View>

        {profile ? (
          <Card className="gap-1">
            <Text className="mb-1 text-base font-semibold text-slate-900">Datos personales</Text>
            <DetailRow icon="male-female-outline" label="Sexo" value={profile.sex === 'F' ? 'Femenino' : 'Masculino'} />
            <DetailRow icon="calendar-outline" label="Fecha de nacimiento" value={profile.birth_date} />
            <DetailRow icon="school-outline" label="Educación" value={EDUCATION_LABELS[profile.education_level]} />
            {profile.occupation ? (
              <DetailRow icon="briefcase-outline" label="Ocupación" value={profile.occupation} />
            ) : null}
          </Card>
        ) : null}

        <View className="gap-3 pt-2">
          <Button
            label="Editar perfil"
            variant="secondary"
            onPress={() => router.push('/(onboarding)/paso-1')}
          />
          <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
