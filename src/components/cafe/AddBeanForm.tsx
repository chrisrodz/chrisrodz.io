import { useState } from 'react';
import { addBean } from '@/stores/beansStore';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';
import { useTranslations, type Locale } from '@/lib/i18n';

interface AddBeanFormProps {
  onBeanAdded?: (beanId: string) => void;
  onCancel?: () => void;
  locale: Locale;
}

export default function AddBeanForm({ onBeanAdded, onCancel, locale }: AddBeanFormProps) {
  const { t } = useTranslations(locale);
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
      setError(err instanceof Error ? err.message : t('cafe.addBean.errorFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="inline-form">
      <header>{t('cafe.addBean.header')}</header>

      {error && (
        <div className="notice-box" data-variant="error">
          <p>{error}</p>
        </div>
      )}

      {/* Bean Name */}
      <label>
        {t('cafe.addBean.beanName')} *
        <input
          type="text"
          id="bean_name"
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          required
          maxLength={200}
          placeholder={t('cafe.addBean.beanNamePlaceholder')}
        />
      </label>

      {/* Roaster */}
      <label>
        {t('cafe.addBean.roaster')}
        <input
          type="text"
          id="roaster"
          value={roaster}
          onChange={(e) => setRoaster(e.target.value)}
          maxLength={200}
          placeholder={t('cafe.addBean.roasterPlaceholder')}
        />
      </label>

      {/* Roast Date */}
      <label>
        {t('cafe.addBean.roastDate')}
        <input
          type="date"
          id="roast_date"
          value={roastDate}
          onChange={(e) => setRoastDate(e.target.value)}
        />
      </label>

      {/* Notes */}
      <label>
        {t('cafe.addBean.notes')}
        <textarea
          id="bean_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder={t('cafe.addBean.notesPlaceholder')}
        />
      </label>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="secondary">
            {t('cafe.addBean.cancel')}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !beanName.trim()}
          data-variant="success"
          aria-busy={isSubmitting}
          style={!onCancel ? { gridColumn: '1 / -1' } : undefined}
        >
          {isSubmitting ? t('cafe.addBean.adding') : t('cafe.addBean.add')}
        </button>
      </div>
    </article>
  );
}
