import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { AssessmentIn, AssessmentOut } from '@/types/api';

const DRAFT_KEY = 'checkin:draft:v1';
const LAST_INPUT_KEY = 'checkin:last-input:v1';

export const CHECKIN_DEFAULTS: AssessmentIn = {
  weight_kg: 70,
  high_bp: false,
  high_chol: false,
  chol_check: true,
  smoker: false,
  stroke: false,
  heart_disease: false,
  phys_activity: true,
  fruits: true,
  veggies: true,
  hvy_alcohol: false,
  any_healthcare: true,
  no_doc_cost: false,
  gen_health: 3,
  ment_health_days: 0,
  phys_health_days: 0,
  diff_walk: false,
  polyuria: false,
  polydipsia: false,
  sudden_weight_loss: false,
  weakness: false,
  polyphagia: false,
  genital_thrush: false,
  visual_blurring: false,
  itching: false,
  irritability: false,
  delayed_healing: false,
  partial_paresis: false,
  muscle_stiffness: false,
  alopecia: false,
  obesity: false,
  sleep_duration_hours: 7,
  sleep_quality: 6,
  physical_activity_level: 40,
  stress_level: 5,
  daily_steps: 6000,
  heart_rate: 72,
  daily_calories: 2000,
  sugar_g: 40,
  carbs_g: 200,
  protein_g: 60,
  fat_g: 60,
  fiber_g: 20,
  water_l: 2,
  fruit_servings: 2,
  veggie_servings: 2,
};

interface CheckinContextValue {
  draft: AssessmentIn;
  update: (patch: Partial<AssessmentIn>) => void;
  submit: () => Promise<AssessmentOut>;
  restoring: boolean;
  result: AssessmentOut | null;
  editingId: string | null;
  startNew: () => void;
  startEdit: (assessment: AssessmentOut) => void;
}

const CheckinContext = createContext<CheckinContextValue | null>(null);

export function CheckinProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<AssessmentIn>(CHECKIN_DEFAULTS);
  const [restoring, setRestoring] = useState(true);
  const [result, setResult] = useState<AssessmentOut | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [savedDraft, lastInput] = await Promise.all([
        AsyncStorage.getItem(DRAFT_KEY),
        AsyncStorage.getItem(LAST_INPUT_KEY),
      ]);
      if (savedDraft) {
        setDraft(JSON.parse(savedDraft));
      } else if (lastInput) {
        setDraft({ ...CHECKIN_DEFAULTS, ...JSON.parse(lastInput) });
      }
      setRestoring(false);
    })();
  }, []);

  function update(patch: Partial<AssessmentIn>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function startNew() {
    setEditingId(null);
    setResult(null);
    AsyncStorage.getItem(LAST_INPUT_KEY).then((lastInput) => {
      setDraft(lastInput ? { ...CHECKIN_DEFAULTS, ...JSON.parse(lastInput) } : CHECKIN_DEFAULTS);
    });
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
  }

  function startEdit(assessment: AssessmentOut) {
    const {
      id,
      created_at,
      risk_probability,
      risk_level,
      symptoms_probability,
      symptoms_level,
      sleep_disorder_probability,
      lifestyle_category,
      nutrition_score,
      nutrition_category,
      llm_recommendation,
      ...answers
    } = assessment;
    setEditingId(id);
    setResult(null);
    setDraft(answers);
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(answers)).catch(() => {});
  }

  async function submit() {
    const assessment = editingId
      ? await api.updateAssessment(editingId, draft)
      : await api.postAssessment(draft);
    await AsyncStorage.setItem(LAST_INPUT_KEY, JSON.stringify(draft));
    await AsyncStorage.removeItem(DRAFT_KEY);
    setResult(assessment);
    return assessment;
  }

  return (
    <CheckinContext.Provider
      value={{ draft, update, submit, restoring, result, editingId, startNew, startEdit }}
    >
      {children}
    </CheckinContext.Provider>
  );
}

export function useCheckin() {
  const ctx = useContext(CheckinContext);
  if (!ctx) throw new Error('useCheckin debe usarse dentro de <CheckinProvider>');
  return ctx;
}
