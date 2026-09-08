import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useCartTotals } from "../../hooks/useCartTotals.js";
import { updateCartItemDB, removeCartItemDB, updateGuestItem, removeGuestItem } from "../../redux/slices/cartSlice.js";
import { formatPrice } from "../../utils/format.js";
import EmptyState from "../../components/common/EmptyState.jsx";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, subtotal, itemCount } = useCartTotals();

  const handleQuantityChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (isAuthenticated) {
      dispatch(updateCartItemDB({ itemId: item.id, quantity: newQty }));
    } else {
      dispatch(updateGuestItem({ index: item.id, quantity: newQty }));
    }
  };

  const handleRemove = (item) => {
    if (isAuthenticated) dispatch(removeCartItemDB(item.id));
    else dispatch(removeGuestItem(item.id));
    toast.success("Item removed");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to proceed to checkout");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start exploring our collection."
          action={<Link to="/shop" className="btn-primary">Start Shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="section-title mb-8">Shopping Cart ({itemCount})</h1>
      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-5">
              <Link to={`/product/${item.product?.slug}`} className="h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <img src={item.product?.images?.[0]?.url} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product?.slug}`} className="font-medium text-sm line-clamp-1">{item.product?.name}</Link>
                <p className="text-xs text-muted mt-1">
                  {item.color && `Color: ${item.color}`} {item.size && `· Size: ${item.size}`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button onClick={() => handleQuantityChange(item, -1)} className="tap-target"><Minus size={13} /></button>
                    <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, 1)} className="tap-target"><Plus size={13} /></button>
                  </div>
                  <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
              <button onClick={() => handleRemove(item)} className="text-muted hover:text-accent h-fit p-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="flex justify-between text-muted"><span>Tax</span><span>Calculated at checkout</span></div>
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-semibold">
            <span>Estimated Total</span><span>{formatPrice(subtotal)}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full mt-6">Proceed to Checkout</button>
          <Link to="/shop" className="block text-center text-sm text-muted mt-4 hover:text-ink">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
