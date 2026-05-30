import { createFileRoute } from "@tanstack/react-router";
import { calcTargets, getToday, updateToday, useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/water")({
  head: () => ({ meta: [{ title: "Water tracker — Smart Healthy Plate" }] }),
  component: Water,
});

function Water() {
  const user = useStore((s) => s.user);
  const day = useStore(getToday);
  const target = calcTargets(user).water;
  const pct = Math.min(100, day.water/target*100);
  const msg = day.water >= target
    ? "Great job — you hit your water goal! 🎉"
    : `You still need ${target - day.water} cup${target-day.water>1?"s":""} today.`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Water tracker</h1>
        <p className="mt-1 text-muted-foreground">Stay hydrated — small sips add up.</p>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="relative mx-auto h-48 w-48">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" stroke="var(--color-secondary)" strokeWidth="10" fill="none"/>
              <circle cx="50" cy="50" r="44" stroke="var(--color-primary)" strokeWidth="10" fill="none"
                strokeDasharray={`${pct*2.76} 999`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="font-display text-5xl font-semibold">{day.water}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">of {target} cups</div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">{msg}</div>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" size="lg" className="rounded-full" onClick={()=>updateToday({water:Math.max(0,day.water-1)})}>
              <Minus className="mr-1 h-4 w-4"/>Remove
            </Button>
            <Button size="lg" className="rounded-full" onClick={()=>updateToday({water:day.water+1})}>
              <Plus className="mr-1 h-4 w-4"/>Add a cup
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-8">
        {Array.from({length: target}).map((_, i) => (
          <div key={i} className={`grid aspect-square place-items-center rounded-2xl border ${i < day.water ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
            <Droplet className="h-6 w-6"/>
          </div>
        ))}
      </div>
    </div>
  );
}
