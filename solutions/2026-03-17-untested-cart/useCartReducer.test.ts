import { describe, expect, it } from 'vitest';
import { cartReducer, MAX_QUANTITY, useCartReducer } from './useCartReducer';
import { act, renderHook } from '@testing-library/react';

// Test the cartReducer and useCartReducer hook in isolation.
//
// Hint: You can test cartReducer as a pure function without rendering anything.
// Import it directly from './useCartReducer' along with MAX_QUANTITY.
// For the hook itself, use renderHook from @testing-library/react.

describe('cartReducer', () => {
  // Your tests here
  it('should add item to cart', () => {
    const initialState = { items: [], couponCode: '', couponDiscount: 0};
    const action = {
      type: 'ADD_ITEM',
      payload: { id: '1', name: 'Test Product', price: 10 },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0]).toMatchObject({
      id: '1',
      name: 'Test Product',
      price: 10,
      quantity: 1,
    });
  });
  
  it('should update quantity of existing item', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 10, quantity: 1 }],
      couponCode: '',
      couponDiscount: 0,
    };
    const action = {
      type: 'ADD_ITEM',
      payload: { id: '1', name: 'Test Product', price: 10 },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].quantity).toBe(2);
  });

  it('should not exceed MAX_QUANTITY when adding items', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 10, quantity: 9 }],
      couponCode: '',
      couponDiscount: 0,
    };
    const action = {
      type: 'ADD_ITEM',
      payload: { id: '1', name: 'Test Product', price: 10 },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items[0].quantity).toBe(MAX_QUANTITY);
  });

  it('should remove item from cart', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 10, quantity: 1 }],
      couponCode: '',
      couponDiscount: 0,
    };
    const action = {
      type: 'REMOVE_ITEM',
      payload: { id: '1' },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items).toHaveLength(0);
  });
  
  it('should update item quantity', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 10, quantity: 1 }],
      couponCode: '',
      couponDiscount: 0,
    };
    const action = {
      type: 'UPDATE_QUANTITY',
      payload: { id: '1', quantity: 5 },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items[0].quantity).toBe(5);
  });

  it('should remove item if quantity updated to 0', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 10, quantity: 1 }],
      couponCode: '',
      couponDiscount: 0,
    };
    const action = {
      type: 'UPDATE_QUANTITY',
      payload: { id: '1', quantity: 0 },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items).toHaveLength(0);
  });

  it('should clamp quantity to MAX_QUANTITY when updating', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 10, quantity: 5 }],
      couponCode: '',
      couponDiscount: 0,
    };
    const action = {
      type: 'UPDATE_QUANTITY',
      payload: { id: '1', quantity: 15 },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.items[0].quantity).toBe(MAX_QUANTITY);
  });
  it('should apply valid coupon code', () => {
    const initialState = {
      items: [],
      couponCode: null,
      couponDiscount: 0,
    };
    const action = {
      type: 'APPLY_COUPON',
      payload: { code: 'SAVE10' },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.couponCode).toBe('SAVE10');
    expect(newState.couponDiscount).toBe(0.1);
  });

  it('should ignore invalid coupon code', () => {
    const initialState = {
      items: [],
      couponCode: null,
      couponDiscount: 0,
    };
    const action = {
      type: 'APPLY_COUPON',
      payload: { code: 'INVALID' },
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.couponCode).toBeNull();
    expect(newState.couponDiscount).toBe(0);
  });

  it('should remove applied coupon', () => {
    const initialState = {
      items: [],
      couponCode: 'SAVE10',
      couponDiscount: 0.1,
    };
    const action = {
      type: 'REMOVE_COUPON',
    } as const;
    const newState = cartReducer(initialState, action);
    expect(newState.couponCode).toBeNull();
    expect(newState.couponDiscount).toBe(0);
  });
  it('should maintain state consistency across multiple actions', () => {    
    let state = {
      items: [],
      couponCode: null,
      couponDiscount: 0,
    };
    state = cartReducer(state, {
      type: 'ADD_ITEM',
      payload: { id: '1', name: 'Test Product', price: 10 },
    } as const) as any;
    state = cartReducer(state, {
      type: 'UPDATE_QUANTITY',
      payload: { id: '1', quantity: 3 },
    } as const) as any;
    state = cartReducer(state, {
      type: 'APPLY_COUPON',
      payload: { code: 'SAVE10' },
    } as const) as any;
    expect(state.items[0].quantity).toBe(3);
    expect(state.couponCode).toBe('SAVE10');
    expect(state.couponDiscount).toBe(0.1);
  });
}); 

describe('useCartReducer', () => {
  // Your tests here
  it('should initialize with default state', () => {
    // This test would require rendering the hook with renderHook from @testing-library/react
    // and checking that the initial state matches the expected default state.
    const { result } = renderHook(() => useCartReducer());
    expect(result.current.state.items).toHaveLength(0);
    expect(result.current.state.couponCode).toBeNull();
    expect(result.current.state.couponDiscount).toBe(0);
  });
  it('should update state when dispatching actions', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
    });
    expect(result.current.state.items).toHaveLength(1);
    expect(result.current.state.items[0]).toMatchObject({
      id: '1',
      name: 'Test Product',
      price: 10,
      quantity: 1,
    });
  });
  it('should add multiple items', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '2', name: 'Test Product 2', price: 12 },
      });
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
    });
    expect(result.current.state.items).toHaveLength(2);
    expect(result.current.state.items[0]).toMatchObject({
      id: '1',
      name: 'Test Product',
      price: 10,
      quantity: 2,
    });
    expect(result.current.state.items[1]).toMatchObject({
      id: '2',
      name: 'Test Product 2',
      price: 12,
      quantity: 1,
    });
  });
  it('should maintain state consistency across multiple actions', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 3 },
      });
      dispatch({
        type: 'APPLY_COUPON',
        payload: { code: 'SAVE10' },
      });
    });
    expect(result.current.state.items[0].quantity).toBe(3);
    expect(result.current.state.couponCode).toBe('SAVE10');
    expect(result.current.state.couponDiscount).toBe(0.1);
  });
  it('should not allow quantity to exceed MAX_QUANTITY through dispatch', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: MAX_QUANTITY + 5 },
      });
    });
    expect(result.current.state.items[0].quantity).toBe(MAX_QUANTITY);
  });
  it('should remove item when quantity updated to 0 through dispatch', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 0 },
      });
    });
    expect(result.current.state.items).toHaveLength(0);
  });
  it('should update only the specified item when quantity updated through dispatch', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Test Product', price: 10 },
      });
      dispatch({
        type: 'ADD_ITEM',
        payload: { id: '2', name: 'Test Product 2', price: 12 },
      });
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 4 },
      });
    });
    expect(result.current.state.items).toHaveLength(2);
    expect(result.current.state.items[0].quantity).toBe(4);
  });
  it('should return the state if action is not recognized', () => {
    const { result } = renderHook(() => useCartReducer());
    const { dispatch } = result.current;
    act(() => {
      dispatch({
        type: 'FOO_BAR' as any,
        payload: {} as any,
      });
    });
    expect(result.current.state.items).toHaveLength(0);
  });
});
