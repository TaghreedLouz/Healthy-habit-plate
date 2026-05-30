import { createFileRoute } from "@tanstack/react-router";
import { useStore, store, calcTargets, logout } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Smart Healthy Plate" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useStore((s) => s.user);
  const router = useRouter();
  if (!user) return null;
  const t = calcTargets(user);

  function save(patch: Partial<typeof user>) {
    store.set((s) => ({ ...s, user: { ...(s.user as any), ...patch } }));
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
          <div><Label>Email</Label><Input value={user.email} onChange={(e)=>save({email:e.target.value})}/></div>
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

      <div className="flex justify-between">
        <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
        <Button variant="outline" onClick={() => { logout(); router.navigate({ to: "/login" }); }}>Log out</Button>
      </div>
    </div>
  );
}
