import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthFrame } from "./signup";
import { completePasswordReset, verifyPasswordReset } from "@/lib/auth-actions";
import { formatAuthError } from "@/lib/auth-guard";

type ResetSearch = {
  mode?: string;
  oobCode?: string;
};

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    mode: typeof search.mode === "string" ? search.mode : undefined,
    oobCode: typeof search.oobCode === "string" ? search.oobCode : undefined,
  }),
  head: () => ({ meta: [{ title: "Set new password — Smart Healthy Plate" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const { mode, oobCode } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (mode !== "resetPassword" || !oobCode) {
        if (active) {
          setInvalid(true);
          setChecking(false);
        }
        return;
      }

      try {
        const email = await verifyPasswordReset(oobCode);
        if (active) {
          setResetEmail(email);
          setChecking(false);
        }
      } catch {
        if (active) {
          setInvalid(true);
          setChecking(false);
        }
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [mode, oobCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!oobCode) return;
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await completePasswordReset(oobCode, password);
      toast.success("Password updated. You can log in now.");
      await router.navigate({ to: "/login" });
    } catch (error) {
      toast.error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <AuthFrame title="Verifying link…" subtitle="Please wait while we confirm your reset link.">
        <p className="text-sm text-muted-foreground">This only takes a moment.</p>
      </AuthFrame>
    );
  }

  if (invalid) {
    return (
      <AuthFrame title="Link expired" subtitle="This password reset link is invalid or has expired.">
        <p className="mb-4 text-sm text-muted-foreground">
          Request a new reset link and try again.
        </p>
        <Link to="/forgot-password">
          <Button className="w-full rounded-full" size="lg">Request new link</Button>
        </Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Choose a new password"
      subtitle={resetEmail ? `Set a new password for ${resetEmail}.` : "Enter a strong password for your account."}
    >
      <form onSubmit={submit} className="space-y-4">
        <div><Label>New password</Label><PasswordInput autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)}/></div>
        <div><Label>Confirm password</Label><PasswordInput autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}/></div>
        <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
          {loading ? "Saving…" : "Update password"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">Back to log in</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
