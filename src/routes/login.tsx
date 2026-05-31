import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthFrame } from "./signup";
import { auth } from "@/firebase.js";
import { redirectIfAuthenticated, formatAuthError } from "@/lib/auth-guard";
import { syncProfileFromAuth, markOnboardingComplete, hasCompletedOnboarding } from "@/lib/store";
import { isAdminRole } from "@/lib/admin";
import { applyUserAccessFlags, syncUserRecord, getUserRecord } from "@/lib/users.firestore";

export const Route = createFileRoute("/login")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Log in — Smart Healthy Plate" }] }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Enter your email and password");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password,
      );
      const email = credential.user.email ?? form.email.trim();
      const access = await applyUserAccessFlags(credential.user);
      if (!access) {
        await firebaseSignOut(auth);
        toast.error("This account has been disabled. Contact support.");
        return;
      }
      syncProfileFromAuth(email, credential.user.displayName ?? undefined);
      await syncUserRecord(credential.user);
      const record = await getUserRecord(credential.user.uid);
      if (isAdminRole(record?.role)) {
        markOnboardingComplete(email);
      }
      toast.success("Welcome back!");
      const destination =
        isAdminRole(record?.role) || hasCompletedOnboarding(email)
          ? "/dashboard"
          : "/onboarding";
      await router.navigate({ to: destination });
    } catch (error) {
      toast.error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Log in to your healthy plate.">
      <form onSubmit={submit} className="space-y-4">
        <div><Label>Email</Label><Input type="email" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></div>
        <div><Label>Password</Label><PasswordInput autoComplete="current-password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">Forgot password?</Link>
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
          {loading ? "Logging in…" : "Log in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
