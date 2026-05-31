import type { Recipe } from "@/lib/recipes";

/** Generic healthy food plate — last-resort fallback only. */
export const DEFAULT_RECIPE_IMAGE =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80";

/** Stable direct food image URLs (verified photos only). */
const FOOD = {
  healthyPlate:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  riceBowl:
    "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1200&q=80",
  riceBowl2:
    "https://images.unsplash.com/photo-1603133872878-684fc097d393?auto=format&fit=crop&w=1200&q=80",
  porridge:
    "https://images.unsplash.com/photo-1534551068718-d869e6bc6fa1?auto=format&fit=crop&w=1200&q=80",
  porridge2:
    "https://images.unsplash.com/photo-1476123008956-4a61d9a83abb?auto=format&fit=crop&w=1200&q=80",
  sideDish:
    "https://images.unsplash.com/photo-1518977822534-7049a61b0f9f?auto=format&fit=crop&w=1200&q=80",
  sideDish2:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
  chickenBowl:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
  chickenBowl2:
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  chickenSalad:
    "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
  chickenSalad2:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  chickenWrap:
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80",
  chickenWrap2:
    "https://images.unsplash.com/photo-1528735602782-2552f46d216c?auto=format&fit=crop&w=1200&q=80",
  stirFry:
    "https://images.unsplash.com/photo-1603133872878-684fc097d393?auto=format&fit=crop&w=1200&q=80",
  stirFry2:
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  soup:
    "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=1200&q=80",
  soup2:
    "https://images.unsplash.com/photo-1547592166-ef4dee081f66?auto=format&fit=crop&w=1200&q=80",
  smoothie:
    "https://images.unsplash.com/photo-1505252580460-8f80f3c48a13?auto=format&fit=crop&w=1200&q=80",
  smoothie2:
    "https://images.unsplash.com/photo-1553530664-ba79a3da7028?auto=format&fit=crop&w=1200&q=80",
  yogurtBowl:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
  yogurtBowl2:
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
  chiaPudding:
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
  chiaPudding2:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
  fruitSalad:
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
  fruitSalad2:
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
  apple:
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1200&q=80",
  orange:
    "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=1200&q=80",
  chicken:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
  rice:
    "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1200&q=80",
  oats:
    "https://images.unsplash.com/photo-1534551068718-d869e6bc6fa1?auto=format&fit=crop&w=1200&q=80",
} as const;

type DishType =
  | "rice-bowl"
  | "porridge"
  | "side-dish"
  | "chicken-bowl"
  | "chicken-salad"
  | "chicken-wrap"
  | "stir-fry"
  | "soup"
  | "smoothie"
  | "yogurt-bowl"
  | "chia-pudding"
  | "fruit-salad"
  | "generic";

const INGREDIENT_KEYWORDS: [string, string][] = [
  ["chicken", "chicken"],
  ["rice", "rice"],
  ["oats", "oats"],
  ["oat", "oats"],
  ["apple", "apple"],
  ["orange", "orange"],
  ["yogurt", "yogurt"],
];

/** Primary selection: recipe type → fixed food image pool. */
const DISH_IMAGE_POOLS: Record<DishType, string[]> = {
  "rice-bowl": [FOOD.riceBowl, FOOD.riceBowl2],
  porridge: [FOOD.porridge, FOOD.porridge2],
  "side-dish": [FOOD.sideDish, FOOD.sideDish2],
  "chicken-bowl": [FOOD.chickenBowl, FOOD.chickenBowl2],
  "chicken-salad": [FOOD.chickenSalad, FOOD.chickenSalad2],
  "chicken-wrap": [FOOD.chickenWrap, FOOD.chickenWrap2],
  "stir-fry": [FOOD.stirFry, FOOD.stirFry2],
  soup: [FOOD.soup, FOOD.soup2],
  smoothie: [FOOD.smoothie, FOOD.smoothie2],
  "yogurt-bowl": [FOOD.yogurtBowl, FOOD.yogurtBowl2],
  "chia-pudding": [FOOD.chiaPudding, FOOD.chiaPudding2],
  "fruit-salad": [FOOD.fruitSalad, FOOD.fruitSalad2],
  generic: [DEFAULT_RECIPE_IMAGE, FOOD.healthyPlate],
};

/** Secondary tie-breaker: ingredient + recipe type. */
const INGREDIENT_DISH_IMAGES: Record<string, string> = {
  "rice:rice-bowl": FOOD.rice,
  "oats:porridge": FOOD.oats,
  "chicken:chicken-bowl": FOOD.chicken,
  "chicken:chicken-salad": FOOD.chickenSalad,
  "chicken:chicken-wrap": FOOD.chickenWrap,
  "chicken:stir-fry": FOOD.stirFry,
  "chicken:soup": FOOD.soup,
  "apple:fruit-salad": FOOD.apple,
  "apple:smoothie": FOOD.smoothie,
  "apple:yogurt-bowl": FOOD.yogurtBowl,
  "apple:chia-pudding": FOOD.chiaPudding,
  "orange:fruit-salad": FOOD.orange,
  "orange:smoothie": FOOD.smoothie,
  "orange:yogurt-bowl": FOOD.yogurtBowl,
};

