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
  const [url, setUrl] = useState('');

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
      if (url.trim()) formData.append('url', url.trim());

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add bean');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.bean) {
        // Add to store
        addBean(data.bean as CoffeeBeanRow);

        // Notify parent component
        if (onBeanAdded) {
          onBeanAdded(data.bean.id);
        }

        // Reset form
        setBeanName('');
        setRoaster('');
        setRoastDate('');
        setNotes('');
        setUrl('');
      }
    } catch (err) {
      console.error('[AddBeanForm] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add bean');
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

      {/* URL */}
      <label>
        Product URL
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/coffee"
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
