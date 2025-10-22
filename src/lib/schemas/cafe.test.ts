import { describe, it, expect } from 'vitest';
import { CoffeeBeanSchema, CoffeeLogSchema } from './cafe';

describe('Cafe Schemas', () => {
  describe('CoffeeBeanSchema', () => {
    describe('Valid Data', () => {
      it('should validate bean data with only required field', () => {
        const minimalBean = {
          bean_name: 'Simple Bean',
        };

        const result = CoffeeBeanSchema.safeParse(minimalBean);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.bean_name).toBe('Simple Bean');
          expect(result.data.roaster).toBeNull();
          expect(result.data.origin).toBeNull();
          expect(result.data.roast_date).toBeNull();
          expect(result.data.notes).toBeNull();
          expect(result.data.is_active).toBe(true);
        }
      });
    });

    describe('Invalid Data', () => {
      it('should reject empty bean name', () => {
        const bean = {
          bean_name: '',
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Bean name is required');
        }
      });

      it('should reject missing bean name', () => {
        const bean = {
          roaster: 'Blue Bottle',
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);
      });

      it('should reject bean name exceeding 200 characters', () => {
        const bean = {
          bean_name: 'A'.repeat(201),
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Bean name must be less than 200 characters');
        }
      });

      it('should reject roaster exceeding 200 characters', () => {
        const bean = {
          bean_name: 'Test Bean',
          roaster: 'R'.repeat(201),
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Roaster name must be less than 200 characters'
          );
        }
      });

      it('should reject origin exceeding 200 characters', () => {
        const bean = {
          bean_name: 'Test Bean',
          origin: 'O'.repeat(201),
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Origin must be less than 200 characters');
        }
      });

      it('should reject invalid date format', () => {
        const bean = {
          bean_name: 'Test Bean',
          roast_date: '2025/01/15', // Wrong format
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid date format (use YYYY-MM-DD)');
        }
      });

      it('should reject partial date format', () => {
        const bean = {
          bean_name: 'Test Bean',
          roast_date: '2025-01', // Incomplete
        };

        const result = CoffeeBeanSchema.safeParse(bean);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid date format (use YYYY-MM-DD)');
        }
      });
    });
  });

  describe('CoffeeLogSchema', () => {
    describe('Valid Data', () => {
      it('should validate log data with only required fields', () => {
        const minimalLog = {
          brew_method: 'AeroPress' as const,
          dose_grams: 15,
          grind_setting: 25,
          quality_rating: 5,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(minimalLog);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.bean_id).toBeNull();
          expect(result.data.yield_grams).toBeNull();
          expect(result.data.notes).toBeNull();
        }
      });
    });

    describe('Invalid Data', () => {
      it('should reject invalid brew method', () => {
        const log = {
          brew_method: 'Invalid Method',
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please select a valid brew method');
        }
      });

      it('should reject missing brew method', () => {
        const log = {
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);
      });

      it('should reject invalid bean_id (non-UUID)', () => {
        const log = {
          brew_method: 'Espresso' as const,
          bean_id: 'not-a-uuid',
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please select a valid bean');
        }
      });

      it('should reject negative dose_grams', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: -5,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Dose must be greater than 0');
        }
      });

      it('should reject zero dose_grams', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 0,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Dose must be greater than 0');
        }
      });

      it('should reject dose_grams exceeding 100', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 101,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Dose must be 100 grams or less');
        }
      });

      it('should reject non-integer dose_grams', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18.5,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Dose must be a whole number');
        }
      });

      it('should reject yield_grams exceeding 200', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          yield_grams: 201,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Yield must be 200 grams or less');
        }
      });

      it('should reject grind_setting below 1', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          grind_setting: 0,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Grind setting must be between 1 and 40');
        }
      });

      it('should reject grind_setting above 40', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          grind_setting: 41,
          quality_rating: 4,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Grind setting must be between 1 and 40');
        }
      });

      it('should reject quality_rating below 1', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 0,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Rating must be between 1 and 5');
        }
      });

      it('should reject quality_rating above 5', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 6,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Rating must be between 1 and 5');
        }
      });

      it('should reject non-integer quality_rating', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 3.5,
          brew_time: '2025-01-15T10:30:00Z',
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Rating must be a whole number');
        }
      });

      it('should reject invalid datetime format', () => {
        const log = {
          brew_method: 'Espresso' as const,
          dose_grams: 18,
          grind_setting: 10,
          quality_rating: 4,
          brew_time: '2025-01-15', // Missing time
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid datetime format');
        }
      });

      it('should reject missing required fields', () => {
        const log = {
          brew_method: 'Espresso' as const,
          // Missing dose_grams, grind_setting, quality_rating, brew_time
        };

        const result = CoffeeLogSchema.safeParse(log);
        expect(result.success).toBe(false);
      });
    });
  });
});
