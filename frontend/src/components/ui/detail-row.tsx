import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

export function DetailRow({ label, value, icon }: { label: string; value: string; icon?: IconName }) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 py-2.5 last:border-b-0">
      <View className="flex-1 flex-row items-center gap-2 pr-3">
        {icon ? <Ionicons name={icon} size={16} color="#94a3b8" /> : null}
        <Text className="text-sm text-slate-500">{label}</Text>
      </View>
      <Text className="text-sm font-medium text-slate-800">{value}</Text>
    </View>
  );
}
