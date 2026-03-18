import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartManager } from './CartManager'; 


// Test the CartManager component using React Testing Library.
//
// Note: Query by accessible role/label rather than test IDs.
// The component uses aria-label attributes throughout to support this.

describe('CartManager', () => {
  // Your tests here
  it('renders the CartManager component', () => {
    render(<CartManager />);
    expect(screen.getByLabelText(/available products/i)).toBeDefined();
  });
  it('displays products and allows adding to cart', async () => {
    
    const user = userEvent.setup();
    const { getAllByRole } = render(<CartManager />);
    const addButtons = getAllByRole('button', { name: /add to cart/i });
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]);
    expect(screen.getAllByLabelText(/ line total/i)).toHaveLength(1);
  });
  it('displays cart items and allows updating quantity', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]);
    await waitFor(() => {
      expect(screen.getAllByLabelText(/line total/i).length).toBeGreaterThan(0);
    });
    const decreaseButton = screen.getAllByRole('button', { name: /decrease quantity/i });
    await user.click(decreaseButton[0]);
    expect(screen.getByLabelText(/subtotal/i).textContent).toMatch('$0.00');
  });
  it('allows applying and removing coupons', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    const couponInput = screen.getAllByLabelText(/coupon code/i);
    await user.type(couponInput[0], 'SAVE10');
    const applyButton = screen.getAllByRole('button', { name: /apply/i });
    await user.click(applyButton[0]);
    expect(screen.getByLabelText(/discount/i).textContent).toMatch('-$');
    const removeButton = screen.getByRole('button', { name: /remove coupon/i });
    await user.click(removeButton);
    expect(screen.getAllByLabelText(/discount/i).length).toBe(1);
  });
  it('allows applying using the Enter key', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    const couponInput = screen.getAllByLabelText(/coupon code/i);
    await user.type(couponInput[0], 'SAVE10');
    await user.type(couponInput[0], '{Enter}');
    expect(screen.getByLabelText(/discount/i).textContent).toMatch('-$');
    const removeButton = screen.getByRole('button', { name: /remove coupon/i });
    await user.click(removeButton);
    expect(screen.getAllByLabelText(/discount/i).length).toBe(1);
  });
  it('handles increasing quantity using the increase quantity button', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    const increaseButton = screen.getAllByRole('button', { name: /increase quantity/i });
    for (let i = 0; i < 5; i++) {
      await user.click(increaseButton[0]);
    }
    const quantityDisplay = screen.getAllByLabelText(/quantity of item: /i);
    expect(quantityDisplay[0].textContent).toBe('6');
  });
  it('handles edge cases like exceeding max quantity', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    
    for (let i = 0; i < 12; i++) {
      await user.click(addButtons[0]);
    }

    const quantityDisplay = screen.getAllByLabelText(/quantity of item: /i);
    expect(quantityDisplay[0].textContent).toBe('10');
  });
  it('handles edge cases like applying invalid coupon', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const couponInput = screen.getByLabelText(/coupon code/i);
    await user.type(couponInput, 'INVALIDCODE');
    const applyButton = screen.getByRole('button', { name: /apply/i });
    await user.click(applyButton);
    expect(screen.getByLabelText(/discount/i).textContent).toBe('-$0.00');
  });
  it('handles edge cases like removing item by setting quantity to 0', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i });
    await user.click(decreaseButton);
    expect(screen.queryByLabelText(/line total/i)).toBeNull();
  });
  it('handles edge cases like removing item with remove button', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    expect(screen.queryByLabelText(/line total/i)).toBeNull();
  });
  it('handles edge cases like clearing cart', async () => {
    const user = userEvent.setup();
    render(<CartManager />);
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    const clearButton = screen.getByRole('button', { name: /clear cart/i });
    await user.click(clearButton);
    expect(screen.queryByLabelText(/line total/i)).toBeNull();
  });
});
