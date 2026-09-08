import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { Home, Grid3x3, Heart, ShoppingBag, User } from "lucide-react";
import { useCartTotals } from "../../hooks/useCartTotals.js";

const AnimatedBadge = ({ count }) => {
  const [pop, setPop] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 350);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  if (!count) return null;
  return (
    <span className={`absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[9px] flex items-center justify-center ${pop ? "badge-pop" : ""}`}>
      {count}
    </span>
  );
};

// Fixed bottom navigation for mobile — the primary way users move around the
// app on small screens, since the top navbar's category links are hidden there.
const MobileTabBar = () => {
  const { itemCount } = useCartTotals();
  const wishlistCount = useSelector((state) => state.wishlist.wishlist.products.length);

  const items = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/shop", label: "Shop", icon: Grid3x3 },
    { to: "/wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
    { to: "/cart", label: "Cart", icon: ShoppingBag, badge: itemCount },
    { to: "/account/profile", label: "Account", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-14">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 relative ${isActive ? "text-ink" : "text-muted"}`
            }
          >
            <div className="relative">
              <item.icon size={21} strokeWidth={2} />
              {item.badge > 0 && <AnimatedBadge count={item.badge} />}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileTabBar;
