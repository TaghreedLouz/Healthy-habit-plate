import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "@/firebase.js";
import { isAdminRole } from "@/lib/admin";
import { syncUserRecord, applyUserAccessFlags, getUserRecord } from "@/lib/users.firestore";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      let admin = false;

      if (firebaseUser) {
        try {
          await syncUserRecord(firebaseUser);
          const allowed = await applyUserAccessFlags(firebaseUser);
          if (!allowed) {
            await firebaseSignOut(auth);
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return;
          }
          const record = await getUserRecord(firebaseUser.uid);
          admin = isAdminRole(record?.role);
        } catch {
          /* Firestore rules may block until configured */
        }
      }

      setUser(firebaseUser);
      setIsAdmin(admin);
      setLoading(false);
    });
    return unsub;
  }, []);

  return {
    user,
    loading,
    isAdmin,
  };
}

export async function signOut() {
  await firebaseSignOut(auth);
}
