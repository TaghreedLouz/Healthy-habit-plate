import type { Recipe } from "@/lib/recipes";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function titleCase(word: string): string {
  const t = word.trim();
  if (!t) return "Fresh";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function uniq(items: string[]): string[] {
  return [...new Set(items.map((i) => i.trim()).filter(Boolean))];
}

type IngredientCategory = "fruit" | "protein" | "vegetable" | "grain" | "dairy";

const FRUIT_WORDS = [
  "apple", "orange", "banana", "berry", "berries", "strawberry", "blueberry",
  "raspberry", "grape", "mango", "pineapple", "peach", "pear", "kiwi", "cherry",
  "citrus", "lemon", "lime", "melon", "watermelon",
];
const PROTEIN_WORDS = [
  "chicken", "tuna", "egg", "eggs", "salmon", "beef", "turkey", "pork", "meat",
  "fish", "shrimp", "tofu", "tempeh", "lamb", "duck",
];
const VEGETABLE_WORDS = [
  "tomato", "potato", "cucumber", "spinach", "carrot", "broccoli", "pepper",
  "onion", "garlic", "lettuce", "kale", "zucchini", "cauliflower", "celery",
  "mushroom", "avocado", "cabbage", "asparagus", "beet", "corn",
];
const GRAIN_WORDS = ["oats", "oat", "rice", "quinoa", "barley", "pasta", "bread", "wheat", "couscous"];
const DAIRY_WORDS = ["yogurt", "yoghurt", "milk", "cheese", "kefir", "cottage cheese"];

function matchesWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "i").test(text);
}

function classifyIngredient(name: string): IngredientCategory {
  for (const word of PROTEIN_WORDS) {
    if (matchesWord(name, word)) return "protein";
  }
  for (const word of DAIRY_WORDS) {
    if (matchesWord(name, word)) return "dairy";
  }
  for (const word of GRAIN_WORDS) {
    if (matchesWord(name, word)) return "grain";
  }
  for (const word of FRUIT_WORDS) {
    if (matchesWord(name, word)) return "fruit";
  }
  for (const word of VEGETABLE_WORDS) {
    if (matchesWord(name, word)) return "vegetable";
  }
  return "vegetable";
}

function hasFruitInList(ingredientList: string[]): boolean {
  const text = ingredientList.join(" ").toLowerCase();
  return FRUIT_WORDS.some((word) => matchesWord(text, word));
}

