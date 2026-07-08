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

export const categories: Category[] = [];

export const menuItems: MenuItem[] = [];

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
