import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard, Package, Tags, Award, ShoppingCart, Users, TicketPercent, BarChart3, LogOut, Menu, X,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice.js";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/brands", label: "Brands", icon: Award },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const SidebarContent = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <div className="p-6 font-display text-xl font-bold border-b border-white/10">NEXORA Admin</div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => {
          dispatch(logout());
          navigate("/");
        }}
        className="flex items-center gap-3 px-6 py-4 text-sm text-white/60 hover:text-white border-t border-white/10"
      >
        <LogOut size={17} /> Logout
      </button>
    </>
  );
};

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const currentLabel = NAV_ITEMS.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label || "Admin";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 bg-ink text-white hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar + slide-in drawer */}
      <div className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-30 bg-ink text-white flex items-center gap-3 px-4 h-14">
          <button onClick={() => setDrawerOpen(true)} className="tap-target -ml-2" aria-label="Open admin menu">
            <Menu size={22} />
          </button>
          <span className="font-medium text-sm">{currentLabel}</span>
        </div>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-ink text-white flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <span className="font-display text-lg font-bold">NEXORA Admin</span>
                <button onClick={() => setDrawerOpen(false)} className="tap-target -mr-2" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
