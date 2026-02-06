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
  id: 1,
  name: 'Test Product',
  price: 1000,
  stock: 10,
  img_url: 'url',
  images: ['url']
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // @ts-ignore
      transaction: transactionReducer,
      // @ts-ignore
      products: productReducer,
    },
    preloadedState: {
      transaction: { status: 'idle', error: null, currentTransactionId: null, transactionResult: null },
      products: { items: [mockProduct], status: 'succeeded', error: null },
      ...initialState
    } as any
  });
};

describe('PaymentModal', () => {
  const onClose = vi.fn();

  it('renders checkout form with customer and delivery fields', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PaymentModal product={mockProduct as any} onClose={onClose} />
      </Provider>
    );

    expect(screen.getByText('Checkout')).toBeDefined();
    expect(screen.getByLabelText('Card Number')).toBeDefined();
    expect(screen.getByLabelText('Full Name')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Phone')).toBeDefined();
    expect(screen.getByLabelText('Address')).toBeDefined();
    expect(screen.getByLabelText('City')).toBeDefined();
  });

  it('validates all required form fields', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PaymentModal product={mockProduct as any} onClose={onClose} />
      </Provider>
    );

    const submitButton = screen.getByText('Validate and Continue');
    fireEvent.click(submitButton);

    const errorTexts = screen.getAllByText('Required');
    expect(errorTexts.length).toBeGreaterThanOrEqual(7);
  });

  it('shows summary after successful validation', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PaymentModal product={mockProduct as any} onClose={onClose} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Card Holder Name'), { target: { value: 'JOHN DOE', name: 'cardHolder' } });
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe', name: 'fullName' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '3001234567', name: 'phone' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Calle 123', name: 'address' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Bogota', name: 'city' } });
    
    // cardNumber and expiry use IMask mock
    fireEvent.change(screen.getByLabelText('Card Number'), { target: { value: '4242 4242 4242 4242', name: 'cardNumber' } });
    fireEvent.change(screen.getByLabelText('Expiry (MM/YY)'), { target: { value: '12/25', name: 'expiry' } });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123', name: 'cvv' } });

    fireEvent.click(screen.getByText('Validate and Continue'));

    // Should now show summary
    expect(screen.getByText('Payment Summary')).toBeDefined();
    expect(screen.getByText(/Total:/)).toBeDefined();
    expect(screen.getByText(/Product:/)).toBeDefined();
  });
});
