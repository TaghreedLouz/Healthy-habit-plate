import { redirect } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase.js";

function isBrowser() {
  return typeof window !== "undefined";
}

function getCurrentUser(): Promise<User | null> {
  if (!isBrowser()) return Promise.resolve(null);
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export async function redirectIfAuthenticated() {
  if (!isBrowser()) return;
  const user = await getCurrentUser();
  if (user) throw redirect({ to: "/dashboard" });
}

export function formatAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: string }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);
  const m = `${code} ${message}`.toLowerCase();

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-login-credentials" ||
    m.includes("invalid login credentials")
  ) {
    return "Incorrect email or password.";
  }
  if (code === "auth/email-already-in-use" || m.includes("user already registered")) {
    return "An account with this email already exists. Try logging in.";
  }
  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters.";
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (code === "auth/expired-action-code") {
    return "This reset link has expired. Request a new one.";
  }
  if (code === "auth/invalid-action-code") {
    return "This reset link is invalid or already used. Request a new one.";
  }
  if (code === "auth/user-disabled") {
    return "This account has been disabled. Contact support.";
  }
  if (code === "auth/unauthorized-continue-uri") {
    return "This app URL is not authorized in Firebase. Add your domain under Authentication → Settings → Authorized domains (use localhost for local dev).";
  }
  if (code === "auth/requires-recent-login") {
    return "Please log out and log in again before changing your password.";
  }
  if (code === "auth/missing-password" || code === "auth/missing-email") {
    return "Please fill in all required fields.";
  }
  if (m.includes("network") || m.includes("fetch failed")) {
    return "Connection problem. Check your internet and try again.";
  }
  return message;
}
