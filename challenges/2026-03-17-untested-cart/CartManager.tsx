import React, { useState } from 'react';
import { useCartReducer } from './useCartReducer';

interface Product {
  id: string;
  name: string;
  price: number;
}

const AVAILABLE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'TypeScript Handbook', price: 29.99 },
  { id: 'p2', name: 'React Performance Guide', price: 49.99 },
  { id: 'p3', name: 'Testing Patterns Book', price: 39.99 },
];

export function CartManager() {
  const { state, dispatch, derived } = useCartReducer();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = () => {
    dispatch({ type: 'APPLY_COUPON', payload: { code: couponInput } });
    setCouponInput('');
  };

  const handleCouponKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div>
      <h1>Shopping Cart</h1>

      <section aria-label="Available products">
        <h2>Products</h2>
        <ul>
          {AVAILABLE_PRODUCTS.map((product) => (
            <li key={product.id}>
              <span>{product.name}</span>
              <span aria-label={`Price of ${product.name}`}>
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() =>
                  dispatch({
                    type: 'ADD_ITEM',
                    payload: {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                    },
                  })
                }
              >
                Add to Cart
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Cart items">
        <h2>Your Cart ({derived.itemCount} items)</h2>
        {state.items.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <ul>
            {state.items.map((item) => (
              <li key={item.id} role="group" aria-label={item.name}>
                <span>{item.name}</span>
                <span aria-label={`${item.name} line total`}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_QUANTITY',
                      payload: { id: item.id, quantity: item.quantity - 1 },
                    })
                  }
                >
                  −
                </button>
                <span aria-label={`Quantity of ${item.name}`}>
                  {item.quantity}
                </span>
                <button
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_QUANTITY',
                      payload: { id: item.id, quantity: item.quantity + 1 },
                    })
                  }
                >
                  +
                </button>
                <button
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() =>
                    dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Coupon">
        <h2>Coupon Code</h2>
        {state.couponCode ? (
          <div>
            <span aria-label="Applied coupon">Applied: {state.couponCode}</span>
            <button onClick={() => dispatch({ type: 'REMOVE_COUPON' })}>
              Remove Coupon
            </button>
          </div>
        ) : (
          <div>
            <input
              aria-label="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={handleCouponKeyDown}
              placeholder="Enter coupon code"
            />
            <button onClick={handleApplyCoupon}>Apply</button>
          </div>
        )}
      </section>

      <section aria-label="Order summary">
        <h2>Order Summary</h2>
        <div>
          <span>Subtotal:</span>
          <span aria-label="Subtotal">${derived.subtotal.toFixed(2)}</span>
        </div>
        {state.couponDiscount > 0 && (
          <div>
            <span>
              Discount ({(state.couponDiscount * 100).toFixed(0)}% off):
            </span>
            <span aria-label="Discount amount">
              -${derived.discount.toFixed(2)}
            </span>
          </div>
        )}
        <div>
          <span>Total:</span>
          <span aria-label="Order total">${derived.total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_CART' })}
          disabled={state.items.length === 0}
        >
          Clear Cart
        </button>
      </section>
    </div>
  );
}