function buildFruitRecipes(
  primary: string,
  primaryLower: string,
  support: string[],
): Omit<Recipe, "id">[] {
  return [
    {
      name: `${primary} Smoothie`,
      description: `A smooth ${primaryLower} smoothie made with your selected ${primaryLower}.`,
      image: "",
      ingredients: uniq([primary, "Milk", ...support]),
      addOns: ["Honey", "Ice"],
      steps: [
        `Chop ${primaryLower} for blending.`,
        `Blend ${primaryLower} with milk until smooth.`,
        "Pour into a glass and serve chilled.",
        `Enjoy the natural sweetness from ${primaryLower}.`,
      ],
      time: 8,
      servings: 1,
      calories: 290,
      protein: 12,
      carbs: 48,
      fats: 6,
      health: 89,
      bestTime: "Breakfast",
      why: `${primaryLower} blended into a smoothie is a quick, refreshing breakfast.`,
    },
    {
      name: `${primary} Yogurt Bowl`,
      description: `A creamy ${primaryLower} yogurt bowl with fresh flavor and balanced protein.`,
      image: "",
      ingredients: uniq([primary, "Yogurt", ...support]),
      addOns: ["Honey", "Chia seeds"],
      steps: [
        `Slice fresh ${primaryLower} into bite-size pieces.`,
        `Add ${primaryLower} to a bowl with yogurt.`,
        "Top with honey and chia seeds.",
        `Serve immediately while ${primaryLower} is fresh.`,
      ],
      time: 10,
      servings: 1,
      calories: 320,
      protein: 18,
      carbs: 42,
      fats: 8,
      health: 91,
      bestTime: "Breakfast",
      why: `${primary} adds fiber and vitamins while yogurt adds protein for a light start.`,
    },
    {
      name: `${primary} Chia Pudding`,
      description: `Overnight chia pudding layered with fresh ${primaryLower} pieces.`,
      image: "",
      ingredients: uniq([primary, "Chia seeds", "Yogurt"]),
      addOns: ["Honey", "Vanilla"],
      steps: [
        "Mix chia seeds with yogurt and a splash of milk.",
        `Fold in diced ${primaryLower}.`,
        "Rest 10 minutes or overnight in the fridge.",
        `Top with extra ${primaryLower} before serving.`,
      ],
      time: 12,
      servings: 1,
      calories: 340,
      protein: 14,
      carbs: 38,
      fats: 14,
      health: 93,
      bestTime: "Snack",
      why: `Chia adds omega-3s while ${primaryLower} keeps this pudding light and refreshing.`,
    },
    {
      name: `Fresh ${primary} Fruit Salad`,
      description: `A crisp fruit salad starring fresh ${primaryLower} with simple healthy dressing.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil"]),
      addOns: ["Lemon", "Black pepper"],
      steps: [
        `Wash and slice ${primaryLower} into bite-size pieces.`,
        `Combine ${primaryLower} with your other ingredients in a bowl.`,
        "Drizzle with olive oil, lemon, and pepper.",
        `Toss gently and serve fresh ${primaryLower} fruit salad.`,
      ],
      time: 10,
      servings: 1,
      calories: 220,
      protein: 6,
      carbs: 32,
      fats: 9,
      health: 94,
      bestTime: "Lunch",
      why: `Raw ${primaryLower} keeps nutrients intact in a low-calorie, high-fiber lunch.`,
    },
  ];
}

function buildProteinRecipes(
  primary: string,
  primaryLower: string,
  support: string[],
): Omit<Recipe, "id">[] {
  return [
    {
      name: `Grilled ${primary} Bowl`,
      description: `A balanced grilled ${primaryLower} bowl with rice and fresh vegetables.`,
      image: "",
      ingredients: uniq([primary, "Rice", ...support, "Olive oil"]),
      addOns: ["Lemon", "Herbs"],
      steps: [
        `Season and grill ${primaryLower} until cooked through.`,
        `Serve sliced ${primaryLower} over steamed rice.`,
        "Add vegetables and a light drizzle of olive oil.",
        "Finish with lemon and fresh herbs.",
      ],
      time: 25,
      servings: 1,
      calories: 480,
      protein: 38,
      carbs: 42,
      fats: 14,
      health: 90,
      bestTime: "Lunch",
      why: `${primary} and rice deliver lean protein with steady energy for lunch.`,
    },
    {
      name: `${primary} Salad`,
      description: `A protein-rich ${primaryLower} salad with crisp vegetables.`,
      image: "",
      ingredients: uniq([primary, ...support, "Mixed greens", "Olive oil"]),
      addOns: ["Lemon", "Black pepper"],
      steps: [
        `Cook ${primaryLower} and slice into bite-size pieces.`,
        `Toss ${primaryLower} with greens and supporting ingredients.`,
        "Drizzle with olive oil, lemon, and pepper.",
        "Serve chilled or at room temperature.",
      ],
      time: 15,
      servings: 1,
      calories: 320,
      protein: 32,
      carbs: 14,
      fats: 16,
      health: 92,
      bestTime: "Lunch",
      why: `Lean ${primaryLower} keeps this salad filling without heavy dressing.`,
    },
    {
      name: `${primary} Wrap`,
      description: `A handheld ${primaryLower} wrap packed with fresh flavor.`,
      image: "",
      ingredients: uniq([primary, "Whole wheat wrap", ...support, "Lettuce"]),
      addOns: ["Yogurt sauce", "Herbs"],
      steps: [
        `Cook ${primaryLower} and slice thin.`,
        `Layer ${primaryLower}, lettuce, and fillings on a wrap.`,
        "Add yogurt sauce and herbs.",
        "Roll tightly and serve.",
      ],
      time: 18,
      servings: 1,
      calories: 390,
      protein: 34,
      carbs: 36,
      fats: 12,
      health: 89,
      bestTime: "Lunch",
      why: `${primary} wrap is an easy high-protein meal you can eat on the go.`,
    },
    {
      name: `${primary} Stir-Fry`,
      description: `A quick ${primaryLower} stir-fry with vegetables and light seasoning.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil", "Garlic"]),
      addOns: ["Soy sauce", "Ginger"],
      steps: [
        `Slice ${primaryLower} into strips.`,
        "Heat oil in a wok or skillet over high heat.",
        `Stir-fry ${primaryLower} with garlic, ginger, and vegetables.`,
        "Season lightly and serve hot.",
      ],
      time: 20,
      servings: 1,
      calories: 360,
      protein: 36,
      carbs: 18,
      fats: 14,
      health: 91,
      bestTime: "Dinner",
      why: `Stir-frying ${primaryLower} keeps the dish lean while staying satisfying.`,
    },
    {
      name: `${primary} Soup`,
      description: `A hearty ${primaryLower} soup with vegetables and light seasoning.`,
      image: "",
      ingredients: uniq([primary, ...support, "Vegetable broth", "Olive oil"]),
      addOns: ["Garlic", "Herbs"],
      steps: [
        `Cook ${primaryLower} and chop into bite-size pieces.`,
        "Simmer in vegetable broth with garlic and herbs.",
        "Season to taste and cook until flavors meld.",
        "Serve hot.",
      ],
      time: 30,
      servings: 1,
      calories: 280,
      protein: 28,
      carbs: 18,
      fats: 10,
      health: 91,
      bestTime: "Dinner",
      why: `${primary} soup is a warm, protein-rich meal that's easy to digest.`,
    },
  ];
}

