import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { adminService } from "../../services/adminService.js";
import { formatPrice } from "../../utils/format.js";
import Loader from "../../components/common/Loader.jsx";

const COLORS = ["#0f1115", "#c8102e", "#b8860b", "#6b7280", "#1e3a5f", "#5f6b3a"];

const Analytics = () => {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    adminService.getAnalytics(range).then((res) => setData(res.data.data));
  }, [range]);

  if (!data) return <Loader full />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Analytics</h1>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="input-field max-w-[160px]">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.salesByDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatPrice(v)} />
            <Line type="monotone" dataKey="revenue" stroke="#0f1115" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Top Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topProducts.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatPrice(v)} />
              <Bar dataKey="revenue" fill="#0f1115" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                {data.ordersByStatus.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
