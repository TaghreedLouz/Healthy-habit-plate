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
}

export const recipes: Recipe[] = [
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
];

export function getRecipe(id: string) {
  return recipes.find((r) => r.id === id);
}

export function suggestRecipes(userIngredients: string[]): (Recipe & { matches: number; missing: string[] })[] {
  const norm = (s: string) => s.toLowerCase().trim();
  const have = new Set(userIngredients.map(norm));
  return recipes
    .map((r) => {
      const matches = r.ingredients.filter((i) => have.has(norm(i))).length;
      const missing = r.ingredients.filter((i) => !have.has(norm(i)));
      return { ...r, matches, missing };
    })
    .filter((r) => r.matches > 0 || userIngredients.length === 0)
    .sort((a, b) => b.matches - a.matches || b.health - a.health);
}
