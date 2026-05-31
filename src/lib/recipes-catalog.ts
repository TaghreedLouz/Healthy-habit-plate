import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/firebase.js";
import { baseRecipes, type Recipe } from "@/lib/recipes";
import { getPlatformSettings } from "@/lib/platform.firestore";

function tsToIso(value: unknown): string | null {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return null;
}

export function isRecipePublished(recipe: Recipe): boolean {
  return recipe.published !== false;
}

function parseRecipe(id: string, data: Record<string, unknown>): Recipe {
  const bestTime = data.bestTime as Recipe["bestTime"];
  return {
    id,
    name: String(data.name ?? "Untitled"),
    description: String(data.description ?? ""),
    image: String(data.image ?? ""),
    ingredients: Array.isArray(data.ingredients) ? data.ingredients.map(String) : [],
    addOns: Array.isArray(data.addOns) ? data.addOns.map(String) : [],
    steps: Array.isArray(data.steps) ? data.steps.map(String) : [],
    time: Number(data.time) || 15,
    servings: Number(data.servings) || 1,
    calories: Number(data.calories) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fats: Number(data.fats) || 0,
    health: Number(data.health) || 80,
    bestTime: ["Breakfast", "Lunch", "Dinner", "Snack"].includes(bestTime)
      ? bestTime
      : "Lunch",
    why: String(data.why ?? ""),
    published: data.published === false ? false : true,
    source:
      data.source === "ai" || data.source === "admin" || data.source === "builtin"
        ? data.source
        : undefined,
    categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

export function mergeRecipeCatalog(
  hiddenIds: string[],
  firestoreRecipes: Recipe[],
  options?: { includeUnpublished?: boolean },
): Recipe[] {
  const hidden = new Set(hiddenIds);
  const includeUnpublished = options?.includeUnpublished ?? false;
  const fsMap = new Map(firestoreRecipes.map((r) => [r.id, r]));
  const seen = new Set<string>();
  const result: Recipe[] = [];

  for (const r of baseRecipes) {
    if (hidden.has(r.id)) continue;
    const merged = fsMap.get(r.id) ?? r;
    if (!includeUnpublished && !isRecipePublished(merged)) continue;
    result.push(merged);
    seen.add(r.id);
  }

  for (const r of firestoreRecipes) {
    if (hidden.has(r.id) || seen.has(r.id)) continue;
    if (!includeUnpublished && !isRecipePublished(r)) continue;
    result.push(r);
    seen.add(r.id);
  }

  return result;
}

let catalogCache: Recipe[] = baseRecipes;

export function getRecipeCatalog(): Recipe[] {
  return catalogCache;
}

export function getRecipeFromCatalog(id: string): Recipe | undefined {
  return catalogCache.find((r) => r.id === id);
}

export function suggestFromCatalog(
  userIngredients: string[],
  catalog: Recipe[] = catalogCache,
): (Recipe & { matches: number; missing: string[] })[] {
  const list = userIngredients ?? [];
  const norm = (s: string) => s.toLowerCase().trim();
  const have = new Set(list.map(norm));
  const builtInIds = new Set(baseRecipes.map((r) => r.id));
  const firestoreOnlyIds = new Set(
    catalog.filter((r) => !builtInIds.has(r.id)).map((r) => r.id),
  );

  return catalog
    .map((r) => {
      const matches = r.ingredients.filter((i) => have.has(norm(i))).length;
      const missing = r.ingredients.filter((i) => !have.has(norm(i)));
      return { ...r, matches, missing };
    })
    .filter(
      (r) =>
        firestoreOnlyIds.has(r.id) ||
        r.matches > 0 ||
        list.length === 0,
    )
    .sort((a, b) => {
      const aCustom = firestoreOnlyIds.has(a.id) ? 1 : 0;
      const bCustom = firestoreOnlyIds.has(b.id) ? 1 : 0;
      if (aCustom !== bCustom) return bCustom - aCustom;
      return b.matches - a.matches || b.health - a.health;
    });
}

export type RecipeMealFilter = Recipe["bestTime"] | "all";

export function filterRecipes<T extends Recipe>(
  recipes: T[],
  options: { search?: string; bestTime?: RecipeMealFilter },
): T[] {
  const query = options.search?.trim().toLowerCase() ?? "";
  const meal = options.bestTime ?? "all";

  return recipes.filter((r) => {
    if (meal !== "all" && r.bestTime !== meal) return false;
    if (!query) return true;
    const haystack = [
      r.name,
      r.description,
      ...r.ingredients,
      ...(r.categories ?? []),
      r.bestTime,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function isFirestoreRecipe(id: string): boolean {
  return !baseRecipes.some((r) => r.id === id);
}

export function getLatestFirestoreRecipe(recipes: Recipe[]): Recipe | null {
  const custom = recipes.filter((r) => isFirestoreRecipe(r.id));
  if (!custom.length) return null;
  return [...custom].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  )[0];
}

export function countAiSavedRecipes(recipes: Recipe[]): number {
  return recipes.filter((r) => r.source === "ai").length;
}

export function getPopularIngredients(recipes: Recipe[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      const key = ing.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

async function fetchFirestoreRecipes(): Promise<Recipe[]> {
  const snap = await getDocs(collection(db, "recipes"));
  return snap.docs.map((d) => parseRecipe(d.id, d.data()));
}

export async function refreshRecipeCatalog(): Promise<Recipe[]> {
  const [settings, firestoreRecipes] = await Promise.all([
    getPlatformSettings(),
    fetchFirestoreRecipes(),
  ]);
  catalogCache = mergeRecipeCatalog(settings.hiddenRecipeIds, firestoreRecipes);
  return catalogCache;
}

export async function listFirestoreRecipes(): Promise<Recipe[]> {
  return fetchFirestoreRecipes();
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const ref = doc(db, "recipes", recipe.id);
  const existing = await getDoc(ref);
  const payload: Record<string, unknown> = {
    ...recipe,
    published: recipe.published !== false,
    updatedAt: serverTimestamp(),
  };
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
    if (!payload.source) payload.source = "admin";
  }
  await setDoc(ref, payload, { merge: true });
  await refreshRecipeCatalog();
}

export async function saveAiRecipeToLibrary(recipe: Recipe): Promise<void> {
  const id = recipe.id.startsWith("ai-")
    ? slugifyRecipeName(recipe.name) || recipe.id.replace(/^ai-/, "")
    : recipe.id;
  await saveRecipe({
    ...recipe,
    id,
    published: true,
    source: "ai",
  });
}

export async function setRecipePublished(id: string, recipe: Recipe, published: boolean) {
  await saveRecipe({ ...recipe, id, published });
}

export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, "recipes", id));
  await refreshRecipeCatalog();
}

export function slugifyRecipeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function useRecipeCatalog(includeUnpublished = false) {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [firestoreRecipes, setFirestoreRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const settingsUnsub = onSnapshot(
      doc(db, "settings", "platform"),
      (snap) => {
        if (!active) return;
        const data = snap.data();
        setHiddenIds(
          Array.isArray(data?.hiddenRecipeIds)
            ? data.hiddenRecipeIds.map(String)
            : [],
        );
      },
      () => {},
    );

    const recipesUnsub = onSnapshot(
      collection(db, "recipes"),
      (snap) => {
        if (!active) return;
        setFirestoreRecipes(
          snap.docs.map((d) => parseRecipe(d.id, d.data())),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => {
      active = false;
      settingsUnsub();
      recipesUnsub();
    };
  }, []);

  const recipes = useMemo(
    () =>
      mergeRecipeCatalog(hiddenIds, firestoreRecipes, { includeUnpublished }),
    [hiddenIds, firestoreRecipes, includeUnpublished],
  );

  useEffect(() => {
    if (!includeUnpublished) {
      catalogCache = recipes;
    }
  }, [recipes, includeUnpublished]);

  return { recipes, loading, hiddenIds, firestoreRecipes };
}
