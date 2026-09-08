import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { orderService } from "../../services/orderService.js";
import { getErrorMessage } from "../../services/api.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import Loader from "../../components/common/Loader.jsx";
import OrderStatusBadge from "../../components/common/OrderStatusBadge.jsx";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    orderService.getAllOrdersAdmin({ search: search || undefined, status: statusFilter || undefined }).then((res) => {
      setOrders(res.data.data.orders);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      toast.success("Order status updated");
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="section-title mb-6">Order Management</h1>

      <div className="flex gap-3 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="input-field max-w-xs"
          />
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-xs">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-gray-100">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50">
                  <td className="p-4">{o.orderNumber}</td>
                  <td className="p-4">{o.user?.name}<br /><span className="text-xs text-muted">{o.user?.email}</span></td>
                  <td className="p-4 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="p-4">{formatPrice(o.totalPrice)}</td>
                  <td className="p-4 capitalize">{o.paymentStatus}</td>
                  <td className="p-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="input-field !py-1.5 !px-2 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
