import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { beansStore, lastAddedBeanIdStore } from '@/stores/beansStore';
import StarRating from './StarRating';
import AddBeanForm from './AddBeanForm';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';
import { BREW_METHODS } from '@/lib/schemas/cafe';
import dayjs from '@/lib/dayjs-config';

interface SmartDefaults {
  brew_method: (typeof BREW_METHODS)[number] | null;
  grind_setting: number | null;
  dose_grams: number | null;
  yield_grams: number | null;
  bean_id: string | null;
}

interface CoffeeLogFormProps {
  activeBeans: CoffeeBeanRow[];
  smartDefaults: SmartDefaults;
}

const NEW_BEAN_VALUE = '__new_bean__';

export default function CoffeeLogForm({ activeBeans, smartDefaults }: CoffeeLogFormProps) {
  // Use Nano Store for beans (will update when AddBeanForm adds a new bean)
  const beansFromStore = useStore(beansStore);
  const beans = beansFromStore.length > 0 ? beansFromStore : activeBeans;
  const lastAddedBeanId = useStore(lastAddedBeanIdStore);
  // Form state
  const [brewMethod, setBrewMethod] = useState<(typeof BREW_METHODS)[number]>(
    smartDefaults.brew_method || 'Espresso'
  );
  const [beanId, setBeanId] = useState<string>(smartDefaults.bean_id || '');
  const [showAddBeanForm, setShowAddBeanForm] = useState<boolean>(false);
  const [doseGrams, setDoseGrams] = useState<number>(smartDefaults.dose_grams || 18);
  const [yieldGrams, setYieldGrams] = useState<number>(smartDefaults.yield_grams || 0);
  const [grindSetting, setGrindSetting] = useState<number>(smartDefaults.grind_setting || 10);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showDraftRestore, setShowDraftRestore] = useState<boolean>(false);

  // Auto-select newly added bean
  useEffect(() => {
    if (lastAddedBeanId) {
      setBeanId(lastAddedBeanId);
      setShowAddBeanForm(false);
    }
  }, [lastAddedBeanId]);

  // Handle bean selection change
  const handleBeanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === NEW_BEAN_VALUE) {
      setShowAddBeanForm(true);
      setBeanId('');
    } else {
      setShowAddBeanForm(false);
      setBeanId(value);
    }
  };

  // Handle successful bean addition
  const handleBeanAdded = (newBeanId: string) => {
    setBeanId(newBeanId);
    setShowAddBeanForm(false);
  };

  // Cache smart defaults in sessionStorage for fallback
  useEffect(() => {
    if (smartDefaults.brew_method) {
      sessionStorage.setItem('cafe_last_brew_method', smartDefaults.brew_method);
    }
    if (smartDefaults.grind_setting) {
      sessionStorage.setItem('cafe_last_grind_setting', smartDefaults.grind_setting.toString());
    }
    if (smartDefaults.dose_grams) {
      sessionStorage.setItem('cafe_last_dose_grams', smartDefaults.dose_grams.toString());
    }
    if (smartDefaults.yield_grams) {
      sessionStorage.setItem('cafe_last_yield_grams', smartDefaults.yield_grams.toString());
    }
    if (smartDefaults.bean_id) {
      sessionStorage.setItem('cafe_last_bean_id', smartDefaults.bean_id);
    }
  }, [smartDefaults]);

  // Check for saved draft on mount
  useEffect(() => {
    const draftStr = sessionStorage.getItem('cafe_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        // Check if draft is less than 1 hour old
        if (Date.now() - draft.timestamp < 60 * 60 * 1000) {
          setShowDraftRestore(true);
        } else {
          // Remove stale draft
          sessionStorage.removeItem('cafe_draft');
        }
      } catch (e) {
        console.error('Failed to parse draft', e);
        sessionStorage.removeItem('cafe_draft');
      }
    }
  }, []);

  // Auto-save form state every 2 seconds
  useEffect(() => {
    // Don't auto-save if form is empty or just initialized
    if (rating === 0 && notes === '' && !beanId) {
      return;
    }

    const interval = setInterval(() => {
      const formState = {
        brewMethod,
        beanId,
        doseGrams,
        yieldGrams,
        grindSetting,
        rating,
        notes,
        timestamp: Date.now(),
      };
      sessionStorage.setItem('cafe_draft', JSON.stringify(formState));
    }, 2000);

    return () => clearInterval(interval);
  }, [brewMethod, beanId, doseGrams, yieldGrams, grindSetting, rating, notes]);

  // Restore draft function
  const restoreDraft = () => {
    const draftStr = sessionStorage.getItem('cafe_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setBrewMethod(draft.brewMethod);
        setBeanId(draft.beanId);
        setDoseGrams(draft.doseGrams);
        setYieldGrams(draft.yieldGrams);
        setGrindSetting(draft.grindSetting);
        setRating(draft.rating);
        setNotes(draft.notes);
        setShowDraftRestore(false);
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }
  };

  // Dismiss draft
  const dismissDraft = () => {
    sessionStorage.removeItem('cafe_draft');
    setShowDraftRestore(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Use current time as brew time
      const brewTimeISO = dayjs().toISOString();

      const formData = new FormData();
      formData.append('action', 'log_coffee');
      formData.append('brew_method', brewMethod);
      if (beanId) formData.append('bean_id', beanId);
      formData.append('dose_grams', doseGrams.toString());
      if (yieldGrams) {
        formData.append('yield_grams', yieldGrams.toString());
      }
      formData.append('grind_setting', grindSetting.toString());
      formData.append('quality_rating', rating.toString());
      formData.append('brew_time', brewTimeISO);
      if (notes.trim()) formData.append('notes', notes.trim());

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData,
      });

      // If server redirected us (e.g., to /cafe page), follow the redirect
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const html = await response.text();

      // Check if there's an error in the response
      if (html.includes('error-message') || !response.ok) {
        // Extract error message from HTML if possible
        const errorMatch = html.match(/<div[^>]*error-message[^>]*>(.*?)<\/div>/s);
        const errorMessage = errorMatch
          ? errorMatch[1].replace(/<[^>]*>/g, '').trim()
          : 'Failed to save coffee log';
        throw new Error(errorMessage);
      }

      setSubmitStatus({
        type: 'success',
        message: '¡Café registrado exitosamente!',
      });

      // Clear draft on successful submission
      sessionStorage.removeItem('cafe_draft');

      // Reset form but keep smart defaults
      setRating(0);
      setNotes('');
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ocurrió un error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus({ type: null, message: '' });
  };

  return (
    <div className="form-container">
      {submitStatus.type === 'success' ? (
        <ins className="message-card">
          <h2>{submitStatus.message}</h2>
          <button type="button" onClick={resetForm}>
            Log Another Coffee
          </button>
        </ins>
      ) : (
        <form onSubmit={handleSubmit} className="space-y">
          {/* Draft Restore Notification */}
          {showDraftRestore && (
            <div className="notice-box" data-variant="info">
              <p>Se encontró un borrador guardado. ¿Quieres restaurarlo?</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={restoreDraft}>
                  Restaurar
                </button>
                <button type="button" onClick={dismissDraft} className="secondary">
                  Descartar
                </button>
              </div>
            </div>
          )}

          {submitStatus.type === 'error' && (
            <div className="notice-box error-message" data-variant="error">
              <p>{submitStatus.message}</p>
            </div>
          )}

          {/* Brew Method */}
          <fieldset>
            <legend>Método de Preparación *</legend>
            <div className="grid-3" role="radiogroup">
              {BREW_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  role="radio"
                  aria-checked={brewMethod === method}
                  onClick={() => setBrewMethod(method)}
                  className="radio-card"
                  data-active={brewMethod === method}
                >
                  {method}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Bean Selection */}
          <label>
            Grano de Café *
            <select
              id="bean_id"
              value={showAddBeanForm ? NEW_BEAN_VALUE : beanId}
              onChange={handleBeanChange}
              required
            >
              <option value="">Selecciona un grano...</option>
              {beans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.bean_name}
                  {bean.roaster && ` (${bean.roaster})`}
                </option>
              ))}
              <option value={NEW_BEAN_VALUE}>+ Agregar Nuevo Grano...</option>
            </select>
            {/* Inline Add Bean Form */}
            {showAddBeanForm && <AddBeanForm onBeanAdded={handleBeanAdded} />}
          </label>

          {/* Dose */}
          <label>
            Dosis de Café (gramos) *
            <div className="number-input-wrapper">
              <input
                type="number"
                inputMode="decimal"
                id="dose_grams"
                value={doseGrams}
                onChange={(e) => setDoseGrams(Number(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                min="1"
                max="100"
                step="1"
                required
              />
              <div className="number-btn-group">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setDoseGrams(Math.max(1, doseGrams - 1))}
                  aria-label="Decrease dose"
                >
                  −
                </button>
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setDoseGrams(Math.min(100, doseGrams + 1))}
                  aria-label="Increase dose"
                >
                  +
                </button>
              </div>
            </div>
          </label>

          {/* Water/Yield */}
          <label>
            {brewMethod === 'Espresso' ? 'Rendimiento (gramos)' : 'Agua (gramos)'}
            <div className="number-input-wrapper">
              <input
                type="number"
                inputMode="decimal"
                id="yield_grams"
                value={yieldGrams}
                onChange={(e) => setYieldGrams(Number(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                min="1"
                max="200"
                step="1"
                placeholder={brewMethod === 'Espresso' ? 'Peso de salida' : 'Agua agregada'}
              />
              <div className="number-btn-group">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setYieldGrams(Math.max(0, yieldGrams - 1))}
                  aria-label="Decrease yield"
                >
                  −
                </button>
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setYieldGrams(Math.min(200, yieldGrams + 1))}
                  aria-label="Increase yield"
                >
                  +
                </button>
              </div>
            </div>
          </label>

          {/* Grind Setting */}
          <label>
            Molienda (1-40) *
            <div className="number-input-wrapper">
              <input
                type="number"
                inputMode="numeric"
                id="grind_setting"
                value={grindSetting}
                onChange={(e) => setGrindSetting(Number(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                min="1"
                max="40"
                step="1"
                required
              />
              <div className="number-btn-group">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setGrindSetting(Math.max(1, grindSetting - 1))}
                  aria-label="Decrease grind setting"
                >
                  −
                </button>
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setGrindSetting(Math.min(40, grindSetting + 1))}
                  aria-label="Increase grind setting"
                >
                  +
                </button>
              </div>
            </div>
            <small
              style={{
                color: 'var(--pico-muted-color)',
                display: 'block',
                marginTop: '0.25rem',
              }}
            >
              {grindSetting < 15
                ? 'Molienda fina'
                : grindSetting < 25
                  ? 'Molienda media'
                  : 'Molienda gruesa'}
            </small>
          </label>

          {/* Quality Rating */}
          <div>
            <label>Calificación de Calidad *</label>
            <StarRating value={rating} onChange={setRating} />
            {rating === 0 && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--pico-del-color)',
                  marginTop: '0.25rem',
                }}
                role="alert"
              >
                Por favor selecciona una calificación
              </p>
            )}
          </div>

          {/* Notes */}
          <label>
            Notas (opcional)
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Agrega cualquier nota sobre esta preparación..."
            />
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !beanId}
            className="full-width"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Café'}
          </button>
        </form>
      )}
    </div>
  );
}
