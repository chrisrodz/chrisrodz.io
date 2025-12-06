import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { beansStore, lastAddedBeanIdStore } from '@/stores/beansStore';
import StarRating from './StarRating';
import AddBeanForm from './AddBeanForm';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';
import { BREW_METHODS } from '@/lib/schemas/cafe';
import dayjs from '@/lib/dayjs-config';
import { useTranslations } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

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
  locale: Locale;
}

const NEW_BEAN_VALUE = '__new_bean__';

// SessionStorage keys
const STORAGE_KEYS = {
  LAST_BREW_METHOD: 'cafe_last_brew_method',
  LAST_GRIND_SETTING: 'cafe_last_grind_setting',
  LAST_DOSE_GRAMS: 'cafe_last_dose_grams',
  LAST_YIELD_GRAMS: 'cafe_last_yield_grams',
  LAST_BEAN_ID: 'cafe_last_bean_id',
  DRAFT: 'cafe_draft',
} as const;

// Input constraints
const INPUT_CONSTRAINTS = {
  DOSE: { MIN: 1, MAX: 100 },
  YIELD: { MIN: 1, MAX: 200 },
  GRIND: { MIN: 1, MAX: 40 },
} as const;

// Time constants (in milliseconds)
const ONE_HOUR_MS = 60 * 60 * 1000;

// Grind scale thresholds
const GRIND_THRESHOLDS = {
  FINE: 15,
  MEDIUM: 25,
} as const;

// Safe sessionStorage helpers
function safeSetItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn('SessionStorage unavailable:', e);
  }
}

function safeGetItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn('SessionStorage unavailable:', e);
    return null;
  }
}

function safeRemoveItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.warn('SessionStorage unavailable:', e);
  }
}

