import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { SEVERITY_STYLES, type Severity } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export function StatCard({
  icon,
  label,
  value,
  severity,
}: {
  icon: IconName;
  label: string;
  value: string;
  severity: Severity;
}) {
  const s = SEVERITY_STYLES[severity];
  return (
    <View className="flex-1 gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
        <Ionicons name={icon} size={18} color={s.hex} />
      </View>
      <Text className="text-xs font-medium text-slate-500">{label}</Text>
      <Text className={`text-base font-bold capitalize ${s.text}`}>{value}</Text>
    </View>
  );
}
