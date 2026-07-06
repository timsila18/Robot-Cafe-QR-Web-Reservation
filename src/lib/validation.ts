import { z } from "zod";

const slug = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

const csvText = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    Array.isArray(value)
      ? value
      : value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
  );

const imageSource = z.string().refine((value) => value.startsWith("data:image/") || /^https?:\/\//.test(value), {
  message: "Use a valid image URL or image data URL.",
});

export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  slug,
  description: z.string().min(8).max(800),
  shortDescription: z.string().min(2).max(180),
  price: z.coerce.number().min(0),
  preparationTime: z.coerce.number().int().min(0).max(240),
  ingredients: csvText,
  allergens: csvText,
  calories: z.coerce.number().int().min(0).max(5000),
  categoryId: z.string().min(1),
  isFeatured: z.coerce.boolean(),
  isBestSeller: z.coerce.boolean(),
  isNewArrival: z.coerce.boolean(),
  isActive: z.coerce.boolean(),
  isSoldOut: z.coerce.boolean(),
  displayOrder: z.coerce.number().int().min(0),
  availableBranches: z.array(z.string().min(1)).min(1, "Select at least one branch."),
  images: z
    .array(
      z.object({
        id: z.string(),
        imageUrl: imageSource,
        thumbnailUrl: imageSource,
        cardUrl: imageSource,
        detailUrl: imageSource,
        fileName: z.string().min(1).max(240),
        fileSize: z.coerce.number().int().min(0),
        mimeType: z.string().min(1).max(80),
        width: z.coerce.number().int().min(0),
        height: z.coerce.number().int().min(0),
        isPrimary: z.boolean(),
        sortOrder: z.number().int(),
        createdAt: z.string(),
        storagePaths: z
          .object({
            original: z.string().optional(),
            thumbnail: z.string().optional(),
            card: z.string().optional(),
            detail: z.string().optional(),
          })
          .optional(),
        originalMetadata: z
          .object({
            originalFileName: z.string(),
            originalFileSize: z.number().int().min(0),
            originalMimeType: z.string(),
            originalWidth: z.number().int().min(0),
            originalHeight: z.number().int().min(0),
          })
          .optional(),
      }),
    )
    .max(10, "A menu item can hold up to 10 images.")
    .default([]),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(80),
  slug,
  description: z.string().max(240).optional().default(""),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean(),
});

export const branchSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(120),
  slug,
  location: z.string().min(2).max(180),
  phone: z.string().max(40).optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  openingHours: z.string().min(2).max(180),
  isActive: z.coerce.boolean(),
});

export const feedbackSchema = z.object({
  name: z.string().max(120).optional().default(""),
  phone: z.string().min(5).max(40),
  email: z.string().email().optional().or(z.literal("")).default(""),
  branchId: z.string().min(1),
  foodRating: z.coerce.number().int().min(1).max(5),
  serviceRating: z.coerce.number().int().min(1).max(5),
  ambienceRating: z.coerce.number().int().min(1).max(5),
  overallRating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(1200),
});

export const qrScanSchema = z.object({
  branchId: z.string().optional(),
  route: z.string().max(240).optional().default(""),
  deviceType: z.string().max(120).optional().default("unknown"),
  browser: z.string().max(120).optional().default("unknown"),
  os: z.string().max(120).optional().default("unknown"),
  sessionId: z.string().max(160).optional().default(""),
  referrer: z.string().max(400).optional().default(""),
  page: z.string().min(1).max(240),
  itemId: z.string().optional(),
  categoryId: z.string().optional(),
  searchQuery: z.string().max(120).optional(),
  country: z.string().max(120).optional().default(""),
  city: z.string().max(120).optional().default(""),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BranchInput = z.infer<typeof branchSchema>;
