import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/firebase.js";
import { clearOnboardingForEmail } from "@/lib/store";

export interface AppUserRecord {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  disabled: boolean;
  requireOnboarding: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
}

function tsToIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    try {
      return (value as Timestamp).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}


const STATS_REF = doc(db, "settings", "stats");

export async function getRegisteredUserCount(): Promise<number> {
  try {
    const snap = await getDoc(STATS_REF);
    const count = snap.data()?.registeredUsers;
    return typeof count === "number" && count >= 0 ? count : 0;
  } catch {
    return 0;
  }
}

export async function setRegisteredUserCount(count: number) {
  await setDoc(STATS_REF, { registeredUsers: Math.max(0, count) }, { merge: true });
}

export async function syncUserRecord(firebaseUser: User, displayName?: string) {
  const email = firebaseUser.email?.trim().toLowerCase() ?? "";
  const ref = doc(db, "users", firebaseUser.uid);
  const existing = await getDoc(ref);
  const existingData = existing.data();

  const payload = {
    email,
    name: displayName ?? firebaseUser.displayName ?? "Friend",
    role: existingData?.role ?? "user",
    disabled: existingData?.disabled ?? false,
    requireOnboarding: existingData?.requireOnboarding ?? false,
    lastLoginAt: serverTimestamp(),
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
  };

  if (!existing.exists()) {
    await setDoc(ref, payload, { merge: true });
    try {
      const statsSnap = await getDoc(STATS_REF);
      const current =
        statsSnap.exists() && typeof statsSnap.data()?.registeredUsers === "number"
          ? statsSnap.data()!.registeredUsers
          : 0;
      await setDoc(STATS_REF, { registeredUsers: current + 1 }, { merge: true });
    } catch {
      /* stats counter is optional — do not block signup */
    }
    return;
  }

  await setDoc(ref, payload, { merge: true });
}

export async function getUserRecord(userId: string): Promise<AppUserRecord | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    role: data.role === "admin" ? "admin" : "user",
    disabled: Boolean(data.disabled),
    requireOnboarding: Boolean(data.requireOnboarding),
    createdAt: tsToIso(data.createdAt),
    lastLoginAt: tsToIso(data.lastLoginAt),
  };
}

export async function checkUserAccess(userId: string): Promise<{
  allowed: boolean;
  requireOnboarding: boolean;
  reason?: string;
}> {
  const record = await getUserRecord(userId);
  if (!record) return { allowed: true, requireOnboarding: false };
  if (record.disabled) {
    return { allowed: false, requireOnboarding: false, reason: "This account has been disabled." };
  }
  return { allowed: true, requireOnboarding: record.requireOnboarding };
}

export async function applyUserAccessFlags(user: User): Promise<boolean> {
  const access = await checkUserAccess(user.uid);
  if (!access.allowed) return false;
  if (access.requireOnboarding && user.email) {
    clearOnboardingForEmail(user.email);
    await updateDoc(doc(db, "users", user.uid), { requireOnboarding: false });
  }
  return true;
}

export async function listUserRecords(): Promise<AppUserRecord[]> {
  console.debug("[admin users] querying Firestore collection: users");
  try {
    const snap = await getDocs(collection(db, "users"));
    const users = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          email: String(data.email ?? ""),
          name: String(data.name ?? ""),
          role: data.role === "admin" ? "admin" : "user",
          disabled: Boolean(data.disabled),
          requireOnboarding: Boolean(data.requireOnboarding),
          createdAt: tsToIso(data.createdAt),
          lastLoginAt: tsToIso(data.lastLoginAt),
        } satisfies AppUserRecord;
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    console.debug("[admin users] loaded Firestore user docs:", users.length);
    return users;
  } catch (error) {
    console.error("[admin users] listUserRecords failed:", error);
    throw error;
  }
}

export async function deleteUserRecord(userId: string) {
  await deleteDoc(doc(db, "users", userId));
}

export async function setUserDisabled(userId: string, disabled: boolean) {
  await updateDoc(doc(db, "users", userId), { disabled });
}

export async function updateUserName(userId: string, name: string) {
  await updateDoc(doc(db, "users", userId), { name: name.trim() || "Friend" });
}

export async function setUserRole(userId: string, role: "admin" | "user") {
  await updateDoc(doc(db, "users", userId), { role });
}

export async function resetUserOnboarding(userId: string, email: string) {
  clearOnboardingForEmail(email);
  await updateDoc(doc(db, "users", userId), { requireOnboarding: true });
}