export default function CoffeeLogForm({ activeBeans, smartDefaults, locale }: CoffeeLogFormProps) {
  // Use Nano Store for beans (will update when AddBeanForm adds a new bean)
  const beansFromStore = useStore(beansStore);
  const beans = beansFromStore.length > 0 ? beansFromStore : activeBeans;
  const lastAddedBeanId = useStore(lastAddedBeanIdStore);
  const { t } = useTranslations(locale);
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
  const [hasUserChanges, setHasUserChanges] = useState<boolean>(false);

  // Ref for auto-save interval
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      // Keep previous beanId in case user cancels
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

  // Handle cancel add bean
  const handleCancelAddBean = () => {
    setShowAddBeanForm(false);
    // beanId retains previous value
  };

  // Check for saved draft on mount
  useEffect(() => {
    const draftStr = safeGetItem(STORAGE_KEYS.DRAFT);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        // Check if draft is less than 1 hour old
        if (Date.now() - draft.timestamp < ONE_HOUR_MS) {
          setShowDraftRestore(true);
        } else {
          // Remove stale draft
          safeRemoveItem(STORAGE_KEYS.DRAFT);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Failed to parse draft:', message);
        safeRemoveItem(STORAGE_KEYS.DRAFT);
      }
    }
  }, []);

  // Mark form as dirty when user makes changes
  useEffect(() => {
    setHasUserChanges(true);
  }, [brewMethod, beanId, doseGrams, yieldGrams, grindSetting, rating, notes]);

  // Auto-save form state every 2 seconds
  useEffect(() => {
    // Don't auto-save if user hasn't made changes
    if (!hasUserChanges) {
      return;
    }

    autoSaveIntervalRef.current = setInterval(() => {
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
      safeSetItem(STORAGE_KEYS.DRAFT, JSON.stringify(formState));
    }, 2000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [hasUserChanges, brewMethod, beanId, doseGrams, yieldGrams, grindSetting, rating, notes]);

  // Restore draft function
  const restoreDraft = () => {
    const draftStr = safeGetItem(STORAGE_KEYS.DRAFT);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);

        // Validate bean exists in current beans list
        const validBeanId =
          draft.beanId && beans.find((b) => b.id === draft.beanId) ? draft.beanId : '';

        setBrewMethod(draft.brewMethod);
        setBeanId(validBeanId);
        setDoseGrams(draft.doseGrams);
        setYieldGrams(draft.yieldGrams);
        setGrindSetting(draft.grindSetting);
        setRating(draft.rating);
        setNotes(draft.notes);
        setShowDraftRestore(false);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Failed to restore draft:', message);
      }
    }
  };

  // Dismiss draft
  const dismissDraft = () => {
    safeRemoveItem(STORAGE_KEYS.DRAFT);
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

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If server redirected us (e.g., to /cafe page), follow the redirect
      if (response.redirected) {
        setSubmitStatus({
          type: 'success',
          message: t('cafe.form.redirecting'),
        });
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
        message: t('cafe.form.success'),
      });

      // Clear auto-save interval
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }

      // Clear draft on successful submission
      safeRemoveItem(STORAGE_KEYS.DRAFT);

      // Reset form but keep smart defaults
      setRating(0);
      setNotes('');
      setHasUserChanges(false);
    } catch (error) {
      let message = t('cafe.form.errorGeneric');

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = t('cafe.form.errorTimeout');
        } else {
          message = error.message;
        }
      } else if (!navigator.onLine) {
        message = t('cafe.form.errorOffline');
      }

      setSubmitStatus({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus({ type: null, message: '' });

    // Focus first brew method button for accessibility
    setTimeout(() => {
      const firstBrewMethodButton = document.querySelector('[role="radio"]');
      if (firstBrewMethodButton instanceof HTMLElement) {
        firstBrewMethodButton.focus();
      }
    }, 0);
  };

  return (
    <div className="form-container">
      {submitStatus.type === 'success' ? (
        <ins className="message-card" role="alert" aria-live="polite">
          <h2>{submitStatus.message}</h2>
          <button type="button" onClick={resetForm}>
            {t('cafe.form.logAnother')}
          </button>
        </ins>
      ) : (
        <form onSubmit={handleSubmit} className="space-y">
          {/* Draft Restore Notification */}
          {showDraftRestore && (
            <div className="notice-box" data-variant="info">
              <p>{t('cafe.form.draftFound')}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={restoreDraft}>
                  {t('cafe.form.restore')}
                </button>
                <button type="button" onClick={dismissDraft} className="secondary">
                  {t('cafe.form.discard')}
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
            <legend>{t('cafe.form.brewMethod')} *</legend>
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
            {t('cafe.form.coffeeBean')} *
            <select
              id="bean_id"
              value={showAddBeanForm ? NEW_BEAN_VALUE : beanId}
              onChange={handleBeanChange}
              required
            >
              <option value="">{t('cafe.form.selectBean')}</option>
              {beans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.bean_name}
                  {bean.roaster && ` (${bean.roaster})`}
                </option>
              ))}
              <option value={NEW_BEAN_VALUE}>{t('cafe.form.addNewBean')}</option>
            </select>
            {/* Inline Add Bean Form */}
            {showAddBeanForm && (
              <AddBeanForm
                onBeanAdded={handleBeanAdded}
                onCancel={handleCancelAddBean}
                locale={locale}
              />
            )}
          </label>

          {/* Dose */}
          <label>
            {t('cafe.form.dose')} *
            <div className="number-input-wrapper">
              <input
                type="number"
                inputMode="decimal"
                id="dose_grams"
                value={doseGrams}
                onChange={(e) => setDoseGrams(Number(e.target.value) || 0)}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < INPUT_CONSTRAINTS.DOSE.MIN) {
                    setDoseGrams(INPUT_CONSTRAINTS.DOSE.MIN);
                  }
                }}
                onFocus={(e) => e.target.select()}
                min={INPUT_CONSTRAINTS.DOSE.MIN}
                max={INPUT_CONSTRAINTS.DOSE.MAX}
                step="1"
                required
              />
              <div className="number-btn-group">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setDoseGrams(Math.max(INPUT_CONSTRAINTS.DOSE.MIN, doseGrams - 1))}
                  aria-label="Decrease dose"
                >
                  −
                </button>
                <button
                  type="button"
                  className="number-btn"
                  onClick={() => setDoseGrams(Math.min(INPUT_CONSTRAINTS.DOSE.MAX, doseGrams + 1))}
                  aria-label="Increase dose"
                >
                  +
                </button>
              </div>
            </div>
          </label>

          {/* Water/Yield */}
          <label>
            {brewMethod === 'Espresso' ? t('cafe.form.yieldEspresso') : t('cafe.form.yieldOther')}
            <div className="number-input-wrapper">
              <input
                type="number"
                inputMode="decimal"
                id="yield_grams"
                value={yieldGrams}
                onChange={(e) => setYieldGrams(Number(e.target.value) || 0)}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val > 0 && val < INPUT_CONSTRAINTS.YIELD.MIN) {
                    setYieldGrams(INPUT_CONSTRAINTS.YIELD.MIN);
                  }
                }}
                onFocus={(e) => e.target.select()}
                min={INPUT_CONSTRAINTS.YIELD.MIN}
                max={INPUT_CONSTRAINTS.YIELD.MAX}
                step="1"
                placeholder={
                  brewMethod === 'Espresso'
                    ? t('cafe.form.yieldPlaceholderEspresso')
                    : t('cafe.form.yieldPlaceholderOther')
                }
              />
              <div className="number-btn-group">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() =>
                    setYieldGrams(Math.max(INPUT_CONSTRAINTS.YIELD.MIN, yieldGrams - 1))
                  }
                  aria-label="Decrease yield"
                >
                  −
                </button>
                <button
                  type="button"
                  className="number-btn"
                  onClick={() =>
                    setYieldGrams(Math.min(INPUT_CONSTRAINTS.YIELD.MAX, yieldGrams + 1))
                  }
                  aria-label="Increase yield"
                >
                  +
                </button>
              </div>
            </div>
          </label>

          {/* Grind Setting */}
          <label>
            {t('cafe.form.grindSetting')} ({INPUT_CONSTRAINTS.GRIND.MIN}-
            {INPUT_CONSTRAINTS.GRIND.MAX}) *
            <div className="number-input-wrapper">
              <input
                type="number"
                inputMode="numeric"
                id="grind_setting"
                value={grindSetting}
                onChange={(e) => setGrindSetting(Number(e.target.value) || 0)}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < INPUT_CONSTRAINTS.GRIND.MIN) {
                    setGrindSetting(INPUT_CONSTRAINTS.GRIND.MIN);
                  }
                }}
                onFocus={(e) => e.target.select()}
                min={INPUT_CONSTRAINTS.GRIND.MIN}
                max={INPUT_CONSTRAINTS.GRIND.MAX}
                step="1"
                required
              />
              <div className="number-btn-group">
                <button
                  type="button"
                  className="number-btn"
                  onClick={() =>
                    setGrindSetting(Math.max(INPUT_CONSTRAINTS.GRIND.MIN, grindSetting - 1))
                  }
                  aria-label="Decrease grind setting"
                >
                  −
                </button>
                <button
                  type="button"
                  className="number-btn"
                  onClick={() =>
                    setGrindSetting(Math.min(INPUT_CONSTRAINTS.GRIND.MAX, grindSetting + 1))
                  }
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
              {grindSetting < GRIND_THRESHOLDS.FINE
                ? t('cafe.grind.fine')
                : grindSetting < GRIND_THRESHOLDS.MEDIUM
                  ? t('cafe.grind.medium')
                  : t('cafe.grind.coarse')}
            </small>
          </label>

          {/* Quality Rating */}
          <div>
            <label>{t('cafe.form.qualityRating')} *</label>
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
                {t('cafe.form.selectRating')}
              </p>
            )}
          </div>

          {/* Notes */}
          <label>
            {t('cafe.form.notes')}
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder={t('cafe.form.notesPlaceholder')}
            />
            <small style={{ color: 'var(--pico-muted-color)' }}>{notes.length} / 500</small>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !beanId}
            className="full-width"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? t('cafe.form.submitting') : t('cafe.form.submit')}
          </button>
        </form>
      )}
    </div>
  );
}
