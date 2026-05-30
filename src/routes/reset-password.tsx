import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthFrame } from "./signup";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Smart Healthy Plate" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else router.navigate({ to: "/forgot-password" });
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're all set.");
    router.navigate({ to: "/dashboard" });
  }

  if (!ready) return null;

  return (
    <AuthFrame title="Choose a new password" subtitle="Enter a strong password for your account.">
      <form onSubmit={submit} className="space-y-4">
        <div><Label>New password</Label><Input type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)}/></div>
        <div><Label>Confirm password</Label><Input type="password" autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}/></div>
        <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
          {loading ? "Saving…" : "Update password"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/dashboard" className="font-medium text-primary hover:underline">Back to dashboard</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
