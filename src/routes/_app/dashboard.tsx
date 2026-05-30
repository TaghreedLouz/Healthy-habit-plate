import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, calcTargets, getToday, updateToday, todayStr } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Droplet, Footprints, Plus, Carrot, ChefHat, Bell, Sparkles, TrendingUp, Weight } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Smart Healthy Plate" }] }),
  component: Dashboard,
});

const tips = [
  "Eat the rainbow — aim for 3 colors on your plate.",
  "Drink a glass of water before each meal.",
  "Add a fist of greens to lunch and dinner.",
  "Walk for 10 minutes after meals to aid digestion.",
  "Sleep is part of your nutrition — aim for 7–8h.",
];

function Dashboard() {
  const user = useStore((s) => s.user);
  const allMeals = useStore((s) => s.meals);
  const meals = allMeals.filter((m) => m.date === todayStr());
  const day = useStore(getToday);
  const targets = calcTargets(user);
  const consumed = meals.reduce((sum, m) => sum + m.calories, 0);
  const remaining = Math.max(0, targets.calories - consumed);
  const tip = tips[new Date().getDate() % tips.length];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">
          Hi {user?.name?.split(" ")[0] ?? "friend"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's your healthy day at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="Calories" value={`${consumed}`} sub={`of ${targets.calories} kcal`} pct={consumed/targets.calories*100} color="bg-accent"/>
        <StatCard icon={Droplet} label="Water" value={`${day.water}`} sub={`of ${targets.water} cups`} pct={day.water/targets.water*100} color="bg-primary"/>
        <StatCard icon={Footprints} label="Steps" value={`${day.steps.toLocaleString()}`} sub={`of ${targets.steps.toLocaleString()}`} pct={day.steps/targets.steps*100} color="bg-chart-3"/>
        <StatCard icon={Weight} label="Weight" value={`${day.weight ?? user?.weight ?? "—"} kg`} sub={`target ${user?.targetWeight} kg`} pct={50} color="bg-chart-4"/>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Today's meals</h2>
              <Link to="/calories"><Button variant="ghost" size="sm" className="rounded-full">View all</Button></Link>
            </div>
            {meals.length === 0 ? (
              <EmptyState
                title="No meals logged yet"
                body="Log a meal to start tracking your calories."
                cta={<Link to="/calories"><Button className="rounded-full"><Plus className="mr-1 h-4 w-4"/>Add a meal</Button></Link>}
              />
            ) : (
              <ul className="divide-y">
                {meals.map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.slot}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">{m.calories} kcal</div>
                      <div className="text-xs text-muted-foreground">P {m.protein} · C {m.carbs} · F {m.fats}</div>
                    </div>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-3 font-medium">
                  <span>Remaining</span>
                  <span className="text-primary">{remaining} kcal</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">Tip of the day</span>
            </div>
            <p className="mt-3 font-display text-xl leading-snug">{tip}</p>
            <Link to="/recipes"><Button variant="outline" className="mt-6 rounded-full">Browse healthy recipes</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Quick to="/calories" icon={Flame} label="Add meal"/>
          <Quick to="/ingredients" icon={Carrot} label="Ingredients"/>
          <Quick to="/recipes" icon={ChefHat} label="Recipes"/>
          <Quick to="/water" icon={Droplet} label="Water"/>
          <Quick to="/steps" icon={Footprints} label="Steps"/>
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/20 text-accent-foreground"><Bell className="h-5 w-5"/></div>
            <div>
              <div className="font-medium">Hydration reminder</div>
              <div className="text-sm text-muted-foreground">You still need {Math.max(0,targets.water-day.water)} cups to hit your water goal.</div>
            </div>
          </div>
          <Button className="rounded-full" onClick={()=>updateToday({water: day.water+1})}>+ Cup</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, pct, color }: any) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-2xl ${color}/15 text-foreground`}>
            <Icon className="h-5 w-5"/>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
        <div className="mt-4 font-display text-3xl font-semibold">{value}</div>
        <div className="text-sm text-muted-foreground">{sub}</div>
        <Progress value={Math.min(100, pct)} className="mt-3 h-1.5"/>
      </CardContent>
    </Card>
  );
}

function Quick({ to, icon: Icon, label }: any) {
  return (
    <Link to={to} className="group rounded-3xl border bg-card p-4 transition hover:border-primary hover:shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4 w-4"/>
      </div>
      <div className="mt-3 text-sm font-medium">{label}</div>
    </Link>
  );
}

function EmptyState({ title, body, cta }: any) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed py-10 text-center">
      <div className="font-medium">{title}</div>
      <div className="mb-4 text-sm text-muted-foreground">{body}</div>
      {cta}
    </div>
  );
}
