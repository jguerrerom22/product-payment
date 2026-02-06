import { describe, it, expect, beforeEach, vi } from 'vitest';
import transactionReducer, { 
    createTransaction, 
    checkTransactionStatus, 
    resetTransaction,
    setTransactionId,
    setTransactionResult
} from './transactionSlice';

describe('transactionSlice', () => {
  const initialState = {
    currentTransactionId: null,
    status: 'idle' as const,
    error: null,
    transactionResult: null,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should handle resetTransaction', () => {
    const state = transactionReducer({
      currentTransactionId: '1',
      transactionResult: { id: '1' } as any,
      status: 'succeeded',
      error: 'error'
    }, resetTransaction());
    
    expect(state.currentTransactionId).toBeNull();
    expect(state.status).toBe('idle');
  });

  it('should handle setTransactionId', () => {
    const state = transactionReducer(initialState, setTransactionId('tx_123'));
    expect(state.currentTransactionId).toBe('tx_123');
    expect(localStorage.getItem('transaction_id')).toBe('tx_123');
  });

  it('should handle setTransactionResult', () => {
    const result = { id: 'tx_123', status: 'APPROVED' };
    const state = transactionReducer(initialState, setTransactionResult(result));
    expect(state.transactionResult).toEqual(result);
    expect(JSON.parse(localStorage.getItem('transaction_result')!)).toEqual(result);
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
    expect(localStorage.getItem('transaction_id')).toBe('tx_123');
  });

  it('should handle createTransaction.rejected', () => {
    const error = { message: 'Network error' };
    const action = { type: createTransaction.rejected.type, error };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });

  it('should handle checkTransactionStatus.pending', () => {
    const action = { type: checkTransactionStatus.pending.type };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('loading');
  });

  it('should handle checkTransactionStatus.fulfilled', () => {
    const mockResult = { id: 'tx_123', status: 'APPROVED' };
    const action = { type: checkTransactionStatus.fulfilled.type, payload: mockResult };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.transactionResult).toEqual(mockResult);
  });

  it('should handle checkTransactionStatus.rejected', () => {
    const error = { message: 'Status error' };
    const action = { type: checkTransactionStatus.rejected.type, error };
    const state = transactionReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Status error');
  });
});
