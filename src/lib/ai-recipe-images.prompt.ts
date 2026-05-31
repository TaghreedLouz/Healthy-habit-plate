export function buildAiRecipeImagePrompt(recipe: {
  name: string;
  ingredients: string[];
  steps: string[];
  bestTime: string;
}): string {
  const ingredients = recipe.ingredients.slice(0, 8).join(", ");
  const steps = recipe.steps.slice(0, 3).join(" ");

  return [
    `Professional food photography of "${recipe.name}".`,
    `Meal type: ${recipe.bestTime}.`,
    `The image must clearly show the dish type from the title (smoothie in a glass, chia pudding, yogurt bowl, fresh salad, or grain energy bowl).`,
    `Ingredients: ${ingredients}.`,
    `How it is made: ${steps}.`,
    `Single serving, realistic, appetizing, natural lighting, no text, no logos, no people.`,
  ].join(" ");
}
