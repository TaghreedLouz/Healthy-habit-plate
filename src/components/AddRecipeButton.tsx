import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMeal, removeMeal, todayStr, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export type AddRecipeInput = {
  id: string;
  name: string;
  bestTime: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

function CheckIcon({ active, onPrimary }: { active: boolean; onPrimary?: boolean }) {
  return (
    <Check
      className={cn(
        "h-4 w-4 shrink-0",
        active && (onPrimary ? "text-primary-foreground" : "text-primary"),
      )}
      strokeWidth={active ? 3 : 2}
    />
  );
}

export function AddRecipeButton({
  recipe,
  slot,
  variant = "icon",
  label = "Add",
  addedLabel = "Added",
  className,
}: {
  recipe: AddRecipeInput;
  slot?: MealSlot;
  variant?: "icon" | "full";
  label?: string;
  addedLabel?: string;
  className?: string;
}) {
  const mealEntry = useStore((s) =>
    s.meals.find((m) => m.date === todayStr() && m.recipeId === recipe.id),
  );
  const added = Boolean(mealEntry);

  const mealSlot = slot ?? (recipe.bestTime.toLowerCase() as MealSlot);

  function handleAdd() {
    if (added && mealEntry) {
      removeMeal(mealEntry.id);
      toast.success("Removed from today's meals");
      return;
    }

    addMeal({
      slot: mealSlot,
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      recipeId: recipe.id,
    });
    toast.success("Added to today's meals");
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        size="icon"
        variant={added ? "default" : "outline"}
        className={cn(
          "rounded-full transition-all duration-200 shrink-0",
          added && "bg-primary text-primary-foreground hover:bg-primary/90",
          className,
        )}
        onClick={handleAdd}
        aria-pressed={added}
        aria-label={added ? addedLabel : label}
      >
        <CheckIcon active={added} onPrimary={added} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={added ? "default" : "outline"}
      className={cn(
        "rounded-full transition-all duration-200",
        added && "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      onClick={handleAdd}
      aria-pressed={added}
    >
      <CheckIcon active={added} onPrimary={added} />
      <span className="ml-1">{added ? addedLabel : label}</span>
    </Button>
  );
}
