import { useReducer, useMemo } from 'react';
import type { CartState, CartAction, CartDerivedState } from './types';

// Valid coupon codes and their discount percentages
const VALID_COUPONS: Record<string, number> = {
  SAVE10: 0.1,
  SAVE20: 0.2,
  HALF: 0.5,
};

export const MAX_QUANTITY = 10;

const initialState: CartState = {
  items: [],
  couponCode: null,
  couponDiscount: 0,
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        // Already at max — silently clamp
        const newQty = Math.min(existing.quantity + 1, MAX_QUANTITY);
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: newQty } : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      // Quantity <= 0 removes the item
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        };
      }
      const clamped = Math.min(quantity, MAX_QUANTITY);
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: clamped } : item
        ),
      };
    }

    case 'APPLY_COUPON': {
      const normalized = action.payload.code.trim().toUpperCase();
      const discount = VALID_COUPONS[normalized];
      // Invalid coupon — state is unchanged (no error surfaced)
      if (discount === undefined) {
        return state;
      }
      return {
        ...state,
        couponCode: normalized,
        couponDiscount: discount,
      };
    }

    case 'REMOVE_COUPON':
      return {
        ...state,
        couponCode: null,
        couponDiscount: 0,
      };

    case 'CLEAR_CART':
      return {
        items: [],
        couponCode: null,
        couponDiscount: 0,
      };

    default:
      return state;
  }
}

export function useCartReducer() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const derived = useMemo<CartDerivedState>(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = subtotal * state.couponDiscount;
    return {
      subtotal,
      discount,
      total: subtotal - discount,
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [state.items, state.couponDiscount]);

  return { state, dispatch, derived };
}
