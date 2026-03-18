export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number; // decimal percentage, e.g. 0.1 = 10%
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: { code: string } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR_CART' };

export interface CartDerivedState {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}
