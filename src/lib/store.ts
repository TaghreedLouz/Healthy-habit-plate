import { useSyncExternalStore } from "react";

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number;
  weight: number;
  targetWeight: number;
  activity: "sedentary" | "light" | "moderate" | "active";
  goal: "lose" | "gain" | "maintain" | "healthier";
  onboarded: boolean;
}

export interface MealEntry {
  id: string;
  date: string;
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recipeId?: string;
}

export interface DayLog {
  date: string;
  water: number;
  steps: number;
  weight?: number;
}

export interface Reminder {
  id: string;
  type: "water" | "meal" | "walk" | "weight" | "habit";
  time: string;
  text: string;
  enabled: boolean;
}

export interface AppState {
  user: UserProfile | null;
  meals: MealEntry[];
  days: DayLog[];
  saved: string[];
  reminders: Reminder[];
}

const KEY = "shp_state_v1";

const defaultState: AppState = {
  user: null,
  meals: [],
  days: [],
  saved: [],
  reminders: [
    { id: "r1", type: "water", time: "09:00", text: "Morning water", enabled: true },
    { id: "r2", type: "water", time: "14:00", text: "Hydration check", enabled: true },
    { id: "r3", type: "walk", time: "17:30", text: "Walk 15 min", enabled: true },
    { id: "r4", type: "meal", time: "19:30", text: "Log dinner", enabled: true },
  ],
};

function load(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  set: (updater: (s: AppState) => AppState) => {
    state = updater(state);
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(defaultState)
  );
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function getToday(state: AppState): DayLog {
  const d = todayStr();
  return (
    state.days.find((x) => x.date === d) ?? {
      date: d,
      water: 0,
      steps: 0,
    }
  );
}

export function updateToday(patch: Partial<DayLog>) {
  store.set((s) => {
    const d = todayStr();
    const existing = s.days.find((x) => x.date === d);

    const updated: DayLog = {
      ...(existing ?? { date: d, water: 0, steps: 0 }),
      ...patch,
    };

    return {
      ...s,
      days: [...s.days.filter((x) => x.date !== d), updated],
    };
  });
}

export function addMeal(m: Omit<MealEntry, "id" | "date">) {
  store.set((s) => ({
    ...s,
    meals: [
      ...s.meals,
      { ...m, id: crypto.randomUUID(), date: todayStr() },
    ],
  }));
}

export function removeMeal(id: string) {
  store.set((s) => ({
    ...s,
    meals: s.meals.filter((m) => m.id !== id),
  }));
}

export function toggleSaved(recipeId: string) {
  store.set((s) => ({
    ...s,
    saved: s.saved.includes(recipeId)
      ? s.saved.filter((x) => x !== recipeId)
      : [...s.saved, recipeId],
  }));
}

export function logout() {
  store.set(() => defaultState);
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}

export function calcTargets(u: UserProfile | null) {
  if (!u) return { calories: 2000, water: 8, steps: 8000 };

  const bmr =
    u.gender === "female"
      ? 10 * u.weight + 6.25 * u.height - 5 * u.age - 161
      : 10 * u.weight + 6.25 * u.height - 5 * u.age + 5;

  const factor =
    {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    }[u.activity];

  let tdee = bmr * factor;

  if (u.goal === "lose") tdee -= 400;
  if (u.goal === "gain") tdee += 350;

  return {
    calories: Math.round(tdee),
    water: Math.round(u.weight * 0.033 * 4),
    steps:
      u.activity === "active"
        ? 12000
        : u.activity === "moderate"
        ? 10000
        : 8000,
  };
}

export function clearLocalProfile() {
  store.set(() => defaultState);
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}

export function syncProfileFromAuth(email: string, displayName?: string) {
  store.set((s) => {
    if (s.user?.email === email) return s;
    const base: UserProfile =
      s.user ?? {
        name: displayName ?? "Friend",
        email,
        age: 28,
        gender: "other",
        height: 170,
        weight: 70,
        targetWeight: 68,
        activity: "moderate",
        goal: "healthier",
        onboarded: false,
      };
    return {
      ...s,
      user: {
        ...base,
        email,
        name: displayName ?? base.name,
      },
    };
  });
}