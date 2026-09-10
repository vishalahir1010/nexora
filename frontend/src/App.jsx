import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRoute from "./components/common/AdminRoute.jsx";

import Home from "./pages/Home/Home.jsx";
import Shop from "./pages/Shop/Shop.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Search from "./pages/Search/Search.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";

import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";

import AccountLayout from "./pages/Profile/AccountLayout.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import ChangePassword from "./pages/Profile/ChangePassword.jsx";
import Addresses from "./pages/Profile/Addresses.jsx";
import Notifications from "./pages/Profile/Notifications.jsx";
import OrderList from "./pages/Orders/OrderList.jsx";
import OrderDetails from "./pages/Orders/OrderDetails.jsx";

import Dashboard from "./pages/Admin/Dashboard.jsx";
import ProductList from "./pages/Admin/ProductList.jsx";
import ProductForm from "./pages/Admin/ProductForm.jsx";
import CategoryManagement from "./pages/Admin/CategoryManagement.jsx";
import OrderManagement from "./pages/Admin/OrderManagement.jsx";
import UserManagement from "./pages/Admin/UserManagement.jsx";
import CouponManagement from "./pages/Admin/CouponManagement.jsx";
import Analytics from "./pages/Admin/Analytics.jsx";
import BulkImport from "./pages/Admin/BulkImport.jsx";


import { fetchMe } from "./redux/slices/authSlice.js";
import { fetchCart } from "./redux/slices/cartSlice.js";
import { fetchWishlist } from "./redux/slices/wishlistSlice.js";
import { fetchCategories, fetchBrands } from "./redux/slices/categorySlice.js";

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<AccountLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/import" element={<BulkImport />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="font-display text-6xl font-bold">404</h1>
    <p className="text-muted mt-2">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn-primary mt-6">Back to Home</a>
  </div>
);

export default App;
