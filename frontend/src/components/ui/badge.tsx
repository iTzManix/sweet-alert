import { Text, View } from 'react-native';

import { SEVERITY_STYLES, type Severity } from '@/lib/theme';

export function Badge({ label, severity }: { label: string; severity: Severity }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <View className={`self-start rounded-full border px-3 py-1 ${s.bg} ${s.border}`}>
      <Text className={`text-sm font-semibold capitalize ${s.text}`}>{label}</Text>
    </View>
  );
}
