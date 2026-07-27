import { ActivityIndicator, Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-brand-600 active:bg-brand-700', text: 'text-white' },
  secondary: { container: 'bg-slate-100 active:bg-slate-200', text: 'text-slate-900' },
  ghost: { container: 'bg-transparent active:bg-slate-100', text: 'text-brand-600' },
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const styles = VARIANT_CLASSES[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`h-14 flex-row items-center justify-center rounded-2xl px-6 ${styles.container} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#1c5ff0'} />
      ) : (
        <Text className={`text-base font-semibold ${styles.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
