import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        className={`h-14 rounded-2xl border px-4 text-base text-slate-900 ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
        }`}
        {...props}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
