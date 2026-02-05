import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import productReducer from '../store/products/productSlice';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 1500000,
  stock: 10,
  img_url: 'http://example.com/image.jpg'
};

const createMockStore = (items = [mockProduct], status: 'idle' | 'loading' | 'succeeded' | 'failed' = 'succeeded') => {
  return configureStore({
    reducer: {
      products: productReducer,
    },
    preloadedState: {
      products: {
        items,
        status,
        error: null,
      }
    }
  });
};

describe('ProductDetail', () => {
  const onPay = vi.fn();

  it('renders product details correctly', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/product/1']}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetail onPay={onPay} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Test Product')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
    // Use regex to ignore special space characters
    expect(screen.getByText(/\$\s*1\.500\.000/)).toBeDefined();
    expect(screen.getByText('10 units available')).toBeDefined();
  });

  it('renders product image', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/product/1']}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetail onPay={onPay} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const img = screen.getByAltText('Test Product');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('http://example.com/image.jpg');
  });

  it('calls onPay when buy button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/product/1']}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetail onPay={onPay} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const buyButton = screen.getByText('Buy Now with Card');
    fireEvent.click(buyButton);

    expect(onPay).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('shows out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const store = createMockStore([outOfStockProduct]);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/product/1']}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetail onPay={onPay} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Out of Stock')).toBeDefined();
    const button = screen.getByRole('button', { name: /Out of Stock/i });
    expect(button).toBeDisabled();
  });
});
