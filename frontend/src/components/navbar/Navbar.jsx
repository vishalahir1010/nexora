import { useState, useEffect, useRef } from "react";import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useCartTotals } from "../../hooks/useCartTotals.js";
import { debounce } from "../../utils/format.js";
import { productService } from "../../services/productService.js";
import { logout } from "../../redux/slices/authSlice.js";

const CATEGORY_LINKS = [
  { name: "Men", slug: "mens-clothing" },
  { name: "Women", slug: "womens-clothing" },
  { name: "Shoes", slug: "shoes" },
  { name: "Accessories", slug: "accessories" },
  { name: "Electronics", slug: "electronics" },
  { name: "Watches", slug: "watches" },
  { name: "Beauty", slug: "beauty" },
  { name: "Home & Lifestyle", slug: "home-lifestyle" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCartTotals();
  const wishlistCount = useSelector((state) => state.wishlist.wishlist.products.length);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock background scroll while the mobile drawer is open — without this the
  // page behind the drawer could still scroll on touch, which feels broken.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const fetchSuggestions = useRef(
    debounce(async (q) => {
      if (!q || q.length < 2) return setSuggestions({ products: [], categories: [] });
      try {
        const res = await productService.getSuggestions(q);
        setSuggestions(res.data.data);
      } catch {
        setSuggestions({ products: [], categories: [] });
      }
    }, 350)
  ).current;

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  const handleLogout = () => {
    dispatch(logout());
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              className="lg:hidden tap-target -ml-2"
              onClick={() => { setAccountOpen(false); setMobileOpen(true); }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="font-display text-xl sm:text-2xl font-bold tracking-tight shrink-0">
              NEXORA
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-7">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="text-sm font-medium text-ink/80 hover:text-ink transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1.5 md:gap-3 shrink-0">
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={submitSearch} className="flex items-center">
                  <input
                    autoFocus
                    value={query}
                    onChange={handleSearchChange}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    placeholder="Search products, brands..."
                    className="w-64 md:w-80 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                  />
                  {(suggestions.products.length > 0 || suggestions.categories.length > 0) && query && (
                    <div
                      className="absolute top-11 left-0 w-full bg-white rounded-xl shadow-cardHover border border-gray-100 py-2 max-h-80 overflow-auto"
                      // onMouseDown fires before the input's onBlur, so this prevents
                      // the dropdown from unmounting mid-tap on touch devices — without
                      // this, tapping a suggestion on a touchscreen could close the list
                      // before the click/navigation had a chance to register.
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {suggestions.products.map((p) => (
                        <Link
                          key={p._id}
                          to={`/product/${p.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 min-w-0"
                        >
                          <img src={p.images?.[0]?.url} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                          <span className="text-sm truncate">{p.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="tap-target" aria-label="Search">
                  <Search size={20} />
                </button>
              )}
            </div>
            <Link to="/search" className="tap-target sm:hidden" aria-label="Search">
              <Search size={20} />
            </Link>

            <div className="relative" ref={accountRef}>
              <button
                onClick={() => { setMobileOpen(false); setAccountOpen((o) => !o); }}
                className="tap-target"
                aria-label="Account"
              >
                <User size={20} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-cardHover border border-gray-100 py-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-xs text-muted border-b border-gray-100 mb-1">
                        Hi, {user?.name?.split(" ")[0]}
                      </div>
                      <Link to="/account/profile" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                        My Profile
                      </Link>
                      <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                        My Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/admin" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-accent hover:bg-gray-50 border-t border-gray-100 mt-1"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Login
                      </Link>
                      <Link to="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/wishlist" className="relative p-2 hidden md:block" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 hidden md:block" aria-label="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white p-5 overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-xl font-bold">NEXORA</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {CATEGORY_LINKS.map((c) => (
                <Link
                  key={c.slug}
                  to={`/shop?category=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-medium border-b border-gray-100"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
