import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating Component', () => {
  it('should render 5 star buttons', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(5);
  });

  it('should display the current rating value', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('should display "Not rated" when value is 0', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    expect(screen.getByText('Not rated')).toBeInTheDocument();
  });

  it('should call onChange when a star is clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    const fourthStar = screen.getByLabelText('Rate 4 out of 5');
    fireEvent.click(fourthStar);

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should mark selected star with aria-checked', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    const thirdStar = screen.getByLabelText('Rate 3 out of 5');
    expect(thirdStar).toHaveAttribute('aria-checked', 'true');

    const fourthStar = screen.getByLabelText('Rate 4 out of 5');
    expect(fourthStar).toHaveAttribute('aria-checked', 'false');
  });

  it('should have correct tabIndex for selected star', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    const thirdStar = screen.getByLabelText('Rate 3 out of 5');
    expect(thirdStar).toHaveAttribute('tabIndex', '0');

    const firstStar = screen.getByLabelText('Rate 1 out of 5');
    expect(firstStar).toHaveAttribute('tabIndex', '-1');
  });

  it('should apply custom className', () => {
    const onChange = vi.fn();
    const { container } = render(
      <StarRating value={3} onChange={onChange} className="custom-class" />
    );

    const starRating = container.querySelector('.star-rating');
    expect(starRating).toHaveClass('custom-class');
  });

  it('should handle keyboard navigation with ArrowRight', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);

    const secondStar = screen.getByLabelText('Rate 2 out of 5');
    fireEvent.keyDown(secondStar, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('should handle keyboard navigation with ArrowLeft', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    const thirdStar = screen.getByLabelText('Rate 3 out of 5');
    fireEvent.keyDown(thirdStar, { key: 'ArrowLeft' });

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('should handle Home key to jump to rating 1', () => {
    const onChange = vi.fn();
    render(<StarRating value={4} onChange={onChange} />);

    const fourthStar = screen.getByLabelText('Rate 4 out of 5');
    fireEvent.keyDown(fourthStar, { key: 'Home' });

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('should handle End key to jump to rating 5', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);

    const secondStar = screen.getByLabelText('Rate 2 out of 5');
    fireEvent.keyDown(secondStar, { key: 'End' });

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('should not allow rating below 1', () => {
    const onChange = vi.fn();
    render(<StarRating value={1} onChange={onChange} />);

    const firstStar = screen.getByLabelText('Rate 1 out of 5');
    fireEvent.keyDown(firstStar, { key: 'ArrowLeft' });

    expect(onChange).toHaveBeenCalledWith(1); // Should stay at 1
  });

  it('should not allow rating above 5', () => {
    const onChange = vi.fn();
    render(<StarRating value={5} onChange={onChange} />);

    const fifthStar = screen.getByLabelText('Rate 5 out of 5');
    fireEvent.keyDown(fifthStar, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith(5); // Should stay at 5
  });
});
