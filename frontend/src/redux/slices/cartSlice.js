import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "../../services/cartService.js";
import { getErrorMessage } from "../../services/api.js";

const GUEST_CART_KEY = "nexora_guest_cart";

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};
const writeGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

// Logged-in flows hit the DB-backed cart API
export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.getCart();
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addToCartDB = createAsyncThunk("cart/addDB", async (payload, { rejectWithValue }) => {
  try {
    const res = await cartService.addItem(payload);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCartItemDB = createAsyncThunk("cart/updateDB", async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartService.updateItem(itemId, quantity);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const removeCartItemDB = createAsyncThunk("cart/removeDB", async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartService.removeItem(itemId);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const mergeGuestCartIntoDB = createAsyncThunk("cart/merge", async (_, { rejectWithValue }) => {
  try {
    const guestItems = readGuestCart();
    if (guestItems.length === 0) {
      const res = await cartService.getCart();
      return res.data.data.cart;
    }
    const res = await cartService.mergeCart(guestItems);
    writeGuestCart([]);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: { items: [] },
    guestItems: readGuestCart(),
    status: "idle",
    error: null,
  },
  reducers: {
    // Guest (not logged-in) cart operations — persisted to localStorage
    addGuestItem: (state, action) => {
      const item = action.payload; // { productId, product, variantId, size, color, quantity, priceAtAdd }
      const existing = state.guestItems.find(
        (i) =>
          i.productId === item.productId &&
          String(i.variantId || "") === String(item.variantId || "") &&
          i.size === item.size &&
          i.color === item.color
      );
      if (existing) existing.quantity += item.quantity;
      else state.guestItems.push(item);
      writeGuestCart(state.guestItems);
    },
    updateGuestItem: (state, action) => {
      const { index, quantity } = action.payload;
      if (state.guestItems[index]) state.guestItems[index].quantity = quantity;
      writeGuestCart(state.guestItems);
    },
    removeGuestItem: (state, action) => {
      state.guestItems.splice(action.payload, 1);
      writeGuestCart(state.guestItems);
    },
    clearGuestCart: (state) => {
      state.guestItems = [];
      writeGuestCart([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addToCartDB.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItemDB.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItemDB.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(mergeGuestCartIntoDB.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.guestItems = [];
      });
  },
});

export const { addGuestItem, updateGuestItem, removeGuestItem, clearGuestCart } = cartSlice.actions;
export default cartSlice.reducer;
