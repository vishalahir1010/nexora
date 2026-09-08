import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Clock } from "lucide-react";
import { adminService } from "../../services/adminService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import Loader from "../../components/common/Loader.jsx";
import OrderStatusBadge from "../../components/common/OrderStatusBadge.jsx";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then((res) => setData(res.data.data));
  }, []);

  if (!data) return <Loader full />;

  const cards = [
    { label: "Total Revenue", value: formatPrice(data.totalRevenue), icon: DollarSign },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingCart },
    { label: "Total Customers", value: data.totalCustomers, icon: Users },
    { label: "Total Products", value: data.totalProducts, icon: Package },
    { label: "Pending Orders", value: data.pendingOrders, icon: Clock },
    { label: "Low Stock Items", value: data.lowStockProducts, icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="section-title mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <c.icon size={18} className="text-muted" />
            </div>
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-xs text-muted mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-muted hover:text-ink">View all</Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-gray-100">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50">
                  <td className="py-3">{o.orderNumber}</td>
                  <td className="py-3">{o.user?.name}</td>
                  <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="py-3">{formatPrice(o.totalPrice)}</td>
                  <td className="py-3"><OrderStatusBadge status={o.orderStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
