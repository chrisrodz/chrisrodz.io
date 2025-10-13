import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { beansStore, lastAddedBeanIdStore } from '@/stores/beansStore';
import StarRating from './StarRating';
import AddBeanForm from './AddBeanForm';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';
import { BREW_METHODS } from '@/lib/schemas/cafe';

interface SmartDefaults {
  brew_method: (typeof BREW_METHODS)[number] | null;
  grind_setting: number | null;
  dose_grams: number | null;
  yield_grams: number | null;
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
    smartDefaults.brew_method || 'Espresso',
  );
  const [beanId, setBeanId] = useState<string>('');
  const [showAddBeanForm, setShowAddBeanForm] = useState<boolean>(false);
  const [doseGrams, setDoseGrams] = useState<number>(smartDefaults.dose_grams || 18);
  const [yieldGrams, setYieldGrams] = useState<number>(smartDefaults.yield_grams || 0);
  const [grindSetting, setGrindSetting] = useState<number>(smartDefaults.grind_setting || 10);
  const [rating, setRating] = useState<number>(0);
  const [brewTime, setBrewTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [notesExpanded, setNotesExpanded] = useState<boolean>(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Initialize brew time to current time
  useEffect(() => {
    const now = new Date();
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const formatted = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setBrewTime(formatted);
  }, []);

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
  }, [smartDefaults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Convert datetime-local to ISO string
      const brewTimeISO = new Date(brewTime).toISOString();

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
        message: 'Coffee logged successfully!',
      });

      // Reset form but keep smart defaults
      setRating(0);
      setNotes('');
      setNotesExpanded(false);
      // Update brew time to now
      const now = new Date();
      const formatted = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setBrewTime(formatted);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus({ type: null, message: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {submitStatus.type === 'success' ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
            {submitStatus.message}
          </h2>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            style={{ minHeight: '44px' }}
          >
            Log Another Coffee
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus.type === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 error-message">
              <p className="text-red-900 dark:text-red-100">{submitStatus.message}</p>
            </div>
          )}

          {/* Brew Method */}
          <fieldset>
            <legend className="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
              Brew Method *
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
              {BREW_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  role="radio"
                  aria-checked={brewMethod === method}
                  onClick={() => setBrewMethod(method)}
                  className={`p-4 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    brewMethod === method
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-blue-400'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  {method}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Bean Selection */}
          <div>
            <label
              htmlFor="bean_id"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Coffee Bean
            </label>
            <select
              id="bean_id"
              value={showAddBeanForm ? NEW_BEAN_VALUE : beanId}
              onChange={handleBeanChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ minHeight: '48px' }}
            >
              <option value="">No bean selected</option>
              {beans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.bean_name}
                  {bean.roaster && ` (${bean.roaster})`}
                </option>
              ))}
              <option value={NEW_BEAN_VALUE} className="font-medium text-blue-600 dark:text-blue-400">
                + Add New Bean...
              </option>
            </select>

            {/* Inline Add Bean Form */}
            {showAddBeanForm && (
              <div className="mt-3">
                <AddBeanForm onBeanAdded={handleBeanAdded} />
              </div>
            )}
          </div>

          {/* Dose and Water/Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dose_grams"
                className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
              >
                Coffee Dose (grams) *
              </label>
              <input
                type="number"
                inputMode="decimal"
                id="dose_grams"
                value={doseGrams}
                onChange={(e) => setDoseGrams(Number(e.target.value))}
                min="1"
                max="100"
                step="1"
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <label
                htmlFor="yield_grams"
                className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
              >
                {brewMethod === 'Espresso' ? 'Yield (grams)' : 'Water (grams)'}
              </label>
              <input
                type="number"
                inputMode="decimal"
                id="yield_grams"
                value={yieldGrams}
                onChange={(e) => setYieldGrams(Number(e.target.value))}
                min="1"
                max="200"
                step="1"
                placeholder={brewMethod === 'Espresso' ? 'Output weight' : 'Water added'}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Grind Setting */}
          <div>
            <label
              htmlFor="grind_setting"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Grind Setting (1-40) *
            </label>
            <input
              type="number"
              inputMode="numeric"
              id="grind_setting"
              value={grindSetting}
              onChange={(e) => setGrindSetting(Number(e.target.value))}
              min="1"
              max="40"
              step="1"
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
              Quality Rating *
            </label>
            <StarRating value={rating} onChange={setRating} />
            {rating === 0 && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                Please select a rating
              </p>
            )}
          </div>

          {/* Brew Time */}
          <div>
            <label
              htmlFor="brew_time"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Brew Time *
            </label>
            <input
              type="datetime-local"
              id="brew_time"
              value={brewTime}
              onChange={(e) => setBrewTime(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Notes (Collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setNotesExpanded(!notesExpanded)}
              aria-expanded={notesExpanded}
              aria-controls="notes-section"
              className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-2"
              style={{ minHeight: '48px' }}
            >
              <span className="transition-transform" style={{ transform: notesExpanded ? 'rotate(90deg)' : 'none' }}>
                ▶
              </span>
              Notes (optional)
            </button>
            {notesExpanded && (
              <textarea
                id="notes-section"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Add any notes about this brew..."
                aria-label="Brew notes"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ minHeight: '48px' }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Coffee'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
