import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import ProductList from './ProductList';
import productReducer from '../store/products/productSlice';

const mockProducts = [
  {
    id: 1,
    name: 'Product 1',
    price: 1000,
    stock: 10,
    description: 'Description 1',
    img_url: 'url1'
  },
  {
    id: 2,
    name: 'Product 2',
    price: 2000,
    stock: 0,
    description: 'Description 2',
    img_url: 'url2'
  }
];

const createMockStore = (status: 'idle' | 'loading' | 'succeeded' | 'failed' = 'succeeded', items = mockProducts) => {
  return configureStore({
    reducer: {
      // @ts-ignore
      products: productReducer,
      // @ts-ignore
      transaction: (state = { status: 'idle' }) => state, // dummy
    },
    preloadedState: {
      products: { items, status, error: null }
    } as any
  });
};

describe('ProductList', () => {
  const onSelectProduct = vi.fn();

  it('renders loading skeletons when loading', () => {
    const store = createMockStore('loading', []);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductList onSelectProduct={onSelectProduct} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Store Products')).toBeDefined();
    expect(screen.queryByText('Pay now')).toBeNull();
  });

  it('renders products when succeeded', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductList onSelectProduct={onSelectProduct} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Product 1')).toBeDefined();
    expect(screen.getByText('Product 2')).toBeDefined();
    expect(screen.getByText('Pay now')).toBeDefined();
    expect(screen.getByText('Out of Stock')).toBeDefined();
  });

  it('calls onSelectProduct when button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductList onSelectProduct={onSelectProduct} />
        </BrowserRouter>
      </Provider>
    );

    const button = screen.getByText('Pay now');
    fireEvent.click(button);

    expect(onSelectProduct).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('disables button when product is out of stock', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductList onSelectProduct={onSelectProduct} />
        </BrowserRouter>
      </Provider>
    );

    const button = screen.getByText('Out of Stock');
    expect(button).toBeDisabled();
  });
});
