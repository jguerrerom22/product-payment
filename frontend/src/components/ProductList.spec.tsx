import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductList from './ProductList';
import productReducer from '../store/products/productSlice';

const mockProducts = [
  {
    id: '1',
    name: 'Product 1',
    price: 1000,
    stock: 10,
    description: 'Description 1',
    img_url: 'url1'
  },
  {
    id: '2',
    name: 'Product 2',
    price: 2000,
    stock: 0,
    description: 'Description 2',
    img_url: 'url2'
  }
];

const createMockStore = (status = 'succeeded', items = mockProducts) => {
  return configureStore({
    reducer: {
      products: productReducer,
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
        <ProductList onSelectProduct={onSelectProduct} />
      </Provider>
    );

    expect(screen.getByText('Store Products')).toBeDefined();
    // Check if skeletons are rendered (by their container or just checking if buttons are NOT there yet)
    expect(screen.queryByText('Pay with credit card')).toBeNull();
  });

  it('renders products when succeeded', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductList onSelectProduct={onSelectProduct} />
      </Provider>
    );

    expect(screen.getByText('Product 1')).toBeDefined();
    expect(screen.getByText('Product 2')).toBeDefined();
    expect(screen.getByText('Pay with credit card')).toBeDefined();
    expect(screen.getByText('Out of Stock')).toBeDefined();
  });

  it('calls onSelectProduct when button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductList onSelectProduct={onSelectProduct} />
      </Provider>
    );

    const button = screen.getByText('Pay with credit card');
    fireEvent.click(button);

    expect(onSelectProduct).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('disables button when product is out of stock', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductList onSelectProduct={onSelectProduct} />
      </Provider>
    );

    const button = screen.getByText('Out of Stock');
    expect(button).toBeDisabled();
  });
});
