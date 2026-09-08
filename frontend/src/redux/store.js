import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import cartReducer from "./slices/cartSlice.js";
import wishlistReducer from "./slices/wishlistSlice.js";
import productReducer from "./slices/productSlice.js";
import categoryReducer from "./slices/categorySlice.js";
import orderReducer from "./slices/orderSlice.js";
import uiReducer from "./slices/uiSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    categories: categoryReducer,
    orders: orderReducer,
    ui: uiReducer,
  },
});
