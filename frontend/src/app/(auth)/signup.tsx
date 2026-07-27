import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const { needsEmailConfirmation } = await signUp(email.trim(), password);
      setNeedsConfirmation(needsEmailConfirmation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-2xl font-bold text-slate-900">Revisa tu correo</Text>
          <Text className="text-center text-base text-slate-500">
            Te enviamos un enlace para confirmar tu cuenta antes de continuar.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center gap-10 px-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-900">Crea tu cuenta</Text>
          <Text className="text-base text-slate-500">Toma 2 minutos, sin verificaciones extra</Text>
        </View>

        <View className="gap-4">
          <Input
            label="Correo"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
          />
          <Input
            label="Contraseña"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
          />
          {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
          <Button
            label="Crear cuenta"
            onPress={handleSubmit}
            loading={loading}
            disabled={!email || password.length < 6}
          />
        </View>

        <View className="flex-row justify-center gap-1">
          <Text className="text-slate-500">¿Ya tienes cuenta?</Text>
          <Link href="/(auth)/login" className="font-semibold text-brand-600">
            Inicia sesión
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
