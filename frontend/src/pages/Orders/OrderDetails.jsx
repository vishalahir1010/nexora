import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Check, Package, X } from "lucide-react";
import { fetchOrderById } from "../../redux/slices/orderSlice.js";
import { orderService } from "../../services/orderService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import Loader from "../../components/common/Loader.jsx";
import OrderStatusBadge from "../../components/common/OrderStatusBadge.jsx";
import { getErrorMessage } from "../../services/api.js";

const TIMELINE_STEPS = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
const TIMELINE_LABELS = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, status } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderService.cancelOrder(id, "Cancelled by customer");
      toast.success("Order cancelled");
      dispatch(fetchOrderById(id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (status === "loading" || !order) return <Loader full />;

  const isCancelled = order.orderStatus === "cancelled";
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.orderStatus);
  const canCancel = !["shipped", "out_for_delivery", "delivered", "cancelled", "returned"].includes(order.orderStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="section-title">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.orderStatus} />
      </div>
      <p className="text-sm text-muted mb-8">Placed on {formatDate(order.createdAt)}</p>

      {/* Tracking timeline */}
      {!isCancelled && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold mb-6">Order Tracking</h2>
          <div className="flex items-start">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentStepIndex ? "bg-green-600" : "bg-gray-200"}`} />
                )}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 text-xs font-semibold ${
                  i <= currentStepIndex ? "bg-green-600 text-white" : "bg-gray-100 text-muted"
                }`}>
                  {i <= currentStepIndex ? <Check size={14} /> : i + 1}
                </div>
                <p className={`text-[11px] mt-2 text-center ${i <= currentStepIndex ? "font-medium" : "text-muted"}`}>
                  {TIMELINE_LABELS[step]}
                </p>
              </div>
            ))}
          </div>
          {order.estimatedDelivery && (
            <p className="text-xs text-muted text-center mt-6">
              Estimated delivery: {formatDate(order.estimatedDelivery)}
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4 items-center border-b border-gray-100 pb-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{item.color && `${item.color} · `}{item.size && `Size ${item.size} · `}Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {canCancel && (
            <button onClick={handleCancel} className="btn-secondary mt-6 text-accent border-accent/30">
              <X size={15} /> Cancel Order
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Shipping Address</h3>
            <p className="text-sm text-muted">
              {order.shippingAddress?.fullName}<br />
              {order.shippingAddress?.line1}, {order.shippingAddress?.line2 && `${order.shippingAddress.line2}, `}
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              {order.shippingAddress?.phone}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Payment Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted"><span>Items</span><span>{formatPrice(order.itemsPrice)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-muted"><span>Shipping</span><span>{order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}</span></div>
              <div className="flex justify-between text-muted"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
              <div className="flex justify-between font-semibold pt-2 border-t border-gray-100 mt-2">
                <span>Total</span><span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
            <p className="text-xs text-muted mt-3 capitalize">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
