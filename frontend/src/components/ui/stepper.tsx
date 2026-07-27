import { Pressable, Text, View } from 'react-native';

interface Band {
  upTo: number;
  label: string;
}

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Bandas de referencia (ver docs/api.md) para no dejar al usuario adivinar un número en blanco. */
  bands?: Band[];
}

function bandLabel(value: number, bands?: Band[]) {
  if (!bands || bands.length === 0) return undefined;
  const hit = bands.find((b) => value <= b.upTo);
  return hit ? hit.label : bands[bands.length - 1].label;
}

export function Stepper({ label, value, onChange, min, max, step = 1, unit, bands }: StepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(2))));
  const hint = bandLabel(value, bands);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-base text-slate-800">{label}</Text>
        {hint ? <Text className="text-xs font-medium text-brand-600">{hint}</Text> : null}
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(clamp(value - step))}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200"
        >
          <Text className="text-xl font-semibold text-slate-700">–</Text>
        </Pressable>
        <View className="flex-1 items-center rounded-2xl bg-slate-50 py-3">
          <Text className="text-lg font-semibold text-slate-900">
            {value}
            {unit ? ` ${unit}` : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => onChange(clamp(value + step))}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200"
        >
          <Text className="text-xl font-semibold text-slate-700">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
