import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 gap-4 p-6">
        <Text className="text-2xl font-bold text-slate-900">Tu perfil</Text>

        <Card className="gap-2">
          <Text className="text-sm text-slate-500">{session?.user.email}</Text>
          {profile ? (
            <View className="gap-1.5 pt-2">
              <Text className="text-sm text-slate-700">
                Sexo: {profile.sex === 'F' ? 'Femenino' : 'Masculino'}
              </Text>
              <Text className="text-sm text-slate-700">Fecha de nacimiento: {profile.birth_date}</Text>
              <Text className="text-sm text-slate-700">Estatura: {profile.height_cm} cm</Text>
              <Text className="text-sm text-slate-700">
                Educación: {EDUCATION_LABELS[profile.education_level]}
              </Text>
              {profile.occupation ? (
                <Text className="text-sm text-slate-700">Ocupación: {profile.occupation}</Text>
              ) : null}
            </View>
          ) : null}
        </Card>

        <Button
          label="Editar perfil"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/paso-1')}
        />
        <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}
