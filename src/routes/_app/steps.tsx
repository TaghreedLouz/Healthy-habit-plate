import { createFileRoute } from "@tanstack/react-router";
import { calcTargets, getToday, updateToday, useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/steps")({
  head: () => ({ meta: [{ title: "Steps tracker — Smart Healthy Plate" }] }),
  component: Steps,
});

function Steps() {
  const user = useStore((s) => s.user);
  const day = useStore(getToday);
  const target = calcTargets(user).steps;
  const burned = Math.round(day.steps * 0.04);
  const pct = Math.min(100, day.steps/target*100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Steps tracker</h1>
        <p className="mt-1 text-muted-foreground">Move a little, often.</p>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-baseline justify-between">
            <div className="font-display text-5xl font-semibold">{day.steps.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">of {target.toLocaleString()} steps</div>
          </div>
          <Progress value={pct} className="mt-4 h-3"/>
          <div className="mt-4 text-sm">Estimated calories burned: <span className="font-semibold">{burned} kcal</span></div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={()=>updateToday({steps: day.steps+500})}>+500</Button>
            <Button variant="outline" className="rounded-full" onClick={()=>updateToday({steps: day.steps+1000})}>+1,000</Button>
            <Button variant="outline" className="rounded-full" onClick={()=>updateToday({steps: day.steps+2000})}>+2,000</Button>
            <Button variant="ghost" className="rounded-full" onClick={()=>updateToday({steps: 0})}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-2 text-sm font-medium">Set steps manually</div>
          <Input type="number" value={day.steps} onChange={(e)=>updateToday({steps: +e.target.value || 0})}/>
        </CardContent>
      </Card>
    </div>
  );
}
