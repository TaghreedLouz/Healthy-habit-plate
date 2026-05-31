import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRecipeCatalog } from "@/lib/recipes-catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calcTargets, useStore } from "@/lib/store";
import { AddRecipeButton } from "@/components/AddRecipeButton";

export const Route = createFileRoute("/_app/meal-plan")({
  head: () => ({ meta: [{ title: "Meal plan — Smart Healthy Plate" }] }),
  component: MealPlan,
});

function MealPlan() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const { recipes } = useRecipeCatalog();
  const target = calcTargets(user).calories;
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
  const plan = Object.fromEntries(
    slots.map((slot) => [slot, recipes.find((r) => r.bestTime === slot) ?? recipes[0]]),
  ) as Record<(typeof slots)[number], (typeof recipes)[number] | undefined>;
  const total = Object.values(plan).reduce((a, r) => a + (r?.calories ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Today's meal plan</h1>
        <p className="mt-1 text-muted-foreground">Curated to match your {user?.goal} goal — about {total} kcal of {target}.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {Object.entries(plan).map(([slot, r]) => {
          if (!r) return null;
          return (
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex-1 rounded-full"
                  onClick={() => void navigate({ to: "/recipes/$id", params: { id: r.id } })}
                >
                  View recipe
                </Button>
                <AddRecipeButton
                  recipe={r}
                  slot={slot.toLowerCase() as "breakfast" | "lunch" | "dinner" | "snack"}
                  variant="full"
                />
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
