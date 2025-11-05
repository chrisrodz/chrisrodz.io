import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddBeanForm from './AddBeanForm';
import { beansStore, lastAddedBeanIdStore } from '@/stores/beansStore';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/cafe',
  },
  writable: true,
});

describe('AddBeanForm Component', () => {
  const mockOnBeanAdded = vi.fn();

  // Helper function to wait for form submission to complete
  const waitForSubmissionComplete = async () => {
    // Wait for the submit button to return to its normal state
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Add Bean/i });
      expect(submitButton).not.toHaveAttribute('aria-busy', 'true');
      expect(submitButton).toHaveTextContent('Add Bean');
    });
  };

  beforeEach(() => {
    // Clear all stores
    beansStore.set([]);
    lastAddedBeanIdStore.set(null);

    // Reset mocks
    mockFetch.mockReset();
    mockOnBeanAdded.mockReset();
  });

  afterEach(async () => {
    // Wait a tick for any pending state updates
    await new Promise((resolve) => setTimeout(resolve, 0));
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should disable submit button when bean name is empty', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when bean name is filled', async () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const beanNameInput = screen.getByLabelText('Bean Name *');
      fireEvent.change(beanNameInput, { target: { value: 'Ethiopia Yirgacheffe' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when bean name is only whitespace', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const beanNameInput = screen.getByLabelText('Bean Name *');
      fireEvent.change(beanNameInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data on successful submission', async () => {
      const mockBean = {
        id: 'new-bean-id',
        created_at: '2025-01-15T00:00:00Z',
        bean_name: 'Ethiopia Yirgacheffe',
        roaster: 'Blue Bottle',
        origin: null,
        roast_date: '2025-01-10',
        notes: 'Floral notes',
        is_active: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bean: mockBean }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      // Fill out form
      fireEvent.change(screen.getByLabelText('Bean Name *'), {
        target: { value: 'Ethiopia Yirgacheffe' },
      });
      fireEvent.change(screen.getByLabelText('Roaster'), { target: { value: 'Blue Bottle' } });
      fireEvent.change(screen.getByLabelText('Roast Date'), { target: { value: '2025-01-10' } });
      fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Floral notes' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/cafe',
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
            },
          })
        );
      });

      // Verify FormData contents
      const callArgs = mockFetch.mock.calls[0];
      const formData = callArgs[1].body as FormData;

      expect(formData.get('action')).toBe('add_bean');
      expect(formData.get('bean_name')).toBe('Ethiopia Yirgacheffe');
      expect(formData.get('roaster')).toBe('Blue Bottle');
      expect(formData.get('roast_date')).toBe('2025-01-10');
      expect(formData.get('notes')).toBe('Floral notes');

      // Wait for form submission to complete
      await waitForSubmissionComplete();
    });

    it('should call onBeanAdded callback with bean ID on success', async () => {
      const mockBean = {
        id: 'new-bean-id',
        created_at: '2025-01-15T00:00:00Z',
        bean_name: 'Test Bean',
        roaster: null,
        origin: null,
        roast_date: null,
        notes: null,
        is_active: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bean: mockBean }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), { target: { value: 'Test Bean' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnBeanAdded).toHaveBeenCalledWith('new-bean-id');
      });

      // Wait for form submission to complete
      await waitForSubmissionComplete();
    });

    it('should add bean to beansStore on success', async () => {
      const mockBean = {
        id: 'new-bean-id',
        created_at: '2025-01-15T00:00:00Z',
        bean_name: 'Store Test Bean',
        roaster: 'Test Roaster',
        origin: null,
        roast_date: null,
        notes: null,
        is_active: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bean: mockBean }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), {
        target: { value: 'Store Test Bean' },
      });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const beans = beansStore.get();
        expect(beans).toHaveLength(1);
        expect(beans[0]).toEqual(mockBean);
        expect(lastAddedBeanIdStore.get()).toBe('new-bean-id');
      });

      // Wait for form submission to complete
      await waitForSubmissionComplete();
    });

    it('should reset form fields after successful submission', async () => {
      const mockBean = {
        id: 'new-bean-id',
        created_at: '2025-01-15T00:00:00Z',
        bean_name: 'Test Bean',
        roaster: 'Test Roaster',
        origin: null,
        roast_date: '2025-01-10',
        notes: 'Test notes',
        is_active: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bean: mockBean }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      // Fill out form
      fireEvent.change(screen.getByLabelText('Bean Name *'), { target: { value: 'Test Bean' } });
      fireEvent.change(screen.getByLabelText('Roaster'), { target: { value: 'Test Roaster' } });
      fireEvent.change(screen.getByLabelText('Roast Date'), { target: { value: '2025-01-10' } });
      fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Test notes' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Bean Name *')).toHaveValue('');
        expect(screen.getByLabelText('Roaster')).toHaveValue('');
        expect(screen.getByLabelText('Roast Date')).toHaveValue('');
        expect(screen.getByLabelText('Notes')).toHaveValue('');
      });

      // Wait for form submission to complete
      await waitForSubmissionComplete();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when submission fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Database connection failed' }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), { target: { value: 'Test Bean' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to add bean')).toBeInTheDocument();
      });

      // Wait for form submission to complete (even on error)
      await waitForSubmissionComplete();
    });

    it('should show specific error message from server response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Bean name already exists' }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), {
        target: { value: 'Duplicate Bean' },
      });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Bean name already exists')).toBeInTheDocument();
      });

      // Wait for form submission to complete (even on error)
      await waitForSubmissionComplete();
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), { target: { value: 'Test Bean' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Wait for form submission to complete (even on error)
      await waitForSubmissionComplete();

      consoleErrorSpy.mockRestore();
    });

    it('should disable submit button during submission', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    bean: {
                      id: 'new-bean-id',
                      bean_name: 'Test Bean',
                    },
                  }),
                }),
              100
            )
          )
      );

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), { target: { value: 'Test Bean' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      // Button should be disabled and show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Adding Bean...');
      });

      // Wait for submission to complete and button to re-enable
      await waitForSubmissionComplete();
    });

    it('should not call onBeanAdded when submission fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to add bean' }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      fireEvent.change(screen.getByLabelText('Bean Name *'), { target: { value: 'Test Bean' } });

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to add bean')).toBeInTheDocument();
      });

      expect(mockOnBeanAdded).not.toHaveBeenCalled();

      // Wait for form submission to complete (even on error)
      await waitForSubmissionComplete();
    });
  });
});
