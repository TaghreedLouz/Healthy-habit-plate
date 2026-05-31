import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthFrame } from "./signup";
import { requestPasswordReset } from "@/lib/auth-actions";
import { redirectIfAuthenticated, formatAuthError } from "@/lib/auth-guard";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({ meta: [{ title: "Reset password — Smart Healthy Plate" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your email");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success("Check your email for a reset link.");
    } catch (error) {
      toast.error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthFrame title="Check your email" subtitle={`We sent a reset link to ${email.trim()}.`}>
        <p className="mb-4 text-sm text-muted-foreground">
          Click the link in the email to choose a new password. If you don't see it, check your spam folder.
        </p>
        <Link to="/login">
          <Button className="w-full rounded-full" size="lg">Back to log in</Button>
        </Link>
      </AuthFrame>
    );
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
