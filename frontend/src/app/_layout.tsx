import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { CheckinProvider } from '@/context/checkin-context';

function RootNavigation() {
  const { session, initializing, profileStatus } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing || profileStatus === 'checking') return;

    const group = segments[0];
    const isAuthGroup = group === '(auth)';
    const isProtectedGroup = group === '(app)' || group === '(checkin)';

    if (!session && !isAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }
    if (session && isAuthGroup) {
      router.replace(profileStatus === 'missing' ? '/(onboarding)/paso-1' : '/(app)');
      return;
    }
    if (session && profileStatus === 'missing' && isProtectedGroup) {
      router.replace('/(onboarding)/paso-1');
    }
  }, [session, initializing, profileStatus, segments, router]);

  if (initializing || (session && profileStatus === 'checking')) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1c5ff0" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(checkin)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CheckinProvider>
        <RootNavigation />
      </CheckinProvider>
    </AuthProvider>
  );
}
