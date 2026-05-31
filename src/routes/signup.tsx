import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { toast } from "sonner";
import { auth } from "@/firebase.js";
import { redirectIfAuthenticated, formatAuthError } from "@/lib/auth-guard";
import { syncProfileFromAuth, markOnboardingComplete } from "@/lib/store";
import { isAdminRole } from "@/lib/admin";
import { syncUserRecord, getUserRecord } from "@/lib/users.firestore";
import { getPlatformSettings } from "@/lib/platform.firestore";
import { sendVerificationEmail } from "@/lib/auth-actions";

export const Route = createFileRoute("/signup")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Sign up — Smart Healthy Plate" }] }),
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getPlatformSettings()
      .then((s) => setSignupEnabled(s.signupEnabled))
      .finally(() => setChecking(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupEnabled) return toast.error("Sign-ups are currently closed.");
    if (!form.email || !form.password) return toast.error("Fill all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password,
      );
      const name = form.name || "Friend";
      if (name) {
        await updateProfile(credential.user, { displayName: name });
      }
      syncProfileFromAuth(form.email.trim(), name);
      await syncUserRecord(credential.user, name);
      const record = await getUserRecord(credential.user.uid);
      if (isAdminRole(record?.role)) {
        markOnboardingComplete(form.email.trim());
      } else {
        try {
          await sendVerificationEmail(credential.user);
        } catch {
          /* verification email is optional */
        }
      }
      toast.success("Welcome! Let's set up your plan.");
      await router.navigate({ to: "/onboarding" });
    } catch (error) {
      toast.error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  if (!signupEnabled) {
    return (
      <AuthFrame title="Sign-ups closed" subtitle="New registrations are temporarily disabled.">
        <p className="mb-4 text-sm text-muted-foreground">
          Please check back later or contact us if you need access.
        </p>
        <Link to="/login">
          <Button className="w-full rounded-full" size="lg">Back to log in</Button>
        </Link>
      </AuthFrame>
    );
  }

  return <AuthFrame title="Create your account" subtitle="Start your healthier week today.">
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Sara"/></div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></div>
      <div><Label>Password</Label><PasswordInput autoComplete="new-password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="Your password"/></div>
      <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
        {loading ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
      </p>
    </form>
  </AuthFrame>;
}

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-primary/10 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground"><Leaf className="h-5 w-5"/></div>
            <span className="font-display text-lg font-semibold">Smart Healthy Plate</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight">Cook smart.<br/>Eat healthy.<br/>Track your progress.</h2>
            <p className="mt-4 max-w-sm text-muted-foreground">A friendly daily companion that turns whatever's in your fridge into a balanced plate.</p>
          </div>
          <div className="text-xs text-muted-foreground">© Smart Healthy Plate</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 mb-6 text-sm text-muted-foreground">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
