import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "@/lib/recipes";
import {
  countAiSavedRecipes,
  getPopularIngredients,
} from "@/lib/recipes-catalog";

interface AdminAnalyticsTabProps {
  allRecipes: Recipe[];
  firestoreRecipes: Recipe[];
  hiddenCount: number;
  userCount: number;
  defaultIngredientCount: number;
}

export function AdminAnalyticsTab({
  allRecipes,
  firestoreRecipes,
  hiddenCount,
  userCount,
  defaultIngredientCount,
}: AdminAnalyticsTabProps) {
  const aiSaved = countAiSavedRecipes(firestoreRecipes);
  const published = firestoreRecipes.filter((r) => r.published !== false).length;
  const unpublished = firestoreRecipes.length - published;
  const popular = getPopularIngredients(allRecipes, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MiniStat label="Firestore recipes" value={firestoreRecipes.length} />
        <MiniStat label="AI recipes saved" value={aiSaved} />
        <MiniStat label="Published (Firestore)" value={published} />
        <MiniStat label="Unpublished drafts" value={unpublished} />
        <MiniStat label="Hidden built-ins" value={hiddenCount} />
        <MiniStat label="Registered users" value={userCount} />
      </div>

      <Card className="rounded-2xl">
        <CardContent className="space-y-3 p-4">
          <h3 className="font-medium">Popular ingredients in library</h3>
          {popular.length ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {popular.map((name) => (
                <li key={name}>• {name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No ingredient data yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-secondary/40">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>
            Platform default ingredients: {defaultIngredientCount}. Per-user saved
            recipe counts are stored locally in the browser, not in Firestore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
        {hint && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{hint}</p>}
      </CardContent>
    </Card>
  );
}
