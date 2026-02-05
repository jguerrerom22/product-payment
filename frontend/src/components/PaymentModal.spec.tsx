import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PaymentModal from './PaymentModal';
import transactionReducer from '../store/transaction/transactionSlice';
import productReducer from '../store/products/productSlice';

// Mock react-credit-cards-2
vi.mock('react-credit-cards-2', () => ({
  default: () => <div data-testid="mock-cards" />
}));

// Mock react-imask
vi.mock('react-imask', () => ({
  IMaskInput: (props: any) => (
    <input 
      {...props} 
      onChange={(e) => props.onAccept && props.onAccept(e.target.value)}
    />
  )
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 1000,
  stock: 10,
  img_url: 'url'
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      transaction: transactionReducer,
      products: productReducer,
    },
    preloadedState: {
      transaction: { status: 'idle', error: null },
      ...initialState
    } as any
  });
};

describe('PaymentModal', () => {
  const onClose = vi.fn();

  it('renders checkout form initially', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PaymentModal product={mockProduct as any} onClose={onClose} />
      </Provider>
    );

    expect(screen.getByText('Checkout')).toBeDefined();
    expect(screen.getByLabelText('Card Number')).toBeDefined();
    expect(screen.getByLabelText('Card Holder Name')).toBeDefined();
  });

  it('validates form fields', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PaymentModal product={mockProduct as any} onClose={onClose} />
      </Provider>
    );

    const submitButton = screen.getByText('Validate and Continue');
    fireEvent.click(submitButton);

    expect(screen.getAllByText('Required').length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PaymentModal product={mockProduct as any} onClose={onClose} />
      </Provider>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
