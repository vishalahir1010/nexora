import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "../../services/orderService.js";
import { getErrorMessage } from "../../services/api.js";

export const fetchMyOrders = createAsyncThunk("orders/fetchMine", async (_, { rejectWithValue }) => {
  try {
    const res = await orderService.getMyOrders();
    return res.data.data.orders;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchOrderById = createAsyncThunk("orders/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrderById(id);
    return res.data.data.order;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState: { list: [], current: null, status: "idle", error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default orderSlice.reducer;
