import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, toggleSaved, addMeal } from "@/lib/store";
import { suggestRecipes, type Recipe } from "@/lib/recipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Plus, Flame, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recipes")({
  head: () => ({ meta: [{ title: "Recipe suggestions — Smart Healthy Plate" }] }),
  component: RecipesPage,
});

function RecipesPage() {
  const ingredients = useStore((s) => s.ingredients);
  const saved = useStore((s) => s.saved);
  const list = suggestRecipes(ingredients);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Healthy recipe suggestions</h1>
          <p className="mt-1 text-muted-foreground">
            {ingredients.length ? `Based on ${ingredients.length} ingredient${ingredients.length>1?"s":""} you added.` : "Browse our healthy recipe collection."}
          </p>
        </div>
        <Link to="/ingredients"><Button variant="outline" className="rounded-full">Edit ingredients</Button></Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <RecipeCard key={r.id} r={r} savedIds={saved} missing={r.missing} />
        ))}
      </div>
    </div>
  );
}

export function RecipeCard({ r, savedIds, missing }: { r: Recipe; savedIds: string[]; missing?: string[] }) {
  const isSaved = savedIds.includes(r.id);
  return (
    <Card className="overflow-hidden rounded-3xl pt-0 transition hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
        <Badge className="absolute right-3 top-3 rounded-full bg-card text-foreground shadow">
          <Flame className="mr-1 h-3 w-3 text-accent"/> {r.health}% healthy
        </Badge>
      </div>
      <CardContent className="space-y-3 p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.bestTime}</div>
          <h3 className="font-display text-xl font-semibold leading-tight">{r.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-secondary/60 p-3 text-center text-xs">
          <Macro v={`${r.calories}`} l="kcal"/>
          <Macro v={`${r.protein}g`} l="protein"/>
          <Macro v={`${r.carbs}g`} l="carbs"/>
          <Macro v={`${r.fats}g`} l="fats"/>
        </div>
        {missing && missing.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Add-ons:</span> {missing.join(", ")}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link to="/recipes/$id" params={{ id: r.id }} className="flex-1">
            <Button variant="outline" className="w-full rounded-full">
              <Clock className="mr-1 h-4 w-4"/> View
            </Button>
          </Link>
          <Button size="icon" variant="outline" className="rounded-full"
            onClick={() => { toggleSaved(r.id); toast.success(isSaved ? "Removed from saved" : "Saved!"); }}>
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}/>
          </Button>
          <Button size="icon" className="rounded-full"
            onClick={() => {
              addMeal({ slot: r.bestTime.toLowerCase() as any, name: r.name, calories: r.calories, protein: r.protein, carbs: r.carbs, fats: r.fats, recipeId: r.id });
              toast.success("Added to today's meals");
            }}>
            <Plus className="h-4 w-4"/>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Macro({ v, l }: { v: string; l: string }) {
  return (<div><div className="font-semibold">{v}</div><div className="text-muted-foreground">{l}</div></div>);
}
