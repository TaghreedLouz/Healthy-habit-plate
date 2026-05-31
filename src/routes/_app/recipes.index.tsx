import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore, toggleSaved } from "@/lib/store";
import { AddRecipeButton } from "@/components/AddRecipeButton";
import { suggestFromCatalog, useRecipeCatalog, filterRecipes, type RecipeMealFilter } from "@/lib/recipes-catalog";
import { generateAiRecipes } from "@/lib/ai-recipes.functions";
import { generateLocalAiRecipes } from "@/lib/ai-recipes.local";
import { cacheAiRecipes } from "@/lib/ai-recipes";
import { useAuth } from "@/lib/auth";
import { AdminAiRecipeDialog } from "@/components/admin/AdminAiRecipeDialog";
import type { Recipe } from "@/lib/recipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeCardImage } from "@/components/RecipeCardImage";
import { Bookmark, Flame, Clock, Sparkles, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const MEAL_FILTERS: { label: string; value: RecipeMealFilter }[] = [
  { label: "All", value: "all" },
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "Dinner", value: "Dinner" },
  { label: "Snack", value: "Snack" },
];

export const Route = createFileRoute("/_app/recipes/")({
  head: () => ({ meta: [{ title: "Recipe suggestions — Smart Healthy Plate" }] }),
  component: RecipesPage,
});

function RecipesPage() {
  const ingredients = useStore((s) => s.ingredients);
  const saved = useStore((s) => s.saved);
  const { isAdmin } = useAuth();
  const { recipes: catalogRecipes, loading: catalogLoading } = useRecipeCatalog();
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState<RecipeMealFilter>("all");

  const list = useMemo(() => {
    const suggested = suggestFromCatalog(ingredients, catalogRecipes);
    return filterRecipes(suggested, { search, bestTime: mealFilter });
  }, [ingredients, catalogRecipes, search, mealFilter]);

  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSaveTarget, setAiSaveTarget] = useState<Recipe | null>(null);
  const ingredientsKey = useMemo(() => ingredients.join("|"), [ingredients]);

  const filteredAiRecipes = useMemo(
    () => filterRecipes(aiRecipes, { search, bestTime: mealFilter }),
    [aiRecipes, search, mealFilter],
  );

  useEffect(() => {
    if (!ingredients.length) {
      setAiRecipes([]);
      return;
    }

    let active = true;
    setAiLoading(true);

    generateAiRecipes({ data: { ingredients } })
      .then((result) => {
        if (!active) return;
        setAiRecipes(result.recipes);
        cacheAiRecipes(result.recipes);
      })
      .catch(() => {
        if (!active) return;
        const local = generateLocalAiRecipes(ingredients);
        setAiRecipes(local);
        cacheAiRecipes(local);
      })
      .finally(() => {
        if (active) setAiLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ingredientsKey, ingredients]);

  return (
    <div className="space-y-10">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes…"
              className="rounded-full pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {MEAL_FILTERS.map((f) => (
              <Button
                key={f.value}
                type="button"
                size="sm"
                variant={mealFilter === f.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setMealFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {catalogLoading && (
          <p className="text-sm text-muted-foreground">Loading recipe library…</p>
        )}

        {!catalogLoading && list.length === 0 && (
          <p className="text-sm text-muted-foreground">No recipes match your search or filters.</p>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <RecipeCard key={r.id} r={r} savedIds={saved} missing={r.missing} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-semibold">AI Recipes</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {ingredients.length
            ? "Generated from your current ingredients. Updates when you change them."
            : "Add ingredients to generate 5 AI recipe ideas."}
        </p>

        {aiLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI recipes…
          </div>
        )}

        {!ingredients.length && !aiLoading && (
          <Link to="/ingredients">
            <Button variant="outline" className="rounded-full">Add ingredients</Button>
          </Link>
        )}

        {aiRecipes.length > 0 && !aiLoading && filteredAiRecipes.length === 0 && (
          <p className="text-sm text-muted-foreground">No AI recipes match your search or filters.</p>
        )}

        {filteredAiRecipes.length > 0 && !aiLoading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAiRecipes.map((r) => (
              <RecipeCard
                key={r.id}
                r={r}
                savedIds={saved}
                showAiBadge
                onSaveToFirestore={isAdmin ? () => setAiSaveTarget(r) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <AdminAiRecipeDialog
        recipe={aiSaveTarget}
        open={!!aiSaveTarget}
        onClose={() => setAiSaveTarget(null)}
      />
    </div>
  );
}

export function RecipeCard({
  r,
  savedIds,
  missing,
  showAiBadge,
  onSaveToFirestore,
}: {
  r: Recipe;
  savedIds: string[];
  missing?: string[];
  showAiBadge?: boolean;
  onSaveToFirestore?: () => void;
}) {
  const navigate = useNavigate();
  const isSaved = savedIds.includes(r.id);

  function openRecipe() {
    void navigate({ to: "/recipes/$id", params: { id: r.id } });
  }

  return (
    <Card className="overflow-hidden rounded-3xl pt-0 transition hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden">
        <RecipeCardImage recipe={r} className="h-full w-full object-cover" />
        <Badge className="absolute right-3 top-3 rounded-full bg-card text-foreground shadow">
          <Flame className="mr-1 h-3 w-3 text-accent"/> {r.health}% healthy
        </Badge>
        {showAiBadge && (
          <Badge className="absolute left-3 top-3 rounded-full bg-primary text-primary-foreground">
            AI
          </Badge>
        )}
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
          <Button
            type="button"
            variant="outline"
            className="w-full flex-1 rounded-full"
            onClick={openRecipe}
          >
            <Clock className="mr-1 h-4 w-4" /> View
          </Button>
          <Button size="icon" variant="outline" className="rounded-full"
            onClick={() => { toggleSaved(r.id); toast.success(isSaved ? "Removed from saved" : "Saved!"); }}>
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}/>
          </Button>
          <AddRecipeButton recipe={r} />
        </div>
        {onSaveToFirestore && (
          <Button type="button" variant="secondary" className="w-full rounded-full" onClick={onSaveToFirestore}>
            Save to library
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Macro({ v, l }: { v: string; l: string }) {
  return (<div><div className="font-semibold">{v}</div><div className="text-muted-foreground">{l}</div></div>);
}
