import { useSelector } from "react-redux";
import { useAuth } from "./useAuth.js";

// Works for both DB cart (logged-in) and guest cart (localStorage), giving
// components a single consistent shape to render regardless of auth state.
export const useCartTotals = () => {
  const { isAuthenticated } = useAuth();
  const { cart, guestItems } = useSelector((state) => state.cart);

  const items = isAuthenticated
    ? cart.items.map((item) => ({
        id: item._id,
        product: item.product,
        variantId: item.variantId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.priceAtAdd,
      }))
    : guestItems.map((item, index) => ({
        id: index,
        product: item.product,
        variantId: item.variantId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.priceAtAdd,
      }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
};
