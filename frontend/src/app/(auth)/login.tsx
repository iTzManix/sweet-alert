import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center gap-10 px-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-900">Bienvenido de nuevo</Text>
          <Text className="text-base text-slate-500">Inicia sesión para ver tu riesgo de diabetes</Text>
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
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
          {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
          <Button
            label="Iniciar sesión"
            onPress={handleSubmit}
            loading={loading}
            disabled={!email || !password}
          />
        </View>

        <View className="flex-row justify-center gap-1">
          <Text className="text-slate-500">¿No tienes cuenta?</Text>
          <Link href="/(auth)/signup" className="font-semibold text-brand-600">
            Regístrate
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
