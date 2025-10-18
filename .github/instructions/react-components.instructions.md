applyTo:

- "src/components/\*_/_.tsx"
- "src/components/\*_/_.jsx"

---

# React Component Instructions

## Component Structure

- Use TypeScript for all React components
- Export default the main component
- Use proper TypeScript interfaces for props

## State Management

- Use nanostores from `@nanostores/react` for shared state
- Import stores from `src/stores/`
- Keep component state local when possible

## Styling

- **ALWAYS** use PicoCSS classes and variables
- **NEVER** hardcode colors or styles
- Use CSS-in-JS sparingly, prefer CSS classes

## Form Handling

- **ALWAYS** validate inputs with Zod schemas from `src/lib/schemas/`
- Use proper form validation patterns
- Handle loading and error states

## Example Pattern

```tsx
import { useStore } from '@nanostores/react';
import { beansStore } from '@/stores/beansStore';
import { coffeeSchema } from '@/lib/schemas/cafe';
import type { z } from 'zod';

interface CoffeeFormProps {
  onSubmit: (data: z.infer<typeof coffeeSchema>) => void;
}

export default function CoffeeForm({ onSubmit }: CoffeeFormProps) {
  const beans = useStore(beansStore);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = coffeeSchema.safeParse(Object.fromEntries(formData));

    if (result.success) {
      onSubmit(result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Use PicoCSS classes */}
      <label>
        Coffee Beans
        <select name="bean_id" required>
          {beans.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```
