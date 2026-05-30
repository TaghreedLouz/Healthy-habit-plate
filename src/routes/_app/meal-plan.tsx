import { createFileRoute, Link } from "@tanstack/react-router";
import { recipes } from "@/lib/recipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addMeal, calcTargets, useStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/meal-plan")({
  head: () => ({ meta: [{ title: "Meal plan — Smart Healthy Plate" }] }),
  component: MealPlan,
});

function MealPlan() {
  const user = useStore((s) => s.user);
  const target = calcTargets(user).calories;
  const plan = {
    Breakfast: recipes.find((r) => r.bestTime === "Breakfast")!,
    Lunch: recipes.find((r) => r.bestTime === "Lunch")!,
    Dinner: recipes.find((r) => r.bestTime === "Dinner")!,
    Snack: recipes.find((r) => r.bestTime === "Snack")!,
  };
  const total = Object.values(plan).reduce((a, r) => a + r.calories, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Today's meal plan</h1>
        <p className="mt-1 text-muted-foreground">Curated to match your {user?.goal} goal — about {total} kcal of {target}.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {Object.entries(plan).map(([slot, r]) => (
          <Card key={slot} className="overflow-hidden rounded-3xl pt-0">
            <div className="aspect-[16/9] overflow-hidden">
              <img src={r.image} alt={r.name} className="h-full w-full object-cover"/>
            </div>
            <CardContent className="space-y-3 p-5">
              <div className="text-xs uppercase tracking-wider text-primary">{slot}</div>
              <h3 className="font-display text-xl font-semibold">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm"><span className="font-semibold">{r.calories} kcal</span> · {r.protein}P · {r.carbs}C · {r.fats}F</div>
                <div className="text-xs text-primary">{r.health}% healthy</div>
              </div>
              <div className="text-sm text-muted-foreground italic">Why: {r.why}</div>
              <div className="flex gap-2">
                <Link to="/recipes/$id" params={{id:r.id}} className="flex-1"><Button variant="outline" className="w-full rounded-full">View recipe</Button></Link>
                <Button className="rounded-full" onClick={() => {
                  addMeal({slot: slot.toLowerCase() as any, name:r.name,calories:r.calories,protein:r.protein,carbs:r.carbs,fats:r.fats,recipeId:r.id});
                  toast.success(`${slot} added`);
                }}><Plus className="mr-1 h-4 w-4"/>Add</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
