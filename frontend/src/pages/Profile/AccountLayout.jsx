import { NavLink, Outlet } from "react-router-dom";
import { User, Package, MapPin, Bell, Lock } from "lucide-react";

const NAV = [
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/change-password", label: "Change Password", icon: Lock },
];

const AccountLayout = () => {
  return (
  <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
    {/* Mobile: horizontal scrollable tab strip so every section stays reachable
        without needing to type a URL directly — the old version hid this nav
        entirely below the md breakpoint. */}
    <nav className="flex md:hidden gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 border-b border-gray-100">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
              isActive ? "bg-ink text-white" : "bg-gray-100 text-ink/70"
            }`
          }
        >
          <item.icon size={14} /> {item.label}
        </NavLink>
      ))}
    </nav>

    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="hidden md:block">
        <nav className="space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive ? "bg-ink text-white font-medium" : "text-ink/70 hover:bg-gray-100"
                }`
              }
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  </div>
  );
};

export default AccountLayout;
