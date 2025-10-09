import { z } from 'zod';

// Bean validation schema
export const BeanSchema = z.object({
  bean_name: z.string().min(1, { error: 'Bean name is required' }).max(200, { error: 'Bean name is too long' }),
  roaster: z.string().max(200, { error: 'Roaster name is too long' }).optional(),
  origin: z.string().max(200, { error: 'Origin is too long' }).optional(),
  roast_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Invalid date format' }).optional().or(z.literal('')),
  bean_notes: z.string().max(2000, { error: 'Notes are too long' }).optional(),
});

// Coffee entry validation schema
export const CoffeeSchema = z.object({
  bean_id: z.uuid({ error: 'Invalid bean selection' }),
  brew_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Invalid date format' }),
  brew_method: z.string().max(100, { error: 'Brew method is too long' }).optional(),
  coffee_grams: z.string().transform((val) => {
    if (!val) return null;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 1000) {
      throw new Error('Coffee grams must be between 0 and 1000');
    }
    return num;
  }).optional(),
  water_grams: z.string().transform((val) => {
    if (!val) return null;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 10000) {
      throw new Error('Water grams must be between 0 and 10000');
    }
    return num;
  }).optional(),
  rating: z.string().transform((val) => {
    if (!val) return null;
    const num = parseInt(val);
    if (isNaN(num) || num < 1 || num > 10) {
      throw new Error('Rating must be between 1 and 10');
    }
    return num;
  }).optional(),
  coffee_notes: z.string().max(2000, { error: 'Notes are too long' }).optional(),
});

export type BeanInput = z.infer<typeof BeanSchema>;
export type CoffeeInput = z.infer<typeof CoffeeSchema>;
