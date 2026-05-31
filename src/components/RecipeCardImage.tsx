import { useEffect, useMemo, useState } from "react";
import type { Recipe } from "@/lib/recipes";
import {
  DEFAULT_RECIPE_IMAGE,
  getRecipeImage,
  getRecipeImageFallback,
} from "@/lib/recipe-image-utils";

export function RecipeCardImage({
  recipe,
  className,
}: {
  recipe: Recipe;
  className?: string;
}) {
  const isAi = recipe.id.startsWith("ai-");
  const fallbackSrc = useMemo(
    () => (isAi ? getRecipeImage(recipe) : recipe.image),
    [isAi, recipe],
  );
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    setSrc(isAi ? getRecipeImage(recipe) : recipe.image);
  }, [isAi, recipe.id, recipe.name, recipe.image, recipe.ingredients, recipe.steps, recipe.bestTime]);

  return (
    <img
      src={src}
      alt={recipe.name}
      className={className}
      onError={() => {
        if (src === DEFAULT_RECIPE_IMAGE) return;
        if (!isAi) {
          setSrc(DEFAULT_RECIPE_IMAGE);
          return;
        }
        const next = getRecipeImageFallback(recipe, src);
        setSrc(next === src ? DEFAULT_RECIPE_IMAGE : next);
      }}
    />
  );
}
