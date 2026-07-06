export type Branch = {
  id: string;
  name: string;
  slug: string;
  location: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  calories: number;
  imageUrl: string;
  images: {
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    cardUrl: string;
    detailUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: string;
  }[];
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  isSoldOut: boolean;
  availableBranches: string[];
  createdAt: string;
  updatedAt: string;
};

const now = "2026-06-23T09:00:00.000Z";

export const branches: Branch[] = [
  {
    id: "branch-imaara",
    name: "Robot Cafe - Imaara Mall",
    slug: "imaara-mall",
    location: "Imaara Mall, Nairobi",
    phone: "+254 700 000 101",
    email: "imaara@robotcafe.co.ke",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "branch-lana",
    name: "Robot Cafe - Lana Plaza",
    slug: "lana-plaza",
    location: "Lana Plaza, Nairobi",
    phone: "+254 700 000 202",
    email: "lana@robotcafe.co.ke",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const categories: Category[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Burgers",
  "Coffee",
  "Tea",
  "Desserts",
  "Sushi",
  "Cocktails",
  "Mocktails",
  "Salads",
].map((name, index) => ({
  id: `cat-${name.toLowerCase().replaceAll(" ", "-")}`,
  name,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  sortOrder: index + 1,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}));

const img = (query: string, width: number, quality = 80) =>
  `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=${width}&q=${quality}&ixid=${encodeURIComponent(query)}`;

const item = (
  id: number,
  name: string,
  category: string,
  price: number,
  description: string,
  branchesAvailable: string[],
  flags: Partial<Pick<MenuItem, "isFeatured" | "isBestSeller" | "isNewArrival" | "isSoldOut">> = {},
): MenuItem => ({
  id: `item-${id}`,
  name,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  description,
  shortDescription: description,
  price,
  preparationTime: 12 + (id % 7) * 3,
  ingredients: ["Chef selected", "Robot Cafe signature", category],
  allergens: id % 4 === 0 ? ["Dairy", "Gluten"] : id % 5 === 0 ? ["Nuts"] : [],
  calories: 240 + id * 18,
  imageUrl: img(name, 900),
  images: [
    {
      id: `item-${id}-image-primary`,
      imageUrl: img(name, 1600, 84),
      thumbnailUrl: img(name, 360, 72),
      cardUrl: img(name, 900, 78),
      detailUrl: img(name, 1600, 84),
      fileName: `${name.toLowerCase().replaceAll(" ", "-")}.webp`,
      fileSize: 0,
      mimeType: "image/webp",
      width: 900,
      height: 720,
      isPrimary: true,
      sortOrder: 1,
      createdAt: now,
    },
  ],
  categoryId: `cat-${category.toLowerCase().replaceAll(" ", "-")}`,
  isFeatured: Boolean(flags.isFeatured),
  isBestSeller: Boolean(flags.isBestSeller),
  isNewArrival: Boolean(flags.isNewArrival),
  isActive: true,
  isSoldOut: Boolean(flags.isSoldOut),
  availableBranches: branchesAvailable,
  createdAt: now,
  updatedAt: now,
});

export const menuItems: MenuItem[] = [
  item(1, "Gold Reserve Pancakes", "Breakfast", 950, "Vanilla bean pancakes with berry compote and maple cream.", ["imaara-mall", "lana-plaza"], { isFeatured: true }),
  item(2, "Truffle Egg Croissant", "Breakfast", 820, "Buttery croissant layered with soft eggs, truffle oil, and herbs.", ["imaara-mall"], { isBestSeller: true }),
  item(3, "Avocado Sunrise Toast", "Breakfast", 740, "Seeded sourdough, avocado, poached egg, and citrus chili oil.", ["lana-plaza"]),
  item(4, "Executive Chicken Bowl", "Lunch", 1250, "Charred chicken, saffron rice, greens, and roasted pepper jus.", ["imaara-mall", "lana-plaza"], { isBestSeller: true }),
  item(5, "Nairobi Steak Sandwich", "Lunch", 1450, "Grilled steak, caramelized onion, smoked aioli, and crisp fries.", ["imaara-mall"]),
  item(6, "Lana Salmon Plate", "Lunch", 1680, "Seared salmon, lemon butter potatoes, cucumber ribbons, and dill.", ["lana-plaza"], { isNewArrival: true }),
  item(7, "Midnight Beef Short Rib", "Dinner", 2350, "Slow-braised short rib, potato puree, and glossy pan reduction.", ["imaara-mall", "lana-plaza"], { isFeatured: true }),
  item(8, "Coconut Prawn Curry", "Dinner", 1850, "Prawns in coconut curry with fragrant rice and fresh coriander.", ["lana-plaza"]),
  item(9, "Charred Chicken Supreme", "Dinner", 1720, "Herb-marinated chicken with mushroom jus and seasonal greens.", ["imaara-mall"]),
  item(13, "Prime Smash Burger", "Burgers", 1280, "Double beef patty, cheddar, pickles, and house gold sauce.", ["imaara-mall", "lana-plaza"], { isBestSeller: true }),
  item(14, "Crispy Chicken Royale", "Burgers", 1190, "Buttermilk chicken, slaw, jalapeno mayo, and brioche.", ["imaara-mall"]),
  item(15, "Plant Luxe Burger", "Burgers", 1320, "Plant patty, avocado, tomato relish, and smoked vegan aioli.", ["lana-plaza"]),
  item(16, "Reserve Cappuccino", "Coffee", 420, "Velvety espresso, microfoam, and cocoa finish.", ["imaara-mall", "lana-plaza"], { isFeatured: true }),
  item(17, "Iced Caramel Cloud", "Coffee", 560, "Cold espresso with caramel, milk, and salted cream.", ["imaara-mall", "lana-plaza"]),
  item(18, "Single Origin Pour Over", "Coffee", 650, "Rotating origin brewed to order with a clean aromatic profile.", ["imaara-mall"], { isNewArrival: true }),
  item(19, "Kenyan Purple Tea", "Tea", 390, "Floral purple tea with honey and lemon zest.", ["imaara-mall", "lana-plaza"]),
  item(20, "Mint Green Ritual", "Tea", 380, "Green tea, fresh mint, and citrus steam.", ["lana-plaza"]),
  item(21, "Chocolate Orbit Cake", "Desserts", 780, "Dark chocolate mousse, praline crunch, and gold cocoa dust.", ["imaara-mall", "lana-plaza"], { isFeatured: true }),
  item(22, "Vanilla Bean Panna Cotta", "Desserts", 720, "Silky panna cotta with passion fruit and almond crumble.", ["lana-plaza"]),
  item(23, "Warm Apple Tart", "Desserts", 690, "Caramelized apple, puff pastry, and cinnamon cream.", ["imaara-mall"]),
  item(24, "Salmon Nigiri Set", "Sushi", 1550, "Six-piece salmon nigiri with ginger, wasabi, and soy.", ["lana-plaza"], { isNewArrival: true }),
  item(25, "Crispy Tuna Roll", "Sushi", 1480, "Tuna, avocado, tempura crunch, and spicy mayo.", ["imaara-mall", "lana-plaza"]),
  item(26, "Golden Negroni", "Cocktails", 980, "Aromatic citrus negroni with a polished bitter finish.", ["imaara-mall"], { isFeatured: true }),
  item(27, "Lana Spritz", "Cocktails", 920, "Sparkling aperitif with citrus, botanicals, and rosemary.", ["lana-plaza"]),
  item(28, "Passion Nojito", "Mocktails", 620, "Passion fruit, mint, lime, and sparkling water.", ["imaara-mall", "lana-plaza"], { isBestSeller: true }),
  item(29, "Cucumber Elderflower Fizz", "Mocktails", 640, "Cucumber, elderflower, lemon, and tonic sparkle.", ["lana-plaza"]),
  item(30, "Grilled Halloumi Salad", "Salads", 1150, "Halloumi, baby greens, tomato, olives, and basil vinaigrette.", ["imaara-mall", "lana-plaza"]),
  item(31, "Robot Caesar", "Salads", 990, "Romaine, parmesan, garlic croutons, and anchovy dressing.", ["imaara-mall"]),
  item(32, "Watermelon Feta Glow", "Salads", 1080, "Watermelon, feta, mint, cucumber, and balsamic pearls.", ["lana-plaza"], { isSoldOut: true }),
];

export const getBranchBySlug = (slug: string) => branches.find((branch) => branch.slug === slug);

export const getCategoryById = (categoryId: string) => categories.find((category) => category.id === categoryId);

export const getItemsForBranch = (branchSlug: string) =>
  menuItems.filter((item) => item.isActive && item.availableBranches.includes(branchSlug));

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);

export const platformStats = {
  totalMenuItems: menuItems.length,
  imaaraMenuItems: getItemsForBranch("imaara-mall").length,
  lanaMenuItems: getItemsForBranch("lana-plaza").length,
  bothBranchItems: menuItems.filter((item) => item.availableBranches.length === branches.length).length,
  feedbackCount: 48,
};
