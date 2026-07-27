import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

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

export function DateField({ label, value, onChange, minimumDate, maximumDate }: DateFieldProps) {
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'set' && selectedDate) onChange(toISODate(selectedDate));
  }

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <Pressable
        onPress={() => setShow(true)}
        className="h-14 justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4"
      >
        <Text className={`text-base ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || 'Toca para elegir'}
        </Text>
      </Pressable>

      {show ? (
        <>
          <DateTimePicker
            value={value ? new Date(value) : (maximumDate ?? new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setShow(false)} className="self-end">
              <Text className="text-sm font-semibold text-brand-600">Listo</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
