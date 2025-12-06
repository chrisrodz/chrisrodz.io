import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoffeeLogForm from './CoffeeLogForm';
import { beansStore, lastAddedBeanIdStore } from '@/stores/beansStore';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location for redirects
const mockLocationHref = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: mockLocationHref,
    pathname: '/cafe',
  },
  writable: true,
});

describe('CoffeeLogForm Component', () => {
  const mockBeans: CoffeeBeanRow[] = [
    {
      id: 'bean-1',
      created_at: '2025-01-01T00:00:00Z',
      bean_name: 'Ethiopia Yirgacheffe',
      roaster: 'Blue Bottle',
      origin: 'Ethiopia',
      roast_date: '2025-01-01',
      notes: 'Floral notes',
      is_active: true,
    },
    {
      id: 'bean-2',
      created_at: '2025-01-02T00:00:00Z',
      bean_name: 'Colombia Supremo',
      roaster: 'Stumptown',
      origin: 'Colombia',
      roast_date: '2025-01-02',
      notes: 'Chocolate notes',
      is_active: true,
    },
  ];

  const mockSmartDefaults = {
    brew_method: 'Espresso' as const,
    grind_setting: 10,
    dose_grams: 18,
    yield_grams: 36,
    bean_id: 'bean-1',
  };

  beforeEach(() => {
    // Clear all stores
    beansStore.set([]);
    lastAddedBeanIdStore.set(null);

    // Clear sessionStorage
    sessionStorage.clear();

    // Reset mocks
    mockFetch.mockReset();
    mockLocationHref.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should disable submit button when rating is 0', () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when no bean is selected', () => {
      const noDefaultsSelected = { ...mockSmartDefaults, bean_id: null };
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={noDefaultsSelected} locale="es" />
      );

      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when rating is set and bean is selected', async () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show validation message when rating is 0', () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      expect(screen.getByText('Por favor selecciona una calificación')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should change brew method when button is clicked', () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const aeroPressButton = screen.getByRole('radio', { name: 'AeroPress' });
      fireEvent.click(aeroPressButton);

      expect(aeroPressButton).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'Espresso' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('should decrement dose when - button is clicked', () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const decreaseButton = screen.getByLabelText('Decrease dose');
      fireEvent.click(decreaseButton);

      const doseInput = screen.getByRole('spinbutton', { name: /dosis/i }) as HTMLInputElement;
      expect(doseInput).toHaveValue(17);
    });
  });

  describe('Add Bean Form Integration', () => {
    it('should show AddBeanForm when "Add New Bean" is selected', async () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const beanSelect = screen.getByLabelText('Grano de Café *');
      await userEvent.selectOptions(beanSelect, '__new_bean__');

      // AddBeanForm should be visible
      expect(screen.getByText('Add New Bean')).toBeInTheDocument();
      expect(screen.getByLabelText('Bean Name *')).toBeInTheDocument();
    });

    it('should auto-select newly added bean from store', async () => {
      const { rerender } = render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const newBean: CoffeeBeanRow = {
        id: 'new-bean-id',
        created_at: '2025-01-10T00:00:00Z',
        bean_name: 'New Test Bean',
        roaster: 'Test Roaster',
        origin: null,
        roast_date: null,
        notes: null,
        is_active: true,
      };

      // Simulate adding a bean via store using act
      await waitFor(() => {
        beansStore.set([newBean, ...mockBeans]);
        lastAddedBeanIdStore.set(newBean.id);
      });

      // Force a rerender to trigger the useEffect
      rerender(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      await waitFor(() => {
        const beanSelect = screen.getByLabelText('Grano de Café *') as HTMLSelectElement;
        expect(beanSelect.value).toBe('new-bean-id');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data on successful submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        redirected: false,
        text: async () => '<div>Success</div>',
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      // Add notes
      const notesTextarea = screen.getByPlaceholderText(
        'Agrega cualquier nota sobre esta preparación...'
      );
      await userEvent.type(notesTextarea, 'Excellent coffee!');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/cafe',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      // Verify FormData contents
      const callArgs = mockFetch.mock.calls[0];
      const formData = callArgs[1].body as FormData;

      expect(formData.get('action')).toBe('log_coffee');
      expect(formData.get('brew_method')).toBe('Espresso');
      expect(formData.get('bean_id')).toBe('bean-1');
      expect(formData.get('dose_grams')).toBe('18');
      expect(formData.get('yield_grams')).toBe('36');
      expect(formData.get('grind_setting')).toBe('10');
      expect(formData.get('quality_rating')).toBe('4');
      expect(formData.get('notes')).toBe('Excellent coffee!');
      expect(formData.get('brew_time')).toBeTruthy(); // ISO string
    });

    it('should show success message after successful submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        redirected: false,
        text: async () => '<div>Success</div>',
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('¡Café registrado exitosamente!')).toBeInTheDocument();
      });
    });

    it('should show error message on submission failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        redirected: false,
        text: async () => '<div class="error-message">Database error</div>',
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });
    });

    it('should follow redirect when server redirects', async () => {
      // Mock window.location.href setter
      delete (window as any).location;
      (window as any).location = { href: '', pathname: '/cafe' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        redirected: true,
        url: '/cafe/success',
        text: async () => '<html></html>',
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toBe('/cafe/success');
      });
    });

    it('should disable submit button during submission', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  redirected: false,
                  text: async () => '<div>Success</div>',
                }),
              100
            )
          )
      );

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Registrando...');
      });
    });

    it('should reset form but keep defaults after successful submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        redirected: false,
        text: async () => '<div>Success</div>',
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating and notes
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      const notesTextarea = screen.getByPlaceholderText(
        'Agrega cualquier nota sobre esta preparación...'
      );
      await userEvent.type(notesTextarea, 'Test notes');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('¡Café registrado exitosamente!')).toBeInTheDocument();
      });

      // Click "Log Another Coffee"
      const logAnotherButton = screen.getByRole('button', { name: 'Log Another Coffee' });
      fireEvent.click(logAnotherButton);

      // Form should be reset
      await waitFor(() => {
        const notesAfter = screen.getByPlaceholderText(
          'Agrega cualquier nota sobre esta preparación...'
        ) as HTMLTextAreaElement;
        expect(notesAfter.value).toBe('');
      });

      // But defaults should be kept
      const doseInput = screen.getByRole('spinbutton', { name: /dosis/i }) as HTMLInputElement;
      expect(doseInput).toHaveValue(18);
    });
  });

  describe('Draft Save/Restore Functionality', () => {
    it('should show draft restore notification when draft exists and is recent', () => {
      const draftData = {
        brewMethod: 'AeroPress',
        beanId: 'bean-2',
        doseGrams: 20,
        yieldGrams: 250,
        grindSetting: 25,
        rating: 5,
        notes: 'Restored draft',
        timestamp: Date.now() - 1000, // 1 second ago
      };

      sessionStorage.setItem('cafe_draft', JSON.stringify(draftData));

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      expect(
        screen.getByText('Se encontró un borrador guardado. ¿Quieres restaurarlo?')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Restaurar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Descartar' })).toBeInTheDocument();
    });

    it('should not show draft restore notification when draft is stale (> 1 hour)', () => {
      const draftData = {
        brewMethod: 'AeroPress',
        beanId: 'bean-2',
        doseGrams: 20,
        yieldGrams: 250,
        grindSetting: 25,
        rating: 5,
        notes: 'Old draft',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      };

      sessionStorage.setItem('cafe_draft', JSON.stringify(draftData));

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      expect(
        screen.queryByText('Se encontró un borrador guardado. ¿Quieres restaurarlo?')
      ).not.toBeInTheDocument();
    });

    it('should restore draft when "Restaurar" is clicked', () => {
      const draftData = {
        brewMethod: 'AeroPress',
        beanId: 'bean-2',
        doseGrams: 20,
        yieldGrams: 250,
        grindSetting: 25,
        rating: 5,
        notes: 'Restored notes',
        timestamp: Date.now(),
      };

      sessionStorage.setItem('cafe_draft', JSON.stringify(draftData));

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const restoreButton = screen.getByRole('button', { name: 'Restaurar' });
      fireEvent.click(restoreButton);

      // Check that form values are restored immediately (synchronous state update)
      const aeroPressButton = screen.getByRole('radio', { name: 'AeroPress' });
      expect(aeroPressButton).toHaveAttribute('aria-checked', 'true');

      const beanSelect = screen.getByLabelText('Grano de Café *') as HTMLSelectElement;
      expect(beanSelect.value).toBe('bean-2');

      const doseInput = screen.getByRole('spinbutton', { name: /dosis/i }) as HTMLInputElement;
      expect(doseInput).toHaveValue(20);

      const notesTextarea = screen.getByPlaceholderText(
        'Agrega cualquier nota sobre esta preparación...'
      ) as HTMLTextAreaElement;
      expect(notesTextarea.value).toBe('Restored notes');
    });

    it('should dismiss draft when "Descartar" is clicked', () => {
      const draftData = {
        brewMethod: 'AeroPress',
        beanId: 'bean-2',
        doseGrams: 20,
        yieldGrams: 250,
        grindSetting: 25,
        rating: 5,
        notes: 'Draft to discard',
        timestamp: Date.now(),
      };

      sessionStorage.setItem('cafe_draft', JSON.stringify(draftData));

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const dismissButton = screen.getByRole('button', { name: 'Descartar' });
      fireEvent.click(dismissButton);

      expect(sessionStorage.getItem('cafe_draft')).toBeNull();
      expect(
        screen.queryByText('Se encontró un borrador guardado. ¿Quieres restaurarlo?')
      ).not.toBeInTheDocument();
    });

    it('should clear draft from sessionStorage on successful submission', async () => {
      // Set up fetch to respond immediately
      mockFetch.mockResolvedValue({
        ok: true,
        redirected: false,
        text: async () => '<div>Success</div>',
      });

      const draftData = {
        brewMethod: 'Espresso',
        beanId: 'bean-1',
        doseGrams: 18,
        yieldGrams: 36,
        grindSetting: 10,
        rating: 4,
        notes: 'Draft notes',
        timestamp: Date.now(),
      };

      // Verify draft is in storage
      sessionStorage.setItem('cafe_draft', JSON.stringify(draftData));
      expect(sessionStorage.getItem('cafe_draft')).not.toBeNull();

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating to enable submit
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      // Wait for the success message to appear
      await waitFor(() => {
        expect(screen.getByText('¡Café registrado exitosamente!')).toBeInTheDocument();
      });

      // Draft should be cleared
      expect(sessionStorage.getItem('cafe_draft')).toBeNull();
    });
  });

  describe('Bug Fixes - Input Validation', () => {
    it('should enforce minimum value on dose input blur', async () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const doseInput = screen.getByRole('spinbutton', { name: /dosis/i }) as HTMLInputElement;

      // Try to set invalid value
      fireEvent.change(doseInput, { target: { value: '0' } });
      expect(doseInput.value).toBe('0');

      // Blur should enforce minimum
      fireEvent.blur(doseInput);

      await waitFor(() => {
        expect(doseInput.value).toBe('1');
      });
    });

    it('should not allow yield decrement below minimum', () => {
      render(
        <CoffeeLogForm
          activeBeans={mockBeans}
          smartDefaults={{ ...mockSmartDefaults, yield_grams: 2 }}
          locale="es"
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease yield');
      const yieldInput = screen.getByPlaceholderText(/peso de salida/i) as HTMLInputElement;

      // Decrement once (from 2 to 1)
      fireEvent.click(decreaseButton);
      expect(yieldInput.value).toBe('1');

      // Try to decrement again (should stay at 1)
      fireEvent.click(decreaseButton);
      expect(yieldInput.value).toBe('1');
    });

    it('should enforce minimum value on grind input blur', async () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const grindInput = screen.getByRole('spinbutton', { name: /molienda/i }) as HTMLInputElement;

      // Try to set invalid value
      fireEvent.change(grindInput, { target: { value: '0' } });
      expect(grindInput.value).toBe('0');

      // Blur should enforce minimum
      fireEvent.blur(grindInput);

      await waitFor(() => {
        expect(grindInput.value).toBe('1');
      });
    });
  });

  describe('Bug Fixes - SessionStorage Safety', () => {
    it('should handle sessionStorage unavailable gracefully', () => {
      // Mock sessionStorage to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not crash
      expect(() => {
        render(
          <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
        );
      }).not.toThrow();

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Bug Fixes - Network Error Handling', () => {
    it('should show timeout error message', async () => {
      // Mock fetch to timeout
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Timeout');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      // Set rating and submit
      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/tardó demasiado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Bug Fixes - Draft Validation', () => {
    it('should validate bean exists when restoring draft', () => {
      const draftData = {
        brewMethod: 'AeroPress',
        beanId: 'non-existent-bean',
        doseGrams: 20,
        yieldGrams: 250,
        grindSetting: 25,
        rating: 5,
        notes: 'Draft with invalid bean',
        timestamp: Date.now(),
      };

      sessionStorage.setItem('cafe_draft', JSON.stringify(draftData));

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const restoreButton = screen.getByRole('button', { name: 'Restaurar' });
      fireEvent.click(restoreButton);

      // Bean should be cleared because it doesn't exist
      const beanSelect = screen.getByLabelText('Grano de Café *') as HTMLSelectElement;
      expect(beanSelect.value).toBe('');
    });
  });

  describe('Bug Fixes - Accessibility', () => {
    it('should have ARIA live region on success message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        redirected: false,
        text: async () => '<div>Success</div>',
      });

      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      const fourthStar = screen.getByLabelText('Rate 4 out of 5');
      fireEvent.click(fourthStar);

      const submitButton = screen.getByRole('button', { name: 'Registrar Café' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const successMessage = screen.getByText('¡Café registrado exitosamente!');
        const container = successMessage.closest('[role="alert"]');
        expect(container).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should show character counter for notes', () => {
      render(
        <CoffeeLogForm activeBeans={mockBeans} smartDefaults={mockSmartDefaults} locale="es" />
      );

      expect(screen.getByText('0 / 500')).toBeInTheDocument();

      const notesTextarea = screen.getByPlaceholderText(
        'Agrega cualquier nota sobre esta preparación...'
      );
      fireEvent.change(notesTextarea, { target: { value: 'Test' } });

      expect(screen.getByText('4 / 500')).toBeInTheDocument();
    });
  });
});
