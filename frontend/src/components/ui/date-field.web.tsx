import { createElement } from 'react';
import { Text, View } from 'react-native';

interface DateFieldProps {
  label: string;
  value: string; // 'YYYY-MM-DD' o ''
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// react-native-community/datetimepicker no soporta web; en web usamos
// directamente el <input type="date"> nativo del navegador.
export function DateField({ label, value, onChange, minimumDate, maximumDate }: DateFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      {createElement('input', {
        type: 'date',
        value,
        min: minimumDate ? toISODate(minimumDate) : undefined,
        max: maximumDate ? toISODate(maximumDate) : undefined,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
        style: {
          height: 56,
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          paddingLeft: 16,
          paddingRight: 16,
          fontSize: 16,
          fontFamily: 'inherit',
          color: '#0f172a',
        },
      })}
    </View>
  );
}
