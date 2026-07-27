import { Text, View } from 'react-native';

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-slate-100 py-2 last:border-b-0">
      <Text className="flex-1 pr-3 text-sm text-slate-500">{label}</Text>
      <Text className="text-sm font-medium text-slate-800">{value}</Text>
    </View>
  );
}
