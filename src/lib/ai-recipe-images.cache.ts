import type { Recipe } from "@/lib/recipes";

const STORAGE_KEY = "shp_ai_recipe_images_v1";

type CacheEntry = {
  key: string;
  url: string;
};

function readStore(): Record<string, CacheEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, CacheEntry>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}

export function getAiRecipeImageCacheKey(
  recipe: Pick<Recipe, "id" | "name" | "ingredients" | "steps" | "bestTime">,
): string {
  return [
    recipe.id,
    recipe.name,
    recipe.ingredients.join("\n"),
    recipe.steps.join("\n"),
    recipe.bestTime,
  ].join("::");
}

export function getCachedAiRecipeImage(cacheKey: string): string | null {
  const entry = readStore()[cacheKey];
  return entry?.key === cacheKey ? entry.url : null;
}

export function setCachedAiRecipeImage(cacheKey: string, url: string) {
  const store = readStore();
  store[cacheKey] = { key: cacheKey, url };
  writeStore(store);
}

const pending = new Map<string, Promise<string | null>>();

export function loadAiRecipeImage(
  cacheKey: string,
  generate: () => Promise<string | null>,
): Promise<string | null> {
  const cached = getCachedAiRecipeImage(cacheKey);
  if (cached) return Promise.resolve(cached);

  const inflight = pending.get(cacheKey);
  if (inflight) return inflight;

  const promise = generate()
    .then((url) => {
      if (url) setCachedAiRecipeImage(cacheKey, url);
      return url;
    })
    .finally(() => {
      pending.delete(cacheKey);
    });

  pending.set(cacheKey, promise);
  return promise;
}
