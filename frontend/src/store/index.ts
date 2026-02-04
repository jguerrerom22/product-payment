import { configureStore } from '@reduxjs/toolkit';
import productReducer from './products/productSlice';
import transactionReducer from './transaction/transactionSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
