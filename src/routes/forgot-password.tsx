import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthFrame } from "./signup";
import { supabase } from "@/integrations/supabase/client";
import { redirectIfAuthenticated } from "@/lib/auth-guard";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Reset password — Smart Healthy Plate" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for a reset link.");
  }

  return (
    <AuthFrame title="Reset your password" subtitle="We'll email you a secure reset link.">
      <form onSubmit={submit} className="space-y-4">
        <div><Label>Email</Label><Input type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)}/></div>
        <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remember it? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
