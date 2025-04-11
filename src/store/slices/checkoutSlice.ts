import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Checkout } from '../../types';

interface CheckoutState {
  checkouts: Checkout[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  checkouts: [],
  isLoading: false,
  error: null,
};

const checkoutSlice = createSlice({
  name: 'checkouts',
  initialState,
  reducers: {
    fetchCheckoutsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchCheckoutsSuccess(state, action: PayloadAction<Checkout[]>) {
      state.checkouts = action.payload;
      state.isLoading = false;
    },
    fetchCheckoutsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addCheckoutSuccess(state, action: PayloadAction<Checkout>) {
      state.checkouts.push(action.payload);
    },
    returnBookSuccess(state, action: PayloadAction<Checkout>) {
      const index = state.checkouts.findIndex(
        (c) => c._id === action.payload._id,
      );
      if (index !== -1) {
        state.checkouts[index] = action.payload;
      }
    },
  },
});

export const {
  fetchCheckoutsStart,
  fetchCheckoutsSuccess,
  fetchCheckoutsFailure,
  addCheckoutSuccess,
  returnBookSuccess,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
