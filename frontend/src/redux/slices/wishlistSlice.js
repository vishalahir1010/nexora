import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "../../services/wishlistService.js";
import { getErrorMessage } from "../../services/api.js";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistService.getWishlist();
    return res.data.data.wishlist;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addToWishlist = createAsyncThunk("wishlist/add", async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistService.add(productId);
    return res.data.data.wishlist;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const removeFromWishlist = createAsyncThunk("wishlist/remove", async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistService.remove(productId);
    return res.data.data.wishlist;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { wishlist: { products: [] }, status: "idle" },
  reducers: {
    resetWishlist: (state) => {
      state.wishlist = { products: [] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.status = "succeeded";
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
