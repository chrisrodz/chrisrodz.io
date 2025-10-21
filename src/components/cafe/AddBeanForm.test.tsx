import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  beforeEach(() => {
    // Clear all stores
    beansStore.set([]);
    lastAddedBeanIdStore.set(null);

    // Reset mocks
    mockFetch.mockReset();
    mockOnBeanAdded.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      expect(screen.getByText('Add New Bean')).toBeInTheDocument();
      expect(screen.getByLabelText('Bean Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Roaster')).toBeInTheDocument();
      expect(screen.getByLabelText('Roast Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Bean' })).toBeInTheDocument();
    });

    it('should render with empty form fields initially', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      expect(screen.getByLabelText('Bean Name *')).toHaveValue('');
      expect(screen.getByLabelText('Roaster')).toHaveValue('');
      expect(screen.getByLabelText('Roast Date')).toHaveValue('');
      expect(screen.getByLabelText('Notes')).toHaveValue('');
    });

    it('should render without onBeanAdded callback', () => {
      render(<AddBeanForm />);

      expect(screen.getByText('Add New Bean')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when bean name is empty', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when bean name is filled', async () => {
      const user = userEvent.setup();
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const beanNameInput = screen.getByLabelText('Bean Name *');
      await user.type(beanNameInput, 'Ethiopia Yirgacheffe');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when bean name is only whitespace', async () => {
      const user = userEvent.setup();
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const beanNameInput = screen.getByLabelText('Bean Name *');
      await user.type(beanNameInput, '   ');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Interaction', () => {
    it('should update bean name when input changes', async () => {
      const user = userEvent.setup();
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const beanNameInput = screen.getByLabelText('Bean Name *') as HTMLInputElement;
      await user.type(beanNameInput, 'Colombia Supremo');

      expect(beanNameInput).toHaveValue('Colombia Supremo');
    });

    it('should update roaster when input changes', async () => {
      const user = userEvent.setup();
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const roasterInput = screen.getByLabelText('Roaster') as HTMLInputElement;
      await user.type(roasterInput, 'Blue Bottle');

      expect(roasterInput).toHaveValue('Blue Bottle');
    });

    it('should update roast date when input changes', async () => {
      const user = userEvent.setup();
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const roastDateInput = screen.getByLabelText('Roast Date') as HTMLInputElement;
      await user.type(roastDateInput, '2025-01-15');

      expect(roastDateInput).toHaveValue('2025-01-15');
    });

    it('should update notes when textarea changes', async () => {
      const user = userEvent.setup();
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const notesTextarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;
      await user.type(notesTextarea, 'Floral and fruity notes');

      expect(notesTextarea).toHaveValue('Floral and fruity notes');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data on successful submission', async () => {
      const user = userEvent.setup();
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
      await user.type(screen.getByLabelText('Bean Name *'), 'Ethiopia Yirgacheffe');
      await user.type(screen.getByLabelText('Roaster'), 'Blue Bottle');
      await user.type(screen.getByLabelText('Roast Date'), '2025-01-10');
      await user.type(screen.getByLabelText('Notes'), 'Floral notes');

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
    });

    it('should call onBeanAdded callback with bean ID on success', async () => {
      const user = userEvent.setup();
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

      await user.type(screen.getByLabelText('Bean Name *'), 'Test Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnBeanAdded).toHaveBeenCalledWith('new-bean-id');
      });
    });

    it('should add bean to beansStore on success', async () => {
      const user = userEvent.setup();
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

      await user.type(screen.getByLabelText('Bean Name *'), 'Store Test Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const beans = beansStore.get();
        expect(beans).toHaveLength(1);
        expect(beans[0]).toEqual(mockBean);
        expect(lastAddedBeanIdStore.get()).toBe('new-bean-id');
      });
    });

    it('should reset form fields after successful submission', async () => {
      const user = userEvent.setup();
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
      await user.type(screen.getByLabelText('Bean Name *'), 'Test Bean');
      await user.type(screen.getByLabelText('Roaster'), 'Test Roaster');
      await user.type(screen.getByLabelText('Roast Date'), '2025-01-10');
      await user.type(screen.getByLabelText('Notes'), 'Test notes');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Bean Name *')).toHaveValue('');
        expect(screen.getByLabelText('Roaster')).toHaveValue('');
        expect(screen.getByLabelText('Roast Date')).toHaveValue('');
        expect(screen.getByLabelText('Notes')).toHaveValue('');
      });
    });

    it('should trim whitespace from text fields before submission', async () => {
      const user = userEvent.setup();
      const mockBean = {
        id: 'new-bean-id',
        created_at: '2025-01-15T00:00:00Z',
        bean_name: 'Trimmed Bean',
        roaster: 'Trimmed Roaster',
        origin: null,
        roast_date: null,
        notes: 'Trimmed notes',
        is_active: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bean: mockBean }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      // Add whitespace to inputs
      await user.type(screen.getByLabelText('Bean Name *'), '  Trimmed Bean  ');
      await user.type(screen.getByLabelText('Roaster'), '  Trimmed Roaster  ');
      await user.type(screen.getByLabelText('Notes'), '  Trimmed notes  ');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArgs = mockFetch.mock.calls[0];
        const formData = callArgs[1].body as FormData;

        expect(formData.get('bean_name')).toBe('Trimmed Bean');
        expect(formData.get('roaster')).toBe('Trimmed Roaster');
        expect(formData.get('notes')).toBe('Trimmed notes');
      });
    });

    it('should not include empty optional fields in submission', async () => {
      const user = userEvent.setup();
      const mockBean = {
        id: 'new-bean-id',
        created_at: '2025-01-15T00:00:00Z',
        bean_name: 'Minimal Bean',
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

      // Only fill required field
      await user.type(screen.getByLabelText('Bean Name *'), 'Minimal Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArgs = mockFetch.mock.calls[0];
        const formData = callArgs[1].body as FormData;

        expect(formData.get('bean_name')).toBe('Minimal Bean');
        expect(formData.has('roaster')).toBe(false);
        expect(formData.has('roast_date')).toBe(false);
        expect(formData.has('notes')).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when submission fails', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Database connection failed' }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      await user.type(screen.getByLabelText('Bean Name *'), 'Test Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to add bean')).toBeInTheDocument();
      });
    });

    it('should show specific error message from server response', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Bean name already exists' }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      await user.type(screen.getByLabelText('Bean Name *'), 'Duplicate Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Bean name already exists')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      await user.type(screen.getByLabelText('Bean Name *'), 'Test Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();

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

      await user.type(screen.getByLabelText('Bean Name *'), 'Test Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      // Button should be disabled and show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Adding Bean...');
      });
    });

    it('should not call onBeanAdded when submission fails', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to add bean' }),
      });

      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      await user.type(screen.getByLabelText('Bean Name *'), 'Test Bean');

      const submitButton = screen.getByRole('button', { name: 'Add Bean' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to add bean')).toBeInTheDocument();
      });

      expect(mockOnBeanAdded).not.toHaveBeenCalled();
    });
  });

  describe('Form Field Constraints', () => {
    it('should respect maxLength constraint on bean name', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const beanNameInput = screen.getByLabelText('Bean Name *') as HTMLInputElement;
      expect(beanNameInput).toHaveAttribute('maxLength', '200');
    });

    it('should respect maxLength constraint on roaster', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const roasterInput = screen.getByLabelText('Roaster') as HTMLInputElement;
      expect(roasterInput).toHaveAttribute('maxLength', '200');
    });

    it('should respect maxLength constraint on notes', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const notesTextarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;
      expect(notesTextarea).toHaveAttribute('maxLength', '500');
    });

    it('should have correct input type for roast date', () => {
      render(<AddBeanForm onBeanAdded={mockOnBeanAdded} />);

      const roastDateInput = screen.getByLabelText('Roast Date') as HTMLInputElement;
      expect(roastDateInput).toHaveAttribute('type', 'date');
    });
  });
});
