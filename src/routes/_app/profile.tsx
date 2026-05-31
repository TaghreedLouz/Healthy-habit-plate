import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, store, calcTargets, clearLocalProfile } from "@/lib/store";
import { useAuth, signOut } from "@/lib/auth";
import { formatAuthError } from "@/lib/auth-guard";
import { changePassword, sendVerificationEmail } from "@/lib/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Smart Healthy Plate" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useStore((s) => s.user);
  const { user: authUser, loading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);

  if (loading || !authUser) return null;
  if (!user) return null;
  const t = calcTargets(user);

  function save(patch: Partial<typeof user>) {
    store.set((s) => ({ ...s, user: { ...(s.user as any), ...patch } }));
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setChangingPassword(true);
    try {
      await changePassword(authUser, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (error) {
      toast.error(formatAuthError(error));
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleResendVerification() {
    setSendingVerify(true);
    try {
      await sendVerificationEmail(authUser);
      toast.success("Verification email sent");
    } catch (error) {
      toast.error(formatAuthError(error));
    } finally {
      setSendingVerify(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Your profile</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl"><CardContent className="p-5"><div className="text-xs uppercase text-muted-foreground">Daily calories</div><div className="font-display text-3xl">{t.calories}</div></CardContent></Card>
        <Card className="rounded-3xl"><CardContent className="p-5"><div className="text-xs uppercase text-muted-foreground">Water cups</div><div className="font-display text-3xl">{t.water}</div></CardContent></Card>
        <Card className="rounded-3xl"><CardContent className="p-5"><div className="text-xs uppercase text-muted-foreground">Steps</div><div className="font-display text-3xl">{t.steps.toLocaleString()}</div></CardContent></Card>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={user.name} onChange={(e)=>save({name:e.target.value})}/></div>
          <div><Label>Email</Label><Input value={user.email} readOnly className="bg-muted/50"/></div>
          <div><Label>Age</Label><Input type="number" value={user.age} onChange={(e)=>save({age:+e.target.value})}/></div>
          <div>
            <Label>Gender</Label>
            <Select value={user.gender} onValueChange={(v)=>save({gender:v as any})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Height (cm)</Label><Input type="number" value={user.height} onChange={(e)=>save({height:+e.target.value})}/></div>
          <div><Label>Weight (kg)</Label><Input type="number" value={user.weight} onChange={(e)=>save({weight:+e.target.value})}/></div>
          <div><Label>Target weight (kg)</Label><Input type="number" value={user.targetWeight} onChange={(e)=>save({targetWeight:+e.target.value})}/></div>
          <div>
            <Label>Activity</Label>
            <Select value={user.activity} onValueChange={(v)=>save({activity:v as any})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Goal</Label>
            <Select value={user.goal} onValueChange={(v)=>save({goal:v as any})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Lose weight</SelectItem>
                <SelectItem value="gain">Gain weight</SelectItem>
                <SelectItem value="maintain">Maintain weight</SelectItem>
                <SelectItem value="healthier">Eat healthier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!authUser.emailVerified && (
        <Card className="rounded-3xl border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="font-medium">Verify your email</div>
              <div className="text-sm text-muted-foreground">Confirm {authUser.email} to secure your account.</div>
            </div>
            <Button variant="outline" className="rounded-full" disabled={sendingVerify} onClick={handleResendVerification}>
              {sendingVerify ? "Sending…" : "Send verification email"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Change password</h2>
          <form onSubmit={handleChangePassword} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Current password</Label>
              <PasswordInput autoComplete="current-password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)}/>
            </div>
            <div>
              <Label>New password</Label>
              <PasswordInput autoComplete="new-password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)}/>
            </div>
            <div>
              <Label>Confirm new password</Label>
              <PasswordInput autoComplete="new-password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={changingPassword} className="rounded-full">
                {changingPassword ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
        <Button variant="outline" onClick={async () => {
          try {
            await signOut();
            clearLocalProfile();
            await router.navigate({ to: "/login" });
          } catch (err) {
            toast.error(formatAuthError(err instanceof Error ? err.message : "Could not log out."));
          }
        }}>Log out</Button>
      </div>
    </div>
  );
}
