import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthFrame } from "./signup";
import { supabase } from "@/integrations/supabase/client";
import { redirectIfAuthenticated } from "@/lib/auth-guard";
import { store, syncProfileFromAuth } from "@/lib/store";

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    const email = data.user?.email ?? form.email.trim();
    const name = (data.user?.user_metadata?.name as string | undefined) ?? undefined;
    syncProfileFromAuth(email, name);

    toast.success("Welcome back!");
    const onboarded = store.get().user?.onboarded;
    router.navigate({ to: onboarded ? "/dashboard" : "/onboarding" });
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Log in to your healthy plate.">
      <form onSubmit={submit} className="space-y-4">
        <div><Label>Email</Label><Input type="email" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></div>
        <div><Label>Password</Label><Input type="password" autoComplete="current-password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></div>
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
