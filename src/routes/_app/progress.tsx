import { createFileRoute } from "@tanstack/react-router";
import { calcTargets, useStore, updateToday, todayStr } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({ meta: [{ title: "Progress — Smart Healthy Plate" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const user = useStore((s) => s.user);
  const days = useStore((s) => s.days);
  const meals = useStore((s) => s.meals);
  const targets = calcTargets(user);

  // last 7 days
  const today = new Date();
  const week = Array.from({length:7}).map((_,i) => {
    const d = new Date(today); d.setDate(today.getDate()-(6-i));
    const ds = d.toISOString().slice(0,10);
    const log = days.find((x)=>x.date===ds);
    const cal = meals.filter((m)=>m.date===ds).reduce((a,m)=>a+m.calories,0);
    return { day: d.toLocaleDateString(undefined,{weekday:"short"}), water: log?.water??0, steps: log?.steps??0, weight: log?.weight, calories: cal };
  });

  const todayLog = days.find((d)=>d.date===todayStr());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Your progress</h1>
        <p className="mt-1 text-muted-foreground">Weekly view of calories, water, steps and weight.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Calories this week" target={targets.calories}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={week}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12}/>
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12}/>
              <Tooltip contentStyle={{borderRadius:12,border:"1px solid var(--color-border)"}}/>
              <Bar dataKey="calories" fill="var(--color-accent)" radius={[8,8,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Water (cups)" target={targets.water}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={week}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12}/>
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12}/>
              <Tooltip contentStyle={{borderRadius:12,border:"1px solid var(--color-border)"}}/>
              <Bar dataKey="water" fill="var(--color-primary)" radius={[8,8,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Steps" target={targets.steps}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={week}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12}/>
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12}/>
              <Tooltip contentStyle={{borderRadius:12,border:"1px solid var(--color-border)"}}/>
              <Line type="monotone" dataKey="steps" stroke="var(--color-chart-3)" strokeWidth={3} dot={{r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <h3 className="mb-1 font-display text-lg font-semibold">Weight tracker</h3>
            <p className="mb-3 text-sm text-muted-foreground">Current: {todayLog?.weight ?? user?.weight} kg · target {user?.targetWeight} kg</p>
            <div className="flex gap-2">
              <Input type="number" placeholder="Log today's weight" defaultValue={todayLog?.weight ?? ""}
                onBlur={(e)=>e.target.value && updateToday({weight: +e.target.value})}/>
              <Button className="rounded-full" onClick={(e)=>{
                const input = (e.currentTarget.previousSibling as HTMLInputElement);
                if (input?.value) updateToday({weight: +input.value});
              }}>Save</Button>
            </div>
            <div className="mt-5 rounded-2xl bg-secondary/60 p-4 text-sm">
              <div className="font-medium">Goal progress</div>
              <div className="mt-1 text-muted-foreground">
                {user && (user.weight === user.targetWeight
                  ? "You're at your target — maintain!"
                  : `${Math.abs((todayLog?.weight ?? user.weight) - user.targetWeight).toFixed(1)} kg to go`)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, target, children }: any) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="p-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <span className="text-xs text-muted-foreground">target {typeof target === "number" ? target.toLocaleString() : target}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
