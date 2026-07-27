import { supabase } from '@/lib/supabase';
import type { ApiErrorDetail, AssessmentIn, AssessmentOut, ProfileIn, ProfileOut } from '@/types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extractMessage(body: ApiErrorDetail | undefined, fallback: string): string {
  if (!body) return fallback;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail) && body.detail.length > 0) {
    return body.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(', ');
  }
  return fallback;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => undefined)) as ApiErrorDetail | undefined;
    throw new ApiError(res.status, extractMessage(body, `Error ${res.status}`));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getProfile: () => request<ProfileOut>('/profile'),
  putProfile: (profile: ProfileIn) =>
    request<ProfileOut>('/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  postAssessment: (assessment: AssessmentIn) =>
    request<AssessmentOut>('/assessments', { method: 'POST', body: JSON.stringify(assessment) }),
  getAssessments: () => request<AssessmentOut[]>('/assessments'),
  updateAssessment: (id: string, assessment: AssessmentIn) =>
    request<AssessmentOut>(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(assessment) }),
  deleteAssessment: (id: string) => request<void>(`/assessments/${id}`, { method: 'DELETE' }),
};
