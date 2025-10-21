import { useState } from 'react';
import { addBean } from '@/stores/beansStore';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';

interface AddBeanFormProps {
  onBeanAdded?: (beanId: string) => void;
}

export default function AddBeanForm({ onBeanAdded }: AddBeanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [beanName, setBeanName] = useState('');
  const [roaster, setRoaster] = useState('');
  const [roastDate, setRoastDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('action', 'add_bean');
      formData.append('bean_name', beanName.trim());
      if (roaster.trim()) formData.append('roaster', roaster.trim());
      if (roastDate) formData.append('roast_date', roastDate);
      if (notes.trim()) formData.append('notes', notes.trim());

      const response = await fetch('/api/coffee.json', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      // Parse JSON response
      let jsonData;
      try {
        jsonData = await response.json();
      } catch {
        throw new Error('Error de red: No se pudo procesar la respuesta del servidor');
      }

      // Check for errors in the response
      if (!response.ok || 'error' in jsonData) {
        const errorMessage = jsonData.error || 'Error desconocido al agregar el grano';

        // Categorize errors for better user feedback
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        } else if (response.status === 400 && jsonData.errorType === 'validation') {
          const fieldName = jsonData.field || 'un campo';
          throw new Error(`Error de validación en ${fieldName}: ${errorMessage}`);
        } else if (response.status >= 500) {
          throw new Error('Error del servidor. Por favor, intenta de nuevo más tarde.');
        } else {
          throw new Error(errorMessage);
        }
      }

      if (jsonData.data) {
        // Add to store
        addBean(jsonData.data as CoffeeBeanRow);

        // Notify parent component
        if (onBeanAdded) {
          onBeanAdded(jsonData.data.id);
        }

        // Reset form
        setBeanName('');
        setRoaster('');
        setRoastDate('');
        setNotes('');
      }
    } catch (err) {
      console.error('[AddBeanForm] Error:', err);

      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Error de red: No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setError(err instanceof Error ? err.message : 'No se pudo agregar el grano');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="inline-form">
      <header>Add New Bean</header>

      {error && (
        <div className="notice-box" data-variant="error">
          <p>{error}</p>
        </div>
      )}

      {/* Bean Name */}
      <label>
        Bean Name *
        <input
          type="text"
          id="bean_name"
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g., Ethiopia Yirgacheffe"
        />
      </label>

      {/* Roaster */}
      <label>
        Roaster
        <input
          type="text"
          id="roaster"
          value={roaster}
          onChange={(e) => setRoaster(e.target.value)}
          maxLength={200}
          placeholder="e.g., Blue Bottle, Stumptown"
        />
      </label>

      {/* Roast Date */}
      <label>
        Roast Date
        <input
          type="date"
          id="roast_date"
          value={roastDate}
          onChange={(e) => setRoastDate(e.target.value)}
        />
      </label>

      {/* Notes */}
      <label>
        Notes
        <textarea
          id="bean_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Tasting notes, origin details, etc."
        />
      </label>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !beanName.trim()}
        className="full-width"
        data-variant="success"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Adding Bean...' : 'Add Bean'}
      </button>
    </article>
  );
}
