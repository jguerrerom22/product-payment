import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ResultPage from './ResultPage';
import transactionReducer from '../store/transaction/transactionSlice';

const createMockStore = (status = 'succeeded', transactionResult = null, error = null) => {
  return configureStore({
    reducer: {
      transaction: transactionReducer,
      products: (state = { status: 'idle' }) => state, // dummy
    },
    preloadedState: {
      transaction: { status, transactionResult, error }
    } as any
  });
};

describe('ResultPage', () => {
  const onBack = vi.fn();

  it('renders success state when APPROVED', () => {
    const store = createMockStore('succeeded', { id: 'tx_123', status: 'APPROVED' } as any);
    render(
      <Provider store={store}>
        <ResultPage onBack={onBack} />
      </Provider>
    );

    expect(screen.getByText('Transaction Successful!')).toBeDefined();
    expect(screen.getByText('Transaction ID: tx_123')).toBeDefined();
    expect(screen.getByText('Back to Store')).toBeDefined();
  });

  it('renders pending state when PENDING', () => {
    const store = createMockStore('succeeded', { id: 'tx_456', status: 'PENDING' } as any);
    render(
      <Provider store={store}>
        <ResultPage onBack={onBack} />
      </Provider>
    );

    expect(screen.getByText('Transaction Pending')).toBeDefined();
    expect(screen.getByText('Update Status')).toBeDefined();
  });

  it('renders error state when FAILED', () => {
    const store = createMockStore('failed', { status: 'FAILED' } as any, 'Insufficient funds');
    render(
      <Provider store={store}>
        <ResultPage onBack={onBack} />
      </Provider>
    );

    expect(screen.getByText('Transaction Failed')).toBeDefined();
    expect(screen.getByText('Reason: Insufficient funds')).toBeDefined();
  });

  it('calls onBack and resets transaction when Back to Store is clicked', () => {
    const store = createMockStore('succeeded', { id: 'tx_123', status: 'APPROVED' } as any);
    render(
      <Provider store={store}>
        <ResultPage onBack={onBack} />
      </Provider>
    );

    const backButton = screen.getByText('Back to Store');
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalled();
  });
});
