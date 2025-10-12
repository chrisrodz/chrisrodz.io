import { z } from 'zod';

/**
 * Brew methods supported by the cafe tracker
 */
export const BREW_METHODS = ['Espresso', 'AeroPress', 'French Press'] as const;

/**
 * Schema for adding/editing coffee beans
 */
export const CoffeeBeanSchema = z.object({
  bean_name: z
    .string()
    .min(1, 'Bean name is required')
    .max(200, 'Bean name must be less than 200 characters')
    .trim(),

  roaster: z
    .string()
    .max(200, 'Roaster name must be less than 200 characters')
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),

  origin: z
    .string()
    .max(200, 'Origin must be less than 200 characters')
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),

  roast_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
    .optional()
    .nullable()
    .transform((val) => val || null),

  notes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),

  is_active: z.boolean().default(true),
});

/**
 * Schema for logging coffee brews
 */
export const CoffeeLogSchema = z.object({
  brew_method: z.enum(BREW_METHODS, {
    message: 'Please select a valid brew method',
  }),

  bean_id: z
    .string()
    .uuid({ message: 'Please select a valid bean' })
    .optional()
    .nullable()
    .transform((val) => val || null),

  dose_grams: z
    .number({
      message: 'Dose must be a number',
    })
    .positive('Dose must be greater than 0')
    .max(100, 'Dose must be 100 grams or less')
    .int('Dose must be a whole number'),

  yield_grams: z
    .number({
      message: 'Yield must be a number',
    })
    .positive('Yield must be greater than 0')
    .max(200, 'Yield must be 200 grams or less')
    .int('Yield must be a whole number')
    .optional()
    .nullable()
    .transform((val) => val || null),

  grind_setting: z
    .number({
      message: 'Grind setting must be a number',
    })
    .int('Grind setting must be a whole number')
    .min(1, 'Grind setting must be between 1 and 40')
    .max(40, 'Grind setting must be between 1 and 40'),

  quality_rating: z
    .number({
      message: 'Quality rating must be a number',
    })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),

  brew_time: z.string().datetime({ message: 'Invalid datetime format' }),

  notes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),
});

/**
 * Type definitions inferred from schemas
 */
export type CoffeeBeanInput = z.infer<typeof CoffeeBeanSchema>;
export type CoffeeLogInput = z.infer<typeof CoffeeLogSchema>;

/**
 * Database row types (for reading from Supabase)
 */
export interface CoffeeBeanRow {
  id: string;
  created_at: string;
  bean_name: string;
  roaster: string | null;
  origin: string | null;
  roast_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface CoffeeLogRow {
  id: string;
  created_at: string;
  brew_method: (typeof BREW_METHODS)[number];
  bean_id: string | null;
  dose_grams: number;
  yield_grams: number | null;
  grind_setting: number;
  quality_rating: number;
  brew_time: string;
  notes: string | null;
}

/**
 * Extended log row with bean details (for joins)
 */
export interface CoffeeLogWithBean extends CoffeeLogRow {
  bean?: CoffeeBeanRow | null;
}
