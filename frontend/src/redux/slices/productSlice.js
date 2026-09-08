import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "../../services/productService.js";
import { getErrorMessage } from "../../services/api.js";

export const fetchProducts = createAsyncThunk("products/fetch", async (params, { rejectWithValue }) => {
  try {
    const res = await productService.getProducts(params);
    return { products: res.data.data.products, pagination: res.data.pagination };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProductBySlug = createAsyncThunk("products/fetchOne", async (slug, { rejectWithValue }) => {
  try {
    const res = await productService.getProductBySlug(slug);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, pages: 1 },
    current: null,
    related: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.current = null;
      state.related = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload.product;
        state.related = action.payload.related;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
