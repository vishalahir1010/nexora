import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isMobileMenuOpen: false,
    isCartDrawerOpen: false,
  },
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setCartDrawerOpen: (state, action) => {
      state.isCartDrawerOpen = action.payload;
    },
  },
});

export const { toggleMobileMenu, setCartDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
