import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/firebase.js";

export interface PlatformSettings {
  announcement: string;
  announcementEnabled: boolean;
  maintenanceMode: boolean;
  signupEnabled: boolean;
  hiddenRecipeIds: string[];
  defaultIngredients: string[];
  contactEmail: string;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  announcement: "",
  announcementEnabled: false,
  maintenanceMode: false,
  signupEnabled: true,
  hiddenRecipeIds: [],
  defaultIngredients: [
    "Chicken",
    "Rice",
    "Eggs",
    "Cucumber",
    "Yogurt",
    "Tuna",
    "Bread",
    "Tomato",
    "Potato",
    "Oats",
  ],
  contactEmail: "hello@smarthealthyplate.app",
};

const SETTINGS_REF = doc(db, "settings", "platform");

function parseSettings(data: Record<string, unknown> | undefined): PlatformSettings {
  if (!data) return { ...DEFAULT_PLATFORM_SETTINGS };
  return {
    announcement: String(data.announcement ?? ""),
    announcementEnabled: Boolean(data.announcementEnabled),
    maintenanceMode: Boolean(data.maintenanceMode),
    signupEnabled: data.signupEnabled !== false,
    hiddenRecipeIds: Array.isArray(data.hiddenRecipeIds)
      ? data.hiddenRecipeIds.map(String)
      : [],
    defaultIngredients: Array.isArray(data.defaultIngredients)
      ? data.defaultIngredients.map(String)
      : DEFAULT_PLATFORM_SETTINGS.defaultIngredients,
    contactEmail: String(data.contactEmail ?? DEFAULT_PLATFORM_SETTINGS.contactEmail),
  };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const snap = await getDoc(SETTINGS_REF);
  return parseSettings(snap.data());
}

export async function savePlatformSettings(
  patch: Partial<PlatformSettings>,
): Promise<PlatformSettings> {
  const current = await getPlatformSettings();
  const next = { ...current, ...patch };
  await setDoc(
    SETTINGS_REF,
    { ...next, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return next;
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      SETTINGS_REF,
      (snap) => {
        setSettings(parseSettings(snap.data()));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  return { settings, loading };
}
