import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, useStore, calcTargets } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { requireAuthSession } from "@/lib/auth-guard";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    await requireAuthSession();
    const onboarded = store.get().user?.onboarded ?? false;
    if (onboarded) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Set up your plan — Smart Healthy Plate" }] }),
  component: Onboard,
});

function Onboard() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (loading) return;
    if (!session) router.navigate({ to: "/login" });
  }, [session, loading, router]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    age: user?.age ?? 25,
    gender: user?.gender ?? "other",
    height: user?.height ?? 170,
    weight: user?.weight ?? 70,
    targetWeight: user?.targetWeight ?? 68,
    activity: user?.activity ?? "moderate",
    goal: user?.goal ?? "healthier",
  });

  if (loading || !session) return null;

  function finish() {
    store.set((s) => ({
      ...s,
      user: { ...(s.user as NonNullable<typeof s.user>), ...form, onboarded: true },
    }));
    const t = calcTargets({ ...(user as NonNullable<typeof user>), ...form });
    toast.success(`Plan ready: ${t.calories} kcal · ${t.water} cups · ${t.steps} steps`);
    router.navigate({ to: "/dashboard" });
  }

  const steps = [
    { title: "What should we call you?", body: (
      <div className="space-y-4">
        <div><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e)=>setForm({...form,age:+e.target.value})}/></div>
          <div>
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v)=>setForm({...form,gender:v as typeof form.gender})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )},
    { title: "Your body basics", body: (
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Height (cm)</Label><Input type="number" value={form.height} onChange={(e)=>setForm({...form,height:+e.target.value})}/></div>
        <div><Label>Current weight (kg)</Label><Input type="number" value={form.weight} onChange={(e)=>setForm({...form,weight:+e.target.value})}/></div>
        <div className="col-span-2"><Label>Target weight (kg)</Label><Input type="number" value={form.targetWeight} onChange={(e)=>setForm({...form,targetWeight:+e.target.value})}/></div>
      </div>
    )},
    { title: "Your daily activity", body: (
      <div className="grid gap-3">
        {[
          ["sedentary","Mostly sitting"],
          ["light","Light activity 1-3x/week"],
          ["moderate","Moderate activity 3-5x/week"],
          ["active","Very active 6-7x/week"],
        ].map(([v,l]) => (
          <button key={v} type="button" onClick={()=>setForm({...form,activity:v as typeof form.activity})}
            className={`rounded-2xl border p-4 text-left transition ${form.activity===v ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}>
            <div className="font-medium capitalize">{v}</div>
            <div className="text-sm text-muted-foreground">{l}</div>
          </button>
        ))}
      </div>
    )},
    { title: "What's your goal?", body: (
      <div className="grid grid-cols-2 gap-3">
        {[
          ["lose","🔥 Lose weight"],
          ["gain","💪 Gain weight"],
          ["maintain","⚖️ Maintain"],
          ["healthier","🥗 Eat healthier"],
        ].map(([v,l]) => (
          <button key={v} type="button" onClick={()=>setForm({...form,goal:v as typeof form.goal})}
            className={`rounded-2xl border p-4 text-left transition ${form.goal===v ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}>
            {l}
          </button>
        ))}
      </div>
    )},
  ];

  const cur = steps[step];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground"><Leaf className="h-5 w-5"/></div>
          <span className="font-display text-lg font-semibold">Smart Healthy Plate</span>
        </div>
        <div className="mb-6 flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold">{cur.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
        <div className="mt-6 rounded-3xl border bg-card p-6">{cur.body}</div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step===0}>Back</Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="rounded-full">Continue</Button>
          ) : (
            <Button onClick={finish} className="rounded-full">Finish setup</Button>
          )}
        </div>
      </div>
    </div>
  );
}
