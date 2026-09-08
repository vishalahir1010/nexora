import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Package } from "lucide-react";
import { fetchMyOrders } from "../../redux/slices/orderSlice.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Loader from "../../components/common/Loader.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import OrderStatusBadge from "../../components/common/OrderStatusBadge.jsx";

const OrderList = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (status === "loading") return <Loader full />;
  if (status === "failed") return <ErrorState message={error} onRetry={() => dispatch(fetchMyOrders())} />;

  if (list.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={<Link to="/shop" className="btn-primary">Start Shopping</Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="section-title mb-6">My Orders</h1>
      <div className="space-y-4">
        {list.map((order) => (
          <Link key={order._id} to={`/account/orders/${order._id}`} className="card p-5 flex items-center justify-between block">
            <div>
              <p className="font-medium text-sm">{order.orderNumber}</p>
              <p className="text-xs text-muted mt-1">
                {order.items.length} item{order.items.length > 1 ? "s" : ""} · Placed {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm mb-1">{formatPrice(order.totalPrice)}</p>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
