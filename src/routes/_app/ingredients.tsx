import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, store } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ChefHat } from "lucide-react";

export const Route = createFileRoute("/_app/ingredients")({
  head: () => ({ meta: [{ title: "Ingredients — Smart Healthy Plate" }] }),
  component: IngredientsPage,
});

const common = ["Chicken","Rice","Eggs","Cucumber","Yogurt","Tuna","Bread","Tomato","Potato","Oats"];

function IngredientsPage() {
  const ingredients = useStore((s) => s.ingredients);
  const [val, setVal] = useState("");

  function add(name: string) {
    const v = name.trim();
    if (!v) return;
    store.set((s) => ({ ...s, ingredients: Array.from(new Set([...s.ingredients, v])) }));
    setVal("");
  }
  function remove(name: string) {
    store.set((s) => ({ ...s, ingredients: s.ingredients.filter((i) => i !== name) }));
  }
  function clear() { store.set((s) => ({ ...s, ingredients: [] })); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">What's in your kitchen?</h1>
        <p className="mt-1 text-muted-foreground">Add ingredients you have on hand — we'll suggest healthy recipes.</p>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <form onSubmit={(e)=>{e.preventDefault(); add(val);}} className="flex gap-2">
            <Input placeholder="e.g. spinach" value={val} onChange={(e)=>setVal(e.target.value)}/>
            <Button type="submit" className="rounded-full"><Plus className="mr-1 h-4 w-4"/>Add</Button>
          </form>
          <div className="mt-4">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Suggestions</div>
            <div className="flex flex-wrap gap-2">
              {common.filter((c) => !ingredients.includes(c)).map((c) => (
                <button key={c} onClick={()=>add(c)} className="rounded-full border bg-secondary/60 px-3 py-1 text-sm hover:bg-primary hover:text-primary-foreground transition">
                  + {c}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Your ingredients ({ingredients.length})</h2>
            {ingredients.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clear}>Clear all</Button>
            )}
          </div>
          {ingredients.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Add a few ingredients to get started.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((i) => (
                <Badge key={i} variant="secondary" className="gap-1 rounded-full px-3 py-1.5 text-sm">
                  {i}
                  <button onClick={()=>remove(i)} className="ml-1 rounded-full p-0.5 hover:bg-background"><X className="h-3 w-3"/></button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link to="/recipes">
        <Button size="lg" className="w-full rounded-full" disabled={ingredients.length === 0}>
          <ChefHat className="mr-2 h-5 w-5"/> Generate healthy recipes
        </Button>
      </Link>
    </div>
  );
}
