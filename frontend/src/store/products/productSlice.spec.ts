import { describe, it, expect } from 'vitest';
import productReducer, { fetchProducts } from './productSlice';

describe('productSlice', () => {
  const initialState = {
    items: [],
    status: 'idle' as const,
    error: null,
  };

  it('should handle initial state', () => {
    // @ts-ignore
    expect(productReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle fetchProducts.pending', () => {
    const action = { type: fetchProducts.pending.type };
    const state = productReducer(initialState, action);
    expect(state).toEqual({
      items: [],
      status: 'loading',
      error: null,
    });
  });

  it('should handle fetchProducts.fulfilled', () => {
    const mockProducts = [{ id: '1', name: 'Test Product', price: 100, stock: 10, img_url: 'url' }];
    const action = { type: fetchProducts.fulfilled.type, payload: mockProducts };
    const state = productReducer(initialState, action);
    expect(state).toEqual({
      items: mockProducts,
      status: 'succeeded',
      error: null,
    });
  });

  it('should handle fetchProducts.rejected', () => {
    const action = { type: fetchProducts.rejected.type, error: { message: 'Fetch failed' } };
    const state = productReducer(initialState, action);
    expect(state).toEqual({
      items: [],
      status: 'failed',
      error: 'Fetch failed',
    });
  });
});