function buildVegetableRecipes(
  primary: string,
  primaryLower: string,
  support: string[],
): Omit<Recipe, "id">[] {
  return [
    {
      name: `Fresh ${primary} Salad`,
      description: `A crisp ${primaryLower} salad with a light healthy dressing.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil", "Lemon"]),
      addOns: ["Black pepper", "Herbs"],
      steps: [
        `Wash and chop ${primaryLower}.`,
        `Toss ${primaryLower} with supporting ingredients in a bowl.`,
        "Drizzle with olive oil and lemon.",
        "Serve fresh.",
      ],
      time: 10,
      servings: 1,
      calories: 180,
      protein: 4,
      carbs: 20,
      fats: 10,
      health: 95,
      bestTime: "Lunch",
      why: `${primary} salad is a light way to pack in fiber and micronutrients.`,
    },
    {
      name: `${primary} Soup`,
      description: `A warming ${primaryLower} soup with simple wholesome ingredients.`,
      image: "",
      ingredients: uniq([primary, ...support, "Vegetable broth", "Olive oil"]),
      addOns: ["Garlic", "Herbs"],
      steps: [
        `Chop ${primaryLower} and aromatics.`,
        "Simmer in vegetable broth until tender.",
        "Blend partially or leave chunky.",
        "Season and serve hot.",
      ],
      time: 30,
      servings: 1,
      calories: 210,
      protein: 6,
      carbs: 28,
      fats: 8,
      health: 93,
      bestTime: "Dinner",
      why: `Soup makes ${primaryLower} easy to digest while keeping the meal light.`,
    },
    {
      name: `${primary} Stir-Fry`,
      description: `A fast ${primaryLower} stir-fry with garlic and light seasoning.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil", "Garlic"]),
      addOns: ["Soy sauce", "Ginger"],
      steps: [
        `Slice ${primaryLower} evenly.`,
        "Heat oil in a wok over high heat.",
        `Stir-fry ${primaryLower} with garlic and vegetables.`,
        "Serve immediately.",
      ],
      time: 15,
      servings: 1,
      calories: 190,
      protein: 5,
      carbs: 22,
      fats: 9,
      health: 94,
      bestTime: "Dinner",
      why: `Quick stir-frying preserves texture and nutrients in ${primaryLower}.`,
    },
    {
      name: `${primary} Green Salad`,
      description: `A second light ${primaryLower} salad with herbs and lemon dressing.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil", "Lemon"]),
      addOns: ["Black pepper", "Herbs"],
      steps: [
        `Wash and chop ${primaryLower}.`,
        `Toss ${primaryLower} with herbs and lemon dressing.`,
        "Season with pepper.",
        "Serve fresh.",
      ],
      time: 12,
      servings: 1,
      calories: 170,
      protein: 4,
      carbs: 18,
      fats: 9,
      health: 94,
      bestTime: "Lunch",
      why: `A simple ${primaryLower} salad keeps lunch light and nutrient-dense.`,
    },
    {
      name: `${primary} Garden Soup`,
      description: `A vegetable-forward ${primaryLower} soup with gentle seasoning.`,
      image: "",
      ingredients: uniq([primary, ...support, "Vegetable broth", "Olive oil"]),
      addOns: ["Garlic", "Herbs"],
      steps: [
        `Chop ${primaryLower} and aromatics.`,
        "Simmer in broth until tender.",
        "Adjust seasoning to taste.",
        "Serve hot.",
      ],
      time: 28,
      servings: 1,
      calories: 200,
      protein: 5,
      carbs: 26,
      fats: 8,
      health: 93,
      bestTime: "Dinner",
      why: `This ${primaryLower} soup is filling without being heavy.`,
    },
  ];
}

function buildGrainRecipes(
  primary: string,
  primaryLower: string,
  support: string[],
): Omit<Recipe, "id">[] {
  return [
    {
      name: `${primary} Bowl`,
      description: `A hearty ${primaryLower} bowl with balanced carbs and fiber.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil", "Vegetables"]),
      addOns: ["Seeds", "Herbs"],
      steps: [
        `Cook ${primaryLower} until tender.`,
        "Layer in a bowl with vegetables and toppings.",
        "Drizzle lightly with olive oil.",
        "Serve warm.",
      ],
      time: 22,
      servings: 1,
      calories: 380,
      protein: 12,
      carbs: 58,
      fats: 10,
      health: 90,
      bestTime: "Lunch",
      why: `${primary} bowl delivers steady energy from complex carbohydrates.`,
    },
    {
      name: `${primary} Porridge`,
      description: `A warm ${primaryLower} porridge for a comforting start.`,
      image: "",
      ingredients: uniq([primary, "Milk", ...support]),
      addOns: ["Cinnamon", "Honey"],
      steps: [
        `Simmer ${primaryLower} with milk until creamy.`,
        "Stir in cinnamon and a touch of honey.",
        "Cook to your preferred thickness.",
        "Serve warm.",
      ],
      time: 15,
      servings: 1,
      calories: 310,
      protein: 10,
      carbs: 52,
      fats: 7,
      health: 88,
      bestTime: "Breakfast",
      why: `${primary} porridge is a filling breakfast with slow-release energy.`,
    },
    {
      name: `${primary} Side Dish`,
      description: `A simple seasoned ${primaryLower} side to pair with any meal.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil", "Herbs"]),
      addOns: ["Garlic", "Lemon"],
      steps: [
        `Cook ${primaryLower} until tender.`,
        "Toss with olive oil, herbs, and garlic.",
        "Season to taste.",
        "Serve as a side.",
      ],
      time: 18,
      servings: 1,
      calories: 220,
      protein: 6,
      carbs: 38,
      fats: 5,
      health: 89,
      bestTime: "Dinner",
      why: `${primary} side dish adds fiber without overpowering the main meal.`,
    },
    {
      name: `Warm ${primary} Bowl`,
      description: `A warm ${primaryLower} bowl with simple wholesome toppings.`,
      image: "",
      ingredients: uniq([primary, ...support, "Olive oil"]),
      addOns: ["Herbs", "Seeds"],
      steps: [
        `Warm cooked ${primaryLower} in a bowl.`,
        "Add supporting ingredients and seeds.",
        "Finish with herbs and olive oil.",
        "Serve immediately.",
      ],
      time: 12,
      servings: 1,
      calories: 340,
      protein: 11,
      carbs: 54,
      fats: 9,
      health: 88,
      bestTime: "Breakfast",
      why: `Warm ${primaryLower} bowl is an easy fiber-rich meal any time of day.`,
    },
    {
      name: `${primary} Lunch Bowl`,
      description: `A satisfying ${primaryLower} bowl for a balanced midday meal.`,
      image: "",
      ingredients: uniq([primary, ...support, "Vegetables", "Olive oil"]),
      addOns: ["Herbs", "Seeds"],
      steps: [
        `Cook ${primaryLower} until tender.`,
        "Layer in a bowl with vegetables and toppings.",
        "Drizzle lightly with olive oil.",
        "Serve warm.",
      ],
      time: 18,
      servings: 1,
      calories: 360,
      protein: 11,
      carbs: 56,
      fats: 9,
      health: 89,
      bestTime: "Lunch",
      why: `${primary} bowl delivers steady energy from complex carbohydrates.`,
    },
  ];
}

function buildDairyRecipes(
  primary: string,
  primaryLower: string,
  support: string[],
  ingredientList: string[],
): Omit<Recipe, "id">[] {
  const withFruit = hasFruitInList(ingredientList);

  return [
    {
      name: `${primary} Bowl`,
      description: `A simple ${primaryLower} bowl with light toppings.`,
      image: "",
      ingredients: uniq([primary, ...support, "Honey"]),
      addOns: ["Seeds", "Cinnamon"],
      steps: [
        `Spoon ${primaryLower} into a bowl.`,
        "Add seeds and a drizzle of honey.",
        "Top with cinnamon if desired.",
        "Serve chilled.",
      ],
      time: 5,
      servings: 1,
      calories: 220,
      protein: 14,
      carbs: 24,
      fats: 8,
      health: 90,
      bestTime: "Breakfast",
      why: `${primary} bowl is a quick protein-rich start to the day.`,
    },
    {
      name: `${primary} Parfait`,
      description: `Layered ${primaryLower} parfait with granola and fresh toppings.`,
      image: "",
      ingredients: uniq([primary, "Granola", ...support]),
      addOns: ["Honey", "Berries"],
      steps: [
        `Layer ${primaryLower} with granola in a glass.`,
        "Add fresh toppings between layers.",
        "Finish with honey.",
        "Serve immediately.",
      ],
      time: 8,
      servings: 1,
      calories: 280,
      protein: 12,
      carbs: 38,
      fats: 10,
      health: 89,
      bestTime: "Breakfast",
      why: `Parfait layers ${primaryLower} with crunch for a balanced breakfast.`,
    },
    withFruit
      ? {
          name: `${primary} Fruit Smoothie`,
          description: `A creamy ${primaryLower} smoothie blended with fresh fruit.`,
          image: "",
          ingredients: uniq([primary, ...support.filter((s) => FRUIT_WORDS.some((w) => matchesWord(s, w))), "Milk"]),
          addOns: ["Honey", "Ice"],
          steps: [
            "Add yogurt, fruit, and milk to a blender.",
            "Blend until smooth.",
            "Pour into a glass.",
            "Serve chilled.",
          ],
          time: 5,
          servings: 1,
          calories: 250,
          protein: 12,
          carbs: 36,
          fats: 6,
          health: 88,
          bestTime: "Breakfast",
          why: `Fruit and ${primaryLower} make a naturally sweet smoothie without added sugar.`,
        }
      : {
          name: `${primary} Honey Bowl`,
          description: `A lightly sweetened ${primaryLower} bowl with seeds and honey.`,
          image: "",
          ingredients: uniq([primary, "Honey", ...support]),
          addOns: ["Seeds", "Cinnamon"],
          steps: [
            `Spoon ${primaryLower} into a bowl.`,
            "Drizzle with honey and add seeds.",
            "Sprinkle cinnamon on top.",
            "Serve chilled.",
          ],
          time: 5,
          servings: 1,
          calories: 240,
          protein: 13,
          carbs: 28,
          fats: 8,
          health: 89,
          bestTime: "Snack",
          why: `Honey and seeds add texture to a simple ${primaryLower} snack.`,
        },
    {
      name: `${primary} Breakfast Cup`,
      description: `A portable ${primaryLower} breakfast cup with wholesome toppings.`,
      image: "",
      ingredients: uniq([primary, ...support, "Granola"]),
      addOns: ["Berries", "Honey"],
      steps: [
        `Layer ${primaryLower} in a cup with granola.`,
        "Add berries or supporting toppings.",
        "Finish with a light drizzle of honey.",
        "Serve immediately.",
      ],
      time: 6,
      servings: 1,
      calories: 270,
      protein: 14,
      carbs: 34,
      fats: 9,
      health: 88,
      bestTime: "Breakfast",
      why: `${primary} breakfast cup is an easy grab-and-go option.`,
    },
    {
      name: `${primary} Snack Bowl`,
      description: `A light ${primaryLower} snack bowl with seeds and fresh flavor.`,
      image: "",
      ingredients: uniq([primary, ...support, "Seeds"]),
      addOns: ["Honey", "Cinnamon"],
      steps: [
        `Portion ${primaryLower} into a small bowl.`,
        "Top with seeds and cinnamon.",
        "Add honey if desired.",
        "Enjoy as a quick snack.",
      ],
      time: 4,
      servings: 1,
      calories: 190,
      protein: 11,
      carbs: 20,
      fats: 7,
      health: 90,
      bestTime: "Snack",
      why: `${primary} snack bowl curbs hunger with protein and healthy fats.`,
    },
  ];
}

export function generateLocalAiRecipes(ingredientList: string[]): Recipe[] {
  const primary = titleCase(ingredientList[0] ?? "Fresh");
  const primaryLower = primary.toLowerCase();
  const support = ingredientList.slice(1, 3).map(titleCase);
  const category = classifyIngredient(primaryLower);

  let ideas: Omit<Recipe, "id">[];
  switch (category) {
    case "fruit":
      ideas = buildFruitRecipes(primary, primaryLower, support);
      break;
    case "protein":
      ideas = buildProteinRecipes(primary, primaryLower, support);
      break;
    case "grain":
      ideas = buildGrainRecipes(primary, primaryLower, support);
      break;
    case "dairy":
      ideas = buildDairyRecipes(primary, primaryLower, support, ingredientList);
      break;
    default:
      ideas = buildVegetableRecipes(primary, primaryLower, support);
  }

  return ideas.map((recipe, index) => ({
    ...recipe,
    id: `ai-${slugify(recipe.name) || `local-${index}`}`,
  }));
}
