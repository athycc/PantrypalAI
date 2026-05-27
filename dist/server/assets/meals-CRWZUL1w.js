const MEALS = [
  {
    id: "lugaw",
    name: "Lugaw (Arroz Caldo)",
    ingredients: ["rice", "garlic", "onion"],
    priceMin: 45,
    priceMax: 52,
    kcal: 320,
    minutes: 30,
    emoji: "🍚",
    tipid: true,
    steps: ["Sauté garlic & onion", "Add rice + 6 cups water", "Simmer 25 min", "Season with patis"]
  },
  {
    id: "egg-fried-rice",
    name: "Egg Fried Rice",
    ingredients: ["rice", "eggs", "soy sauce", "garlic"],
    priceMin: 32,
    priceMax: 40,
    kcal: 280,
    minutes: 15,
    emoji: "🍳",
    tipid: true,
    steps: ["Beat eggs, scramble", "Add rice, garlic", "Drizzle soy sauce", "Toss 3 min"]
  },
  {
    id: "tofu-sisig",
    name: "Tofu Sisig",
    ingredients: ["tofu", "onion", "soy sauce"],
    priceMin: 55,
    priceMax: 70,
    kcal: 380,
    minutes: 20,
    emoji: "🥘",
    tipid: true,
    steps: ["Cube & fry tofu", "Sauté onion", "Mix + soy sauce + calamansi"]
  },
  {
    id: "tinola",
    name: "Tinolang Manok",
    ingredients: ["chicken", "garlic", "onion", "ginger"],
    priceMin: 68,
    priceMax: 85,
    kcal: 420,
    minutes: 45,
    emoji: "🍲",
    tipid: false,
    steps: ["Sauté aromatics", "Add chicken", "Add water + simmer 30 min", "Add greens"]
  },
  {
    id: "ginisang-kangkong",
    name: "Ginisang Kangkong",
    ingredients: ["kangkong", "garlic", "soy sauce"],
    priceMin: 28,
    priceMax: 38,
    kcal: 180,
    minutes: 10,
    emoji: "🥬",
    tipid: true,
    steps: ["Sauté garlic", "Add kangkong stems", "Add leaves + soy sauce"]
  },
  {
    id: "scrambled-eggs",
    name: "Scrambled Eggs",
    ingredients: ["eggs"],
    priceMin: 18,
    priceMax: 25,
    kcal: 200,
    minutes: 5,
    emoji: "🍳",
    tipid: true,
    steps: ["Beat 2 eggs", "Cook on low heat", "Season with salt"]
  },
  {
    id: "adobo-flakes",
    name: "Pork Adobo",
    ingredients: ["pork", "soy sauce", "garlic", "vinegar"],
    priceMin: 95,
    priceMax: 120,
    kcal: 520,
    minutes: 60,
    emoji: "🥩",
    tipid: false,
    steps: ["Marinate pork", "Sear", "Simmer in soy + vinegar 40 min"]
  },
  {
    id: "champorado",
    name: "Champorado",
    ingredients: ["rice", "cocoa"],
    priceMin: 25,
    priceMax: 35,
    kcal: 290,
    minutes: 25,
    emoji: "🍫",
    tipid: true,
    steps: ["Boil rice in water", "Add cocoa + sugar", "Simmer until thick"]
  }
];
function matchScore(meal, pantryNames) {
  const lower = pantryNames.map((n) => n.toLowerCase());
  const have = [];
  const missing = [];
  for (const ing of meal.ingredients) {
    const found = lower.some((p) => p.includes(ing) || ing.includes(p));
    if (found) have.push(ing);
    else missing.push(ing);
  }
  return { have, missing, pct: Math.round(have.length / meal.ingredients.length * 100) };
}
export {
  MEALS as M,
  matchScore as m
};
