import { Text, View } from 'react-native';

interface ProgressBarProps {
  step: number;
  total: number;
  label?: string;
}

export function ProgressBar({ step, total, label }: ProgressBarProps) {
  const pct = Math.round((step / total) * 100);
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">{label ?? `Paso ${step} de ${total}`}</Text>
        <Text className="text-sm font-medium text-slate-400">{pct}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-slate-100">
        <View className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
