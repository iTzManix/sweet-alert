import { Switch, Text, View } from 'react-native';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 py-4 last:border-b-0">
      <Text className="flex-1 pr-4 text-base text-slate-800">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#e2e8f0', true: '#93b9fd' }}
        thumbColor={value ? '#1c5ff0' : '#f8fafc'}
      />
    </View>
  );
}
