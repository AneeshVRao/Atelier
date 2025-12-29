import { z } from "zod";

// Auth schemas
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/,
      "Password should contain at least one uppercase letter or number"
    ),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

// Wardrobe item schema
export const wardrobeItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
  category: z.string().min(1, "Category is required"),
  color: z.string().optional(),
  brand: z.string().max(50, "Brand name is too long").optional(),
  occasion: z.array(z.string()).optional(),
  season: z.array(z.string()).optional(),
});

export type WardrobeItemFormData = z.infer<typeof wardrobeItemSchema>;

// Shopping item schema
export const shoppingItemSchema = z.object({
  item_name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Name is too long"),
  category: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  price_range: z.string().max(50).optional(),
  notes: z.string().max(500, "Notes are too long").optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type ShoppingItemFormData = z.infer<typeof shoppingItemSchema>;

// Profile schema
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .optional(),
  style_preference: z.string().optional(),
  color_palette: z.string().optional(),
  body_type: z.string().optional(),
  height: z.string().optional(),
  budget_range: z.string().optional(),
  occasions: z.array(z.string()).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Calendar entry schema
export const calendarEntrySchema = z.object({
  planned_date: z.string().min(1, "Date is required"),
  occasion: z.string().optional(),
  notes: z.string().max(500, "Notes are too long").optional(),
});

export type CalendarEntryFormData = z.infer<typeof calendarEntrySchema>;

// Style quiz schema
export const styleQuizSchema = z.object({
  selectedStyle: z.string().min(1, "Please select a style"),
  selectedOccasions: z
    .array(z.string())
    .min(1, "Please select at least one occasion"),
  selectedColors: z.string().min(1, "Please select a color palette"),
});

export type StyleQuizFormData = z.infer<typeof styleQuizSchema>;

// Helper function to validate and get errors
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}
