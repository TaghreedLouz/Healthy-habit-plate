export const RECIPE_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "High Protein",
  "Low Carb",
  "Weight Loss",
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  ingredients: string[];
  addOns: string[];
  steps: string[];
  time: number; // minutes
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  health: number; // 0-100
  bestTime: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  why: string;
  published?: boolean;
  source?: "ai" | "admin" | "builtin";
  categories?: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const baseRecipes: Recipe[] = [
  {
    id: "chicken-rice-bowl",
    name: "Healthy Chicken Rice Bowl",
    description: "Grilled chicken on fluffy rice with crisp cucumber and a lemon-olive drizzle.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Chicken", "Rice", "Cucumber"],
    addOns: ["Lemon", "Olive oil", "Lettuce"],
    steps: [
      "Cook the rice until fluffy.",
      "Grill the chicken with salt, pepper and paprika.",
      "Slice cucumber and lettuce.",
      "Assemble the bowl with rice base and toppings.",
      "Drizzle with olive oil and lemon juice.",
      "Serve fresh.",
    ],
    time: 25, servings: 1,
    calories: 520, protein: 42, carbs: 55, fats: 14,
    health: 85, bestTime: "Lunch",
    why: "Balanced macros — lean protein from chicken, complex carbs from rice, and fiber from fresh vegetables. Ideal mid-day fuel.",
  },
  {
    id: "oats-yogurt-berries",
    name: "Oats with Yogurt & Berries",
    description: "Creamy overnight oats topped with yogurt, honey and fresh berries.",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Oats", "Yogurt"],
    addOns: ["Berries", "Honey", "Chia seeds"],
    steps: [
      "Mix oats with yogurt and a splash of milk.",
      "Rest 10 minutes (or overnight).",
      "Top with berries, honey, and chia seeds.",
    ],
    time: 10, servings: 1,
    calories: 350, protein: 18, carbs: 52, fats: 7,
    health: 92, bestTime: "Breakfast",
    why: "High-fiber oats and probiotic yogurt support gut health and slow-release energy for the morning.",
  },
  {
    id: "tuna-salad",
    name: "Mediterranean Tuna Salad",
    description: "Light tuna salad with tomato, cucumber and a citrusy dressing.",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Tuna", "Cucumber", "Tomato"],
    addOns: ["Olive oil", "Lemon", "Olives"],
    steps: [
      "Drain tuna and place in a bowl.",
      "Chop cucumber and tomato.",
      "Combine with olives, olive oil and lemon.",
      "Season with herbs and serve.",
    ],
    time: 8, servings: 1,
    calories: 280, protein: 28, carbs: 10, fats: 14,
    health: 88, bestTime: "Lunch",
    why: "Omega-3 rich tuna with hydrating vegetables — high protein, low calorie, perfect for a goal.",
  },
  {
    id: "veggie-omelette",
    name: "Garden Veggie Omelette",
    description: "Three-egg omelette folded around tomato, spinach and feta.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Eggs", "Tomato"],
    addOns: ["Spinach", "Feta", "Black pepper"],
    steps: [
      "Whisk eggs with a pinch of salt.",
      "Sauté tomato and spinach briefly.",
      "Pour eggs in, scatter feta, fold and serve.",
    ],
    time: 10, servings: 1,
    calories: 320, protein: 24, carbs: 6, fats: 22,
    health: 80, bestTime: "Breakfast",
    why: "Complete protein from eggs paired with iron-rich greens keeps you full and focused.",
  },
  {
    id: "baked-potato-tuna",
    name: "Loaded Sweet Potato",
    description: "Baked sweet potato topped with tuna, yogurt and herbs.",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Potato", "Tuna", "Yogurt"],
    addOns: ["Chives", "Lemon"],
    steps: [
      "Bake potato until tender (40 min at 200°C).",
      "Split open and fluff inside.",
      "Top with tuna, a dollop of yogurt and chives.",
    ],
    time: 45, servings: 1,
    calories: 440, protein: 30, carbs: 55, fats: 10,
    health: 86, bestTime: "Dinner",
    why: "Slow carbs from sweet potato + lean protein make this a satisfying recovery dinner.",
  },
  {
    id: "avocado-toast",
    name: "Avocado Egg Toast",
    description: "Smashed avocado on toast with a soft-boiled egg and chili flakes.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Bread", "Eggs"],
    addOns: ["Avocado", "Chili flakes", "Lemon"],
    steps: [
      "Toast the bread.",
      "Mash avocado with lemon and salt.",
      "Soft-boil the egg (6 min), peel.",
      "Spread avocado, top with egg and chili.",
    ],
    time: 12, servings: 1,
    calories: 380, protein: 16, carbs: 30, fats: 22,
    health: 84, bestTime: "Breakfast",
    why: "Healthy fats from avocado pair with protein-rich eggs for sustained morning energy.",
  },
  {
    id: "chicken-veggie-stirfry",
    name: "Chicken Veggie Stir-Fry",
    description: "Quick stir-fry of chicken with seasonal veg and a soy-ginger glaze.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Chicken", "Tomato"],
    addOns: ["Bell pepper", "Ginger", "Soy sauce", "Garlic"],
    steps: [
      "Slice chicken thin and sear in hot pan.",
      "Add ginger, garlic, peppers.",
      "Toss with soy sauce and tomato wedges.",
      "Serve hot.",
    ],
    time: 18, servings: 2,
    calories: 410, protein: 38, carbs: 18, fats: 18,
    health: 87, bestTime: "Dinner",
    why: "High protein, low refined carbs — ideal for an evening meal that supports muscle recovery.",
  },
  {
    id: "yogurt-bowl-snack",
    name: "Greek Yogurt Power Bowl",
    description: "Yogurt with oats, honey and crunchy seeds — a quick snack.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Yogurt", "Oats"],
    addOns: ["Honey", "Almonds", "Cinnamon"],
    steps: ["Spoon yogurt into bowl.", "Top with oats, almonds, honey, cinnamon."],
    time: 3, servings: 1,
    calories: 220, protein: 14, carbs: 26, fats: 6,
    health: 90, bestTime: "Snack",
    why: "Protein-forward snack that curbs hunger between meals without spiking blood sugar.",
  },
  {
    id: "rice-veggie-bowl",
    name: "Rainbow Veggie Rice Bowl",
    description: "Fluffy rice with sautéed vegetables, herbs and a light sesame dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Rice", "Tomato", "Cucumber"],
    addOns: ["Carrot", "Sesame oil", "Soy sauce"],
    steps: [
      "Cook rice and fluff with a fork.",
      "Sauté chopped vegetables until tender-crisp.",
      "Combine rice and veg in a bowl.",
      "Drizzle with sesame oil and soy sauce, toss and serve.",
    ],
    time: 20, servings: 2,
    calories: 390, protein: 10, carbs: 68, fats: 8,
    health: 91, bestTime: "Lunch",
    why: "Plant-forward bowl packed with fiber and complex carbs for steady afternoon energy.",
  },
  {
    id: "egg-fried-rice",
    name: "Light Egg Fried Rice",
    description: "Classic fried rice with eggs, scallions and a touch of soy — lighter on oil.",
    image: "https://images.unsplash.com/photo-1603133872878-684fc097d393?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Rice", "Eggs"],
    addOns: ["Scallions", "Soy sauce", "Peas"],
    steps: [
      "Scramble eggs in a hot pan, set aside.",
      "Stir-fry cold rice with soy sauce.",
      "Add eggs, peas and scallions back in.",
      "Toss until heated through and serve.",
    ],
    time: 15, servings: 2,
    calories: 420, protein: 16, carbs: 58, fats: 12,
    health: 78, bestTime: "Dinner",
    why: "Uses leftover rice for a quick dinner with protein from eggs and minimal added fat.",
  },
  {
    id: "chicken-wrap",
    name: "Grilled Chicken Wrap",
    description: "Whole-wheat wrap filled with grilled chicken, yogurt sauce and crisp veggies.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Chicken", "Bread", "Yogurt"],
    addOns: ["Lettuce", "Tomato", "Cucumber"],
    steps: [
      "Grill seasoned chicken until cooked through.",
      "Mix yogurt with lemon and herbs for sauce.",
      "Warm the wrap, layer lettuce, chicken and vegetables.",
      "Drizzle sauce, roll tightly and slice.",
    ],
    time: 22, servings: 1,
    calories: 460, protein: 40, carbs: 38, fats: 16,
    health: 83, bestTime: "Lunch",
    why: "Portable high-protein lunch with probiotics from yogurt and fiber from fresh vegetables.",
  },
  {
    id: "tomato-egg-scramble",
    name: "Tomato & Egg Scramble",
    description: "Soft scrambled eggs with juicy tomatoes — a simple, satisfying breakfast.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Eggs", "Tomato"],
    addOns: ["Olive oil", "Basil", "Black pepper"],
    steps: [
      "Dice tomatoes and sauté briefly in olive oil.",
      "Whisk eggs with salt and pepper.",
      "Pour eggs over tomatoes and scramble gently.",
      "Finish with fresh basil and serve warm.",
    ],
    time: 8, servings: 1,
    calories: 290, protein: 20, carbs: 8, fats: 20,
    health: 82, bestTime: "Breakfast",
    why: "Lycopene from cooked tomatoes plus complete protein from eggs supports heart health.",
  },
  {
    id: "tuna-rice-cups",
    name: "Tuna Rice Cups",
    description: "Rice pressed into cups and topped with seasoned tuna and cucumber.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Tuna", "Rice", "Cucumber"],
    addOns: ["Lemon", "Sesame seeds", "Soy sauce"],
    steps: [
      "Season rice lightly with rice vinegar.",
      "Press rice into small cups or molds.",
      "Mix tuna with soy sauce and lemon.",
      "Top rice cups with tuna and cucumber slices.",
    ],
    time: 12, servings: 2,
    calories: 310, protein: 26, carbs: 42, fats: 6,
    health: 89, bestTime: "Snack",
    why: "Lean protein and portion-controlled carbs make this a balanced between-meal option.",
  },
  {
    id: "oat-pancakes",
    name: "Banana Oat Pancakes",
    description: "Fluffy pancakes made from oats and eggs — no refined flour needed.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Oats", "Eggs"],
    addOns: ["Honey", "Yogurt", "Berries"],
    steps: [
      "Blend oats and eggs until smooth.",
      "Cook small pancakes on a non-stick pan.",
      "Stack and top with yogurt, berries and honey.",
    ],
    time: 15, servings: 2,
    calories: 340, protein: 18, carbs: 44, fats: 10,
    health: 86, bestTime: "Breakfast",
    why: "Whole-grain oats provide slow-release carbs; eggs add protein to keep you full until lunch.",
  },
  {
    id: "potato-egg-hash",
    name: "Crispy Potato & Egg Hash",
    description: "Golden potato cubes with runny eggs and fresh tomato on top.",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Potato", "Eggs", "Tomato"],
    addOns: ["Olive oil", "Paprika", "Parsley"],
    steps: [
      "Dice potatoes and pan-fry until crispy.",
      "Create wells in the hash and crack in eggs.",
      "Cover until whites set, top with diced tomato.",
      "Season with paprika and parsley.",
    ],
    time: 25, servings: 2,
    calories: 480, protein: 22, carbs: 48, fats: 22,
    health: 79, bestTime: "Dinner",
    why: "Hearty comfort food with balanced macros — great after an active day.",
  },
];

/** @deprecated Use getRecipeFromCatalog or useRecipeCatalog */
export const recipes = baseRecipes;

export function getRecipe(id: string) {
  return baseRecipes.find((r) => r.id === id);
}

export function suggestRecipes(userIngredients: string[]): (Recipe & { matches: number; missing: string[] })[] {
  const list = userIngredients ?? [];
  const norm = (s: string) => s.toLowerCase().trim();
  const have = new Set(list.map(norm));
  return baseRecipes
    .map((r) => {
      const matches = r.ingredients.filter((i) => have.has(norm(i))).length;
      const missing = r.ingredients.filter((i) => !have.has(norm(i)));
      return { ...r, matches, missing };
    })
    .filter((r) => r.matches > 0 || list.length === 0)
    .sort((a, b) => b.matches - a.matches || b.health - a.health);
}