const INGREDIENT_IMAGES: Record<string, string> = {
  chicken: FOOD.chicken,
  rice: FOOD.rice,
  oats: FOOD.oats,
  apple: FOOD.apple,
  orange: FOOD.orange,
  yogurt: FOOD.yogurtBowl,
};

function detectIngredient(ingredients: string[], name: string): string {
  const text = `${name} ${ingredients.join(" ")}`.toLowerCase();
  for (const [word, key] of INGREDIENT_KEYWORDS) {
    if (new RegExp(`\\b${word}\\b`, "i").test(text)) return key;
  }
  return "generic";
}

function detectDishType(name: string, steps: string[], bestTime: string): DishType {
  const title = name.toLowerCase();
  const blob = `${title} ${steps.join(" ").toLowerCase()} ${bestTime.toLowerCase()}`;

  if (/yogurt bowl/.test(title)) return "yogurt-bowl";
  if (/smoothie/.test(title)) return "smoothie";
  if (/chia pudding/.test(title)) return "chia-pudding";
  if (/porridge/.test(title)) return "porridge";
  if (/side dish/.test(title)) return "side-dish";
  if (/fruit salad/.test(title)) return "fruit-salad";
  if (/grilled.*bowl/.test(title)) return "chicken-bowl";
  if (/stir-fry|stir fry/.test(title)) return "stir-fry";
  if (/wrap/.test(title)) return "chicken-wrap";
  if (/soup/.test(title)) return "soup";
  if (/salad/.test(title)) return /\bchicken\b/.test(blob) ? "chicken-salad" : "fruit-salad";
  if (/\bbowl\b/.test(title) && /\brice\b/.test(blob)) return "rice-bowl";
  if (/\bbowl\b/.test(title) && /\bchicken\b/.test(blob)) return "chicken-bowl";
  if (/\bbowl\b/.test(title)) return "rice-bowl";

  if (/porridge|simmer.*oats|oatmeal/.test(blob)) return "porridge";
  if (/side dish/.test(blob)) return "side-dish";
  if (/fruit salad/.test(blob)) return "fruit-salad";
  if (/yogurt/.test(blob) && /bowl/.test(blob)) return "yogurt-bowl";
  if (/chia|pudding/.test(blob)) return "chia-pudding";
  if (/smoothie|blend/.test(blob)) return "smoothie";
  if (/stir-fry|stir fry|wok/.test(blob)) return "stir-fry";
  if (/wrap|roll tightly/.test(blob)) return "chicken-wrap";
  if (/soup|simmer|broth/.test(blob)) return "soup";
  if (/salad|toss/.test(blob)) return /\bchicken\b/.test(blob) ? "chicken-salad" : "fruit-salad";
  if (/grilled|chicken bowl/.test(blob)) return "chicken-bowl";
  if (/rice bowl|\bbowl\b/.test(blob)) return "rice-bowl";

  return "generic";
}

function buildImageCandidates(
  recipe: Pick<Recipe, "name" | "ingredients" | "steps" | "bestTime">,
): string[] {
  const dish = detectDishType(recipe.name, recipe.steps, recipe.bestTime);
  const ingredient = detectIngredient(recipe.ingredients, recipe.name);
  const candidates: string[] = [];

  candidates.push(...(DISH_IMAGE_POOLS[dish] ?? DISH_IMAGE_POOLS.generic));

  const comboKey = `${ingredient}:${dish}`;
  if (INGREDIENT_DISH_IMAGES[comboKey]) candidates.push(INGREDIENT_DISH_IMAGES[comboKey]);

  if (ingredient !== "generic" && INGREDIENT_IMAGES[ingredient]) {
    candidates.push(INGREDIENT_IMAGES[ingredient]);
  }

  candidates.push(DEFAULT_RECIPE_IMAGE, FOOD.healthyPlate);

  return [...new Set(candidates)];
}

export function getRecipeImage(
  recipe: Pick<Recipe, "id" | "name" | "ingredients" | "steps" | "bestTime" | "image">,
): string {
  if (!recipe.id.startsWith("ai-")) return recipe.image;
  const candidates = buildImageCandidates(recipe);
  return candidates[0] ?? DEFAULT_RECIPE_IMAGE;
}

export function getRecipeImageFallback(
  recipe: Pick<Recipe, "id" | "name" | "ingredients" | "steps" | "bestTime" | "image">,
  failedUrl: string,
): string {
  if (!recipe.id.startsWith("ai-")) return recipe.image || DEFAULT_RECIPE_IMAGE;
  const candidates = buildImageCandidates(recipe);
  const idx = candidates.indexOf(failedUrl);
  if (idx >= 0 && idx < candidates.length - 1) return candidates[idx + 1];
  return DEFAULT_RECIPE_IMAGE;
}
