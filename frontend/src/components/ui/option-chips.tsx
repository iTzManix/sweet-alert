import { Pressable, Text, View } from 'react-native';

interface Option<T> {
  value: T;
  label: string;
}

interface OptionChipsProps<T extends string | number> {
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

export function OptionChips<T extends string | number>({ options, value, onChange }: OptionChipsProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            className={`rounded-2xl border px-4 py-3 ${
              selected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white'
            }`}
          >
            <Text className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-slate-700'}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
