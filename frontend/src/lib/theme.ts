import type { LifestyleCategory, NutritionCategory, RiskLevel } from '@/types/api';

// Colores semánticos consistentes en toda la app (dashboard, historial, resultado).
// Los valores hex coinciden con brand.risk.* en tailwind.config.js.

export type Severity = 'good' | 'warn' | 'bad';

const RISK_SEVERITY: Record<RiskLevel, Severity> = {
  bajo: 'good',
  moderado: 'warn',
  alto: 'bad',
};

const LIFESTYLE_SEVERITY: Record<LifestyleCategory, Severity> = {
  excelente: 'good',
  bueno: 'good',
  regular: 'warn',
  malo: 'bad',
};

const NUTRITION_SEVERITY: Record<NutritionCategory, Severity> = {
  excelente: 'good',
  buena: 'good',
  regular: 'warn',
  deficiente: 'bad',
};

export const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; hex: string; border: string }> = {
  good: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#16a34a' },
  warn: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#d97706' },
  bad: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', hex: '#dc2626' },
};

export function riskSeverity(level: RiskLevel): Severity {
  return RISK_SEVERITY[level];
}

export function lifestyleSeverity(category: LifestyleCategory): Severity {
  return LIFESTYLE_SEVERITY[category];
}

export function nutritionSeverity(category: NutritionCategory): Severity {
  return NUTRITION_SEVERITY[category];
}
