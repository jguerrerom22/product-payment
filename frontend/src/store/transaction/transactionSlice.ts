import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface TransactionState {
  currentTransactionId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  transactionResult: any | null;
}

const initialState: TransactionState = {
  currentTransactionId: null,
  status: 'idle',
  error: null,
  transactionResult: null,
};

export const createTransaction = createAsyncThunk(
  'transaction/create',
  async (payload: {
    productId: string;
    amount: number;
    deliveryInfo: any;
    paymentInfo: any;
  }) => {
    const response = await api.post('/transactions', payload);
    return response.data;
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction: (state) => {
      state.status = 'idle';
      state.currentTransactionId = null;
      state.error = null;
      state.transactionResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTransactionId = action.payload.id;
        state.transactionResult = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Transaction failed';
      });
  },
});

export const { resetTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
