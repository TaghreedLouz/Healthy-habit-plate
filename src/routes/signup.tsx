import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { redirectIfAuthenticated } from "@/lib/auth-guard";
import { syncProfileFromAuth } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Sign up — Smart Healthy Plate" }] }),
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name: form.name || "Friend" },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    syncProfileFromAuth(form.email.trim(), form.name || "Friend");

    if (!data.session) {
      toast.success("Check your email to confirm your account, then log in.");
      router.navigate({ to: "/login" });
      return;
    }
    toast.success("Welcome! Let's set up your plan.");
    router.navigate({ to: "/onboarding" });
  }

  return <AuthFrame title="Create your account" subtitle="Start your healthier week today.">
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Sara"/></div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></div>
      <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></div>
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
