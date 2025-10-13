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
      }
    } catch (err) {
      console.error('[AddBeanForm] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add bean');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Add New Bean</span>
      </div>

      <div className="space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          {/* Bean Name */}
          <div>
            <label
              htmlFor="bean_name"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Bean Name *
            </label>
            <input
              type="text"
              id="bean_name"
              value={beanName}
              onChange={(e) => setBeanName(e.target.value)}
              required
              maxLength={200}
              placeholder="e.g., Ethiopia Yirgacheffe"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Roaster */}
          <div>
            <label
              htmlFor="roaster"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Roaster
            </label>
            <input
              type="text"
              id="roaster"
              value={roaster}
              onChange={(e) => setRoaster(e.target.value)}
              maxLength={200}
              placeholder="e.g., Blue Bottle, Stumptown"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Roast Date */}
          <div>
            <label
              htmlFor="roast_date"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Roast Date
            </label>
            <input
              type="date"
              id="roast_date"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="bean_notes"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Notes
            </label>
            <textarea
              id="bean_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Tasting notes, origin details, etc."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !beanName.trim()}
            className="w-full p-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            style={{ minHeight: '48px' }}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Adding Bean...' : 'Add Bean'}
          </button>
        </div>
    </div>
  );
}
