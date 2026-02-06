import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface TransactionState {
  currentTransactionId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  transactionResult: any | null;
}

const getPersisted = (key: string) => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return data;
  }
};

const initialState: TransactionState = {
  currentTransactionId: localStorage.getItem('transaction_id'),
  status: 'idle',
  error: null,
  transactionResult: getPersisted('transaction_result'),
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
    setTransactionId: (state, action) => {
      state.currentTransactionId = action.payload;
      if (action.payload) {
        localStorage.setItem('transaction_id', action.payload);
      } else {
        localStorage.removeItem('transaction_id');
      }
    },
    setTransactionResult: (state, action) => {
      state.transactionResult = action.payload;
      if (action.payload) {
        localStorage.setItem('transaction_result', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('transaction_result');
      }
    }
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
        localStorage.setItem('transaction_id', action.payload.id);
        localStorage.setItem('transaction_result', JSON.stringify(action.payload));
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
        localStorage.setItem('transaction_result', JSON.stringify(action.payload));
      })
      .addCase(checkTransactionStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Status check failed';
      });
  },
});

export const { resetTransaction, setTransactionId, setTransactionResult } = transactionSlice.actions;
export default transactionSlice.reducer;
