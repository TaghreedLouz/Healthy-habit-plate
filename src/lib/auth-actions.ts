import {
  confirmPasswordReset,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase.js";

/** Dev default — must match an Firebase Authorized domain (usually `localhost`). */
const DEV_APP_ORIGIN = "http://localhost:8080";

function isPrivateOrLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

/** Origin used in password-reset / verification continue URLs (must be allowlisted in Firebase). */
export function getAuthContinueOrigin(): string {
  const configured = import.meta.env.VITE_APP_URL as string | undefined;
  if (configured?.trim()) return configured.trim().replace(/\/$/, "");

  if (typeof window === "undefined") return DEV_APP_ORIGIN;

  const { hostname, origin } = window.location;

  // LAN / local IPs are not allowlisted — use localhost so reset emails work in dev.
  if (isPrivateOrLocalHost(hostname) && hostname !== "localhost") {
    return DEV_APP_ORIGIN;
  }

  // localhost with any port is fine (domain is still "localhost").
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return origin;
  }

  return origin;
}

export function authActionUrl(path: string): string {
  const base = getAuthContinueOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim(), {
    url: authActionUrl("/reset-password"),
    handleCodeInApp: true,
  });
}

export async function verifyPasswordReset(oobCode: string): Promise<string> {
  return verifyPasswordResetCode(auth, oobCode);
}

export async function completePasswordReset(
  oobCode: string,
  password: string,
): Promise<void> {
  await confirmPasswordReset(auth, oobCode, password);
}

export async function sendVerificationEmail(user: User): Promise<void> {
  if (!user.emailVerified) {
    await sendEmailVerification(user, {
      url: authActionUrl("/dashboard"),
      handleCodeInApp: true,
    });
  }
}

export async function changePassword(
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!user.email) throw new Error("No email on account.");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
