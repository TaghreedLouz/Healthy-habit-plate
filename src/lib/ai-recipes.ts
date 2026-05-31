import type { Recipe } from "@/lib/recipes";

const STORAGE_KEY = "shp_ai_recipes_v1";

export function cacheAiRecipes(recipes: Recipe[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function getAiRecipe(id: string): Recipe | undefined {
  if (typeof window === "undefined" || !id.startsWith("ai-")) return undefined;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const list = JSON.parse(raw) as Recipe[];
    return list.find((r) => r.id === id);
  } catch {
    return undefined;
  }
}

export function isAiRecipeId(id: string): boolean {
  return id.startsWith("ai-");
}
