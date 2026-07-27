import type { AssessmentIn } from '@/types/api';

// Labels compartidas entre el wizard de check-in y el detalle del historial
// (misma fuente de verdad, evita que se desincronicen).

export const CONFIRM_TOGGLES: { key: keyof AssessmentIn; label: string }[] = [
  { key: 'high_bp', label: '¿Presión arterial alta?' },
  { key: 'high_chol', label: '¿Colesterol alto?' },
  { key: 'chol_check', label: '¿Control de colesterol en los últimos 5 años?' },
  { key: 'smoker', label: '¿Ha fumado 100+ cigarrillos en su vida?' },
  { key: 'stroke', label: '¿Ha sufrido un accidente cerebrovascular?' },
  { key: 'heart_disease', label: '¿Enfermedad cardíaca o infarto?' },
  { key: 'phys_activity', label: '¿Actividad física en el último mes?' },
  { key: 'fruits', label: '¿Consume fruta diariamente?' },
  { key: 'veggies', label: '¿Consume verduras diariamente?' },
  { key: 'hvy_alcohol', label: '¿Consume alcohol en exceso?' },
  { key: 'any_healthcare', label: '¿Tiene cobertura de salud?' },
  { key: 'no_doc_cost', label: '¿No fue al médico por el costo alguna vez?' },
  { key: 'diff_walk', label: '¿Dificultad para caminar o subir escaleras?' },
];

export const SYMPTOMS: { key: keyof AssessmentIn; label: string }[] = [
  { key: 'polyuria', label: '¿Orina con frecuencia inusual?' },
  { key: 'polydipsia', label: '¿Sed excesiva?' },
  { key: 'sudden_weight_loss', label: '¿Pérdida de peso repentina?' },
  { key: 'weakness', label: '¿Debilidad general?' },
  { key: 'polyphagia', label: '¿Hambre excesiva?' },
  { key: 'genital_thrush', label: '¿Infecciones genitales frecuentes?' },
  { key: 'visual_blurring', label: '¿Visión borrosa?' },
  { key: 'itching', label: '¿Picazón frecuente?' },
  { key: 'irritability', label: '¿Irritabilidad?' },
  { key: 'delayed_healing', label: '¿Cicatrización lenta de heridas?' },
  { key: 'partial_paresis', label: '¿Debilidad muscular parcial?' },
  { key: 'muscle_stiffness', label: '¿Rigidez muscular?' },
  { key: 'alopecia', label: '¿Pérdida de cabello inusual?' },
  { key: 'obesity', label: '¿Obesidad?' },
];

export const GEN_HEALTH_OPTIONS = [
  { value: 1, label: 'Excelente' },
  { value: 2, label: 'Muy buena' },
  { value: 3, label: 'Buena' },
  { value: 4, label: 'Regular' },
  { value: 5, label: 'Mala' },
];

export const LIFESTYLE_ROWS: { key: keyof AssessmentIn; label: string; unit?: string }[] = [
  { key: 'sleep_duration_hours', label: 'Horas de sueño', unit: 'h' },
  { key: 'sleep_quality', label: 'Calidad del sueño', unit: '/10' },
  { key: 'physical_activity_level', label: 'Nivel de actividad física', unit: '/100' },
  { key: 'stress_level', label: 'Nivel de estrés', unit: '/10' },
  { key: 'daily_steps', label: 'Pasos diarios' },
  { key: 'heart_rate', label: 'Frecuencia cardíaca en reposo', unit: 'lpm' },
];

export const NUTRITION_ROWS: { key: keyof AssessmentIn; label: string; unit?: string }[] = [
  { key: 'daily_calories', label: 'Calorías', unit: 'kcal' },
  { key: 'sugar_g', label: 'Azúcar', unit: 'g' },
  { key: 'carbs_g', label: 'Carbohidratos', unit: 'g' },
  { key: 'protein_g', label: 'Proteína', unit: 'g' },
  { key: 'fat_g', label: 'Grasa', unit: 'g' },
  { key: 'fiber_g', label: 'Fibra', unit: 'g' },
  { key: 'water_l', label: 'Agua', unit: 'L' },
  { key: 'fruit_servings', label: 'Porciones de fruta' },
  { key: 'veggie_servings', label: 'Porciones de verdura' },
];
