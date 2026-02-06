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
    productId: number;
    amount: number;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    deliveryInfo: {
      address: string;
      city: string;
      region: string;
      country: string;
      postalCode: string;
      phone: string;
    };
    paymentInfo: {
      number: string;
      cvc: string;
      exp_month: string;
      exp_year: string;
      card_holder: string;
      installments: number;
    };
  }) => {
    const response = await api.post('/transactions', payload);
    return response.data;
  }
);

export const checkTransactionStatus = createAsyncThunk(
  'transaction/checkStatus',
  async (transactionId: string) => {
    const response = await api.get(`/transactions/${transactionId}/status`);
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
      })
      .addCase(checkTransactionStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkTransactionStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transactionResult = action.payload;
      })
      .addCase(checkTransactionStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Status check failed';
      });
  },
});

export const { resetTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
