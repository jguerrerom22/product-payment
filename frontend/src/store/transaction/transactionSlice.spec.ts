import { describe, it, expect, vi } from 'vitest';
import transactionReducer, { 
    createTransaction, 
    checkTransactionStatus, 
    resetTransaction 
} from './transactionSlice';

describe('transactionSlice', () => {
  const initialState = {
    currentTransactionId: null,
    status: 'idle' as const,
    error: null,
    transactionResult: null,
  };

  it('should handle initial state', () => {
    expect(transactionReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle resetTransaction', () => {
    const state = transactionReducer({
      currentTransactionId: '1',
      transactionResult: { id: '1' } as any,
      status: 'succeeded',
      error: 'error'
    }, resetTransaction());
    
    expect(state).toEqual(initialState);
  });

  it('should handle createTransaction.pending', () => {
    const action = { type: createTransaction.pending.type };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('loading');
  });

  it('should handle createTransaction.fulfilled', () => {
    const mockResult = { id: 'tx_123', status: 'APPROVED' };
    const action = { type: createTransaction.fulfilled.type, payload: mockResult };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.transactionResult).toEqual(mockResult);
  });

  it('should handle checkTransactionStatus.fulfilled', () => {
    const mockResult = { id: 'tx_123', status: 'APPROVED' };
    const action = { type: checkTransactionStatus.fulfilled.type, payload: mockResult };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.transactionResult).toEqual(mockResult);
  });
});
