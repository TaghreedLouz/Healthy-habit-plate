import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { getRecipe } from "@/lib/recipes";
import { toggleSaved, addMeal, useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Plus, ArrowLeft, Clock, Users, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recipes/$id")({
  head: () => ({ meta: [{ title: "Recipe — Smart Healthy Plate" }] }),
  component: RecipeDetail,
});

function RecipeDetail() {
  const { id } = useParams({ from: "/_app/recipes/$id" });
  const r = getRecipe(id);
  const saved = useStore((s) => s.saved);
  if (!r) {
    return (
      <div className="space-y-4">
        <Link to="/recipes"><Button variant="ghost" className="rounded-full"><ArrowLeft className="mr-1 h-4 w-4"/>Back</Button></Link>
        <div>Recipe not found.</div>
      </div>
    );
  }
  const isSaved = saved.includes(r.id);
  return (
    <div className="space-y-6">
      <Link to="/recipes"><Button variant="ghost" className="rounded-full"><ArrowLeft className="mr-1 h-4 w-4"/>All recipes</Button></Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border">
          <img src={r.image} alt={r.name} className="aspect-[4/3] w-full object-cover"/>
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Best at {r.bestTime}</div>
          <h1 className="font-display text-4xl font-semibold leading-tight">{r.name}</h1>
          <p className="text-muted-foreground">{r.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full"><Clock className="mr-1 h-3 w-3"/>{r.time} min</Badge>
            <Badge variant="secondary" className="rounded-full"><Users className="mr-1 h-3 w-3"/>{r.servings} serving{r.servings>1?"s":""}</Badge>
            <Badge className="rounded-full bg-primary/15 text-primary border-0"><Heart className="mr-1 h-3 w-3"/>{r.health}% healthy</Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 rounded-3xl bg-secondary/60 p-4 text-center">
            <div><div className="font-display text-xl">{r.calories}</div><div className="text-xs text-muted-foreground">kcal</div></div>
            <div><div className="font-display text-xl">{r.protein}g</div><div className="text-xs text-muted-foreground">protein</div></div>
            <div><div className="font-display text-xl">{r.carbs}g</div><div className="text-xs text-muted-foreground">carbs</div></div>
            <div><div className="font-display text-xl">{r.fats}g</div><div className="text-xs text-muted-foreground">fats</div></div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full" onClick={() => {
              addMeal({ slot: r.bestTime.toLowerCase() as any, name: r.name, calories: r.calories, protein: r.protein, carbs: r.carbs, fats: r.fats, recipeId: r.id });
              toast.success("Added to today's meals");
            }}><Plus className="mr-1 h-4 w-4"/>Add to today</Button>
            <Button variant="outline" className="rounded-full" onClick={() => { toggleSaved(r.id); toast.success(isSaved ? "Removed" : "Saved"); }}>
              <Bookmark className={`mr-1 h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}/>
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Ingredients</h2>
            <ul className="space-y-2 text-sm">{r.ingredients.map((i) => <li key={i}>• {i}</li>)}</ul>
            {r.addOns.length > 0 && <>
              <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simple add-ons</h3>
              <ul className="space-y-2 text-sm">{r.addOns.map((i) => <li key={i}>+ {i}</li>)}</ul>
            </>}
          </CardContent>
        </Card>

        <Card className="rounded-3xl lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Preparation</h2>
            <ol className="space-y-3 text-sm">
              {r.steps.map((s, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{idx+1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl bg-primary/10">
        <CardContent className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Why it's healthy</div>
          <p className="mt-2 font-display text-lg leading-snug">{r.why}</p>
        </CardContent>
      </Card>
    </div>
  );
}
