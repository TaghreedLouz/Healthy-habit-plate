import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildAiRecipeImagePrompt } from "@/lib/ai-recipe-images.prompt";

const recipeInput = z.object({
  recipeId: z.string().min(1),
  name: z.string().min(1),
  ingredients: z.array(z.string()).min(1),
  steps: z.array(z.string()).min(1),
  bestTime: z.string().min(1),
});

export const generateAiRecipeImage = createServerFn({ method: "POST" })
  .inputValidator(recipeInput)
  .handler(async ({ data }): Promise<{ url: string | null }> => {
    if (!data.recipeId.startsWith("ai-")) {
      return { url: null };
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return { url: null };
    }

    const prompt = buildAiRecipeImagePrompt(data);

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt,
          n: 1,
          size: "256x256",
          response_format: "b64_json",
        }),
      });

      if (!response.ok) {
        return { url: null };
      }

      const json = (await response.json()) as {
        data?: Array<{ b64_json?: string }>;
      };
      const b64 = json.data?.[0]?.b64_json;
      if (!b64) {
        return { url: null };
      }

      return { url: `data:image/png;base64,${b64}` };
    } catch {
      return { url: null };
    }
  });
