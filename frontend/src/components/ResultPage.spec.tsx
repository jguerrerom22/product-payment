import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import ResultPage from './ResultPage';
import transactionReducer from '../store/transaction/transactionSlice';

const createMockStore = (status = 'succeeded', transactionResult = null, error: string | null = null) => {
  return configureStore({
    reducer: {
      // @ts-ignore
      transaction: transactionReducer,
      // @ts-ignore
      products: (state = { status: 'idle' }) => state, // dummy
    },
    preloadedState: {
      transaction: { status, transactionResult, error, currentTransactionId: null }
    } as any
  });
};

describe('ResultPage', () => {
  it('renders success state when APPROVED', () => {
    const store = createMockStore('succeeded', { id: 'tx_123', status: 'APPROVED' } as any);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ResultPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Transaction Successful!')).toBeDefined();
    expect(screen.getByText('Transaction ID: tx_123')).toBeDefined();
    expect(screen.getByText('Back to Product')).toBeDefined();
  });

  it('renders pending state when PENDING', () => {
    const store = createMockStore('succeeded', { id: 'tx_456', status: 'PENDING' } as any);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ResultPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Transaction Pending')).toBeDefined();
    expect(screen.getByText('Update Status')).toBeDefined();
  });

  it('renders error state when FAILED', () => {
    const store = createMockStore('failed', { status: 'FAILED' } as any, 'Insufficient funds');
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ResultPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Transaction Failed')).toBeDefined();
    expect(screen.getByText('Reason: Insufficient funds')).toBeDefined();
  });

  it('resets transaction when Back to Product is clicked', () => {
    const store = createMockStore('succeeded', { id: 'tx_123', status: 'APPROVED' } as any);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ResultPage />
        </BrowserRouter>
      </Provider>
    );

    const backButton = screen.getByText('Back to Product');
    fireEvent.click(backButton);

    // After click, it should have reset transaction (status becomes idle)
    expect(store.getState().transaction.status).toBe('idle');
  });
});
