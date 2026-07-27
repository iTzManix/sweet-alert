import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';

interface WizardStepProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
}

export function WizardStep({
  step,
  total,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Siguiente',
  nextDisabled,
  nextLoading,
}: WizardStepProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-4">
        <ProgressBar step={step} total={total} />
        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-6 pb-8"
        >
          <View className="gap-1">
            <Text className="text-2xl font-bold text-slate-900">{title}</Text>
            {subtitle ? <Text className="text-base text-slate-500">{subtitle}</Text> : null}
          </View>
          {children}
        </ScrollView>
        <View className="flex-row gap-3 pb-4 pt-2">
          {onBack ? (
            <View className="flex-1">
              <Button label="Atrás" variant="secondary" onPress={onBack} />
            </View>
          ) : null}
          <View className="flex-1">
            <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} loading={nextLoading} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
