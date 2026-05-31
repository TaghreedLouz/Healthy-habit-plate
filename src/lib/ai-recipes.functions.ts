import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Recipe } from "@/lib/recipes";
import { generateLocalAiRecipes } from "@/lib/ai-recipes.local";

export type AiRecipesResult = {
  recipes: Recipe[];
  usedFallback: boolean;
};

export const generateAiRecipes = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ingredients: z.array(z.string().min(1)).min(1).max(30),
    }),
  )
  .handler(async ({ data }): Promise<AiRecipesResult> => {
    const ingredientList = data.ingredients.map((i) => i.trim()).filter(Boolean);
    return {
      recipes: generateLocalAiRecipes(ingredientList),
      usedFallback: false,
    };
  });
