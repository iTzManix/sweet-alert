// Mirror exacto de backend/app/schemas/profile.py y assessment.py (ver docs/api.md)

export type Sex = 'M' | 'F';

export interface ProfileIn {
  sex: Sex;
  birth_date: string; // YYYY-MM-DD
  height_cm: number; // 100-250
  education_level: number; // 1-6
  income_level: number; // 1-8
  occupation: string | null;
}

export interface ProfileOut extends ProfileIn {
  id: string;
}

export interface AssessmentIn {
  // Modelo 1 — riesgo de diabetes
  weight_kg: number; // 20-300
  high_bp: boolean;
  high_chol: boolean;
  chol_check: boolean;
  smoker: boolean;
  stroke: boolean;
  heart_disease: boolean;
  phys_activity: boolean;
  fruits: boolean;
  veggies: boolean;
  hvy_alcohol: boolean;
  any_healthcare: boolean;
  no_doc_cost: boolean;
  gen_health: number; // 1-5
  ment_health_days: number; // 0-30
  phys_health_days: number; // 0-30
  diff_walk: boolean;

  // Modelo 3 — síntomas tempranos
  polyuria: boolean;
  polydipsia: boolean;
  sudden_weight_loss: boolean;
  weakness: boolean;
  polyphagia: boolean;
  genital_thrush: boolean;
  visual_blurring: boolean;
  itching: boolean;
  irritability: boolean;
  delayed_healing: boolean;
  partial_paresis: boolean;
  muscle_stiffness: boolean;
  alopecia: boolean;
  obesity: boolean;

  // Modelo 2 — estilo de vida
  sleep_duration_hours: number; // 0-24
  sleep_quality: number; // 1-10
  physical_activity_level: number; // 0-100
  stress_level: number; // 1-10
  daily_steps: number; // 0-50000
  heart_rate: number; // 40-200

  // Nutrición (fórmula, sin ML)
  daily_calories: number; // 500-6000
  sugar_g: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g: number;
  water_l: number; // 0-10
  fruit_servings: number; // 0-20
  veggie_servings: number; // 0-20
}

export type RiskLevel = 'bajo' | 'moderado' | 'alto';
export type LifestyleCategory = 'excelente' | 'bueno' | 'regular' | 'malo';
export type NutritionCategory = 'excelente' | 'buena' | 'regular' | 'deficiente';

export interface LlmRecommendation {
  resumen: string;
  factor_principal: string;
  recomendaciones: string[];
}

export interface AssessmentOut extends AssessmentIn {
  id: string;
  created_at: string;
  risk_probability: number;
  risk_level: RiskLevel;
  symptoms_probability: number;
  symptoms_level: RiskLevel;
  sleep_disorder_probability: number | null;
  lifestyle_category: LifestyleCategory;
  nutrition_score: number;
  nutrition_category: NutritionCategory;
  llm_recommendation: LlmRecommendation;
}

export interface ApiErrorDetail {
  detail: string | { loc: (string | number)[]; msg: string; type: string }[];
}
