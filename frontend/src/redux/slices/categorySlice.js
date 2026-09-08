import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService, brandService } from "../../services/productService.js";
import { getErrorMessage } from "../../services/api.js";

export const fetchCategories = createAsyncThunk("categories/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await categoryService.getCategories();
    return res.data.data.categories;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchBrands = createAsyncThunk("categories/fetchBrands", async (_, { rejectWithValue }) => {
  try {
    const res = await brandService.getBrands();
    return res.data.data.brands;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const categorySlice = createSlice({
  name: "categories",
  initialState: { list: [], brands: [], status: "idle" },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export default categorySlice.reducer;
