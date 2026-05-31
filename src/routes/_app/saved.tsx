import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useRecipeCatalog } from "@/lib/recipes-catalog";
import { RecipeCard } from "./recipes.index";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/_app/saved")({
  head: () => ({ meta: [{ title: "Saved recipes — Smart Healthy Plate" }] }),
  component: Saved,
});

function Saved() {
  const saved = useStore((s) => s.saved);
  const { recipes } = useRecipeCatalog();
  const list = recipes.filter((r) => saved.includes(r.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Saved recipes</h1>
        <p className="mt-1 text-muted-foreground">Your favorite healthy meals, ready when you are.</p>
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed p-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary"><Bookmark className="h-5 w-5"/></div>
          <div className="mt-3 font-medium">Nothing saved yet</div>
          <div className="mb-4 text-sm text-muted-foreground">Tap the bookmark on any recipe to save it.</div>
          <Link to="/recipes"><Button className="rounded-full">Browse recipes</Button></Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => <RecipeCard key={r.id} r={r} savedIds={saved} />)}
        </div>
      )}
    </div>
  );
}
