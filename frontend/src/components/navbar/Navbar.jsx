import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Home,
  Grid3x3,
  Package,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth.js";
import { useCartTotals } from "../../hooks/useCartTotals.js";
import { debounce } from "../../utils/format.js";
import { productService } from "../../services/productService.js";
import { logout } from "../../redux/slices/authSlice.js";
import { formatPrice } from "../../utils/format.js";

// ============================================================
// CATEGORY LINKS
// ============================================================

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

// ============================================================
// NAVBAR
// ============================================================

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useAuth();
  const { itemCount, subtotal } = useCartTotals();

  const wishlistCount = useSelector(
    (state) => state.wishlist.wishlist.products.length,
  );

  // ----------------------------------------------------------
  // STATES
  // ----------------------------------------------------------

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });

  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef(null);

  // ----------------------------------------------------------
  // CLOSE ACCOUNT DROPDOWN WHEN CLICKING OUTSIDE
  // ----------------------------------------------------------

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // ----------------------------------------------------------
  // LOCK PAGE SCROLL WHEN MOBILE MENU IS OPEN
  // ----------------------------------------------------------

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ----------------------------------------------------------
  // SEARCH SUGGESTIONS
  // ----------------------------------------------------------

  const fetchSuggestions = useRef(
    debounce(async (q) => {
      if (!q || q.length < 2) {
        setSuggestions({
          products: [],
          categories: [],
        });

        return;
      }

      try {
        const res = await productService.getSuggestions(q);

        setSuggestions(res.data.data);
      } catch {
        setSuggestions({
          products: [],
          categories: [],
        });
      }
    }, 350),
  ).current;

  // ----------------------------------------------------------
  // SEARCH CHANGE
  // ----------------------------------------------------------

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setQuery(value);

    fetchSuggestions(value);
  };

  // ----------------------------------------------------------
  // SEARCH SUBMIT
  // ----------------------------------------------------------

  const submitSearch = (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query.trim())}`);

    setSearchOpen(false);
    setQuery("");
  };

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout = () => {
    dispatch(logout());

    setAccountOpen(false);
    setMobileOpen(false);

    navigate("/");
  };

  // ----------------------------------------------------------
  // MOBILE NAVIGATION
  // ----------------------------------------------------------

  const MOBILE_NAV = [
    {
      to: "/",
      label: "Home",
      icon: Home,
    },
    {
      to: "/shop",
      label: "Shop",
      icon: Grid3x3,
    },
    {
      to: "/wishlist",
      label: "Wishlist",
      icon: Heart,
      badge: wishlistCount,
    },
    {
      to: isAuthenticated ? "/account/orders" : "/login",

      label: isAuthenticated ? "My Orders" : "Login / Register",

      icon: Package,
    },
  ];

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <>
      {/* ======================================================
          MAIN NAVBAR
          
          IMPORTANT:
          Navbar is fixed.
          overflow-x-hidden has intentionally been removed.
      ====================================================== */}

      <header
        className="
          fixed
          top-0
          left-0
          right-0
          z-40
          bg-white/95
          backdrop-blur
          border-b
          border-gray-100
        "
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div
            className="
              flex
              items-center
              justify-between
              h-16
              gap-2
              sm:gap-4
            "
          >
            {/* ==================================================
                LEFT
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-1.5
                sm:gap-3
                shrink-0
                min-w-0
              "
            >
              {/* MOBILE MENU BUTTON */}

              <button
                type="button"
                className="
                  lg:hidden
                  tap-target
                  -ml-2
                  shrink-0
                "
                onClick={() => {
                  setAccountOpen(false);
                  setMobileOpen(true);
                }}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              {/* LOGO */}

              <Link
                to="/"
                className="
                  font-display
                  text-lg
                  sm:text-2xl
                  font-bold
                  tracking-tight
                  shrink-0
                "
              >
                NEXORA
              </Link>
            </div>

            {/* ==================================================
                DESKTOP CATEGORY NAVIGATION
            ================================================== */}

            <nav
              className="
                hidden
                lg:flex
                items-center
                gap-7
              "
            >
              {CATEGORY_LINKS.map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="
                    text-sm
                    font-medium
                    text-ink/80
                    hover:text-ink
                    transition-colors
                    whitespace-nowrap
                  "
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* ==================================================
                RIGHT
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-0.5
                sm:gap-1.5
                md:gap-3
                shrink-0
              "
            >
              {/* ==================================================
                  DESKTOP SEARCH
              ================================================== */}

              <div className="relative hidden sm:block">
                {searchOpen ? (
                  <form onSubmit={submitSearch} className="flex items-center">
                    <input
                      autoFocus
                      value={query}
                      onChange={handleSearchChange}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                      placeholder="Search products, brands..."
                      className="
                        w-64
                        md:w-80
                        px-4
                        py-2
                        rounded-full
                        border
                        border-gray-300
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-ink/20
                      "
                    />

                    {/* SEARCH SUGGESTIONS */}

                    {(suggestions.products.length > 0 ||
                      suggestions.categories.length > 0) &&
                      query && (
                        <div
                          className="
                            absolute
                            top-11
                            left-0
                            w-full
                            bg-white
                            rounded-xl
                            shadow-cardHover
                            border
                            border-gray-100
                            py-2
                            max-h-80
                            overflow-auto
                          "
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {suggestions.products.map((product) => (
                            <Link
                              key={product._id}
                              to={`/product/${product.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="
                                  flex
                                  items-center
                                  gap-3
                                  px-4
                                  py-2
                                  hover:bg-gray-50
                                  min-w-0
                                "
                            >
                              <img
                                src={product.images?.[0]?.url}
                                alt=""
                                className="
                                    h-9
                                    w-9
                                    rounded-lg
                                    object-cover
                                    shrink-0
                                  "
                              />

                              <span className="text-sm truncate">
                                {product.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="tap-target"
                    aria-label="Search"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              {/* ==================================================
                  MOBILE SEARCH
              ================================================== */}

              <Link
                to="/search"
                className="
                  tap-target
                  sm:hidden
                "
                aria-label="Search"
              >
                <Search size={20} />
              </Link>

              {/* ==================================================
                  ACCOUNT
              ================================================== */}

              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setAccountOpen((open) => !open);
                  }}
                  className="tap-target"
                  aria-label="Account"
                >
                  <User size={20} />
                </button>

                {accountOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-11
                      w-52
                      bg-white
                      rounded-xl
                      shadow-cardHover
                      border
                      border-gray-100
                      py-2
                    "
                  >
                    {isAuthenticated ? (
                      <>
                        <div
                          className="
                            px-4
                            py-2
                            text-xs
                            text-muted
                            border-b
                            border-gray-100
                            mb-1
                          "
                        >
                          Hi, {user?.name?.split(" ")[0]}
                        </div>

                        <Link
                          to="/account/profile"
                          onClick={() => setAccountOpen(false)}
                          className="
                            block
                            px-4
                            py-2
                            text-sm
                            hover:bg-gray-50
                          "
                        >
                          My Profile
                        </Link>

                        <Link
                          to="/account/orders"
                          onClick={() => setAccountOpen(false)}
                          className="
                            block
                            px-4
                            py-2
                            text-sm
                            hover:bg-gray-50
                          "
                        >
                          My Orders
                        </Link>

                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="
                              block
                              px-4
                              py-2
                              text-sm
                              hover:bg-gray-50
                            "
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="
                            w-full
                            text-left
                            px-4
                            py-2
                            text-sm
                            text-accent
                            hover:bg-gray-50
                            border-t
                            border-gray-100
                            mt-1
                          "
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setAccountOpen(false)}
                          className="
                            block
                            px-4
                            py-2
                            text-sm
                            hover:bg-gray-50
                          "
                        >
                          Login
                        </Link>

                        <Link
                          to="/register"
                          onClick={() => setAccountOpen(false)}
                          className="
                            block
                            px-4
                            py-2
                            text-sm
                            hover:bg-gray-50
                          "
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ==================================================
                  DESKTOP WISHLIST
              ================================================== */}

              <Link
                to="/wishlist"
                className="
                  relative
                  p-2
                  hidden
                  md:block
                "
                aria-label="Wishlist"
              >
                <Heart size={20} />

                {wishlistCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-0.5
                      -right-0.5
                      h-4
                      w-4
                      rounded-full
                      bg-accent
                      text-white
                      text-[10px]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* ==================================================
                  DESKTOP CART
              ================================================== */}

              <Link
                to="/cart"
                className="
                  relative
                  p-2
                  hidden
                  md:block
                "
                aria-label="Cart"
              >
                <ShoppingBag size={20} />

                {itemCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-0.5
                      -right-0.5
                      h-4
                      w-4
                      rounded-full
                      bg-accent
                      text-white
                      text-[10px]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MOBILE DRAWER

          IMPORTANT:
          Drawer is OUTSIDE the header.

          This is the main fix.
      ======================================================== */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            lg:hidden
          "
        >
          {/* ====================================================
              BACKDROP
          ==================================================== */}

          <div
            className="
              absolute
              inset-0
              bg-black/60
              backdrop-blur-[2px]
            "
            onClick={() => setMobileOpen(false)}
          />

          {/* ====================================================
              SIDE DRAWER
          ==================================================== */}

          <aside
            className="
              absolute
              left-0
              top-0
              h-[100dvh]
              w-80
              max-w-[85vw]
              bg-white
              shadow-2xl
              flex
              flex-col
              overflow-hidden
            "
          >
            {/* ==================================================
                DRAWER HEADER
            ================================================== */}

            <div
              className="
                h-16
                shrink-0
                flex
                items-center
                justify-between
                px-5
                border-b
                border-gray-100
                bg-white
              "
            >
              <span
                className="
                  font-display
                  text-xl
                  font-bold
                "
              >
                NEXORA
              </span>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="
                  tap-target
                  -mr-2
                "
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* ==================================================
                DRAWER SCROLLABLE AREA

                ONLY THIS AREA SCROLLS.
            ================================================== */}

            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                overscroll-contain
              "
            >
              {/* ==================================================
                  ACCOUNT
              ================================================== */}

              <Link
                to={isAuthenticated ? "/account/profile" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="
                  flex
                  items-center
                  gap-3
                  mx-4
                  mt-3
                  p-3
                  rounded-2xl
                  bg-gray-50
                  hover:bg-gray-100
                  transition-colors
                "
              >
                <div
                  className="
                    h-10
                    w-10
                    rounded-full
                    bg-ink
                    text-white
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <User size={19} />
                </div>

                <div
                  className="
                    flex-1
                    min-w-0
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      truncate
                    "
                  >
                    {isAuthenticated ? user?.name : "Guest"}
                  </p>

                  <p
                    className="
                      text-xs
                      text-muted
                      truncate
                    "
                  >
                    {isAuthenticated
                      ? user?.email
                      : "Sign in for the best experience"}
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="
                    text-muted
                    shrink-0
                  "
                />
              </Link>

              {/* ==================================================
                  MOBILE NAV
              ================================================== */}

              <nav className="px-2 mt-3">
                {MOBILE_NAV.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        text-sm
                        font-medium
                        hover:bg-gray-50
                        transition-colors
                      "
                    >
                      <Icon
                        size={18}
                        className="
                          text-ink/70
                          shrink-0
                        "
                      />

                      <span className="flex-1">{item.label}</span>

                      {item.badge > 0 && (
                        <span
                          className="
                            h-5
                            min-w-5
                            px-1.5
                            rounded-full
                            bg-accent
                            text-white
                            text-[11px]
                            flex
                            items-center
                            justify-center
                          "
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* ==================================================
                  CATEGORY TITLE
              ================================================== */}

              <div className="px-5 mt-4">
                <p
                  className="
                    text-xs
                    font-semibold
                    text-muted
                    uppercase
                    tracking-wide
                  "
                >
                  Shop by Category
                </p>
              </div>

              {/* ==================================================
                  CATEGORIES

                  2 COLUMN MOBILE GRID
              ================================================== */}

              <nav
                className="
                  grid
                  grid-cols-2
                  gap-1.5
                  px-3
                  mt-2
                  pb-4
                "
              >
                {CATEGORY_LINKS.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/shop?category=${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="
                      flex
                      items-center
                      px-3
                      py-3
                      rounded-xl
                      text-sm
                      hover:bg-gray-50
                      transition-colors
                      min-w-0
                    "
                  >
                    <span className="truncate">{category.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* ==================================================
                DRAWER FOOTER

                DOES NOT SCROLL.
            ================================================== */}

            <div
              className="
                shrink-0
                border-t
                border-gray-100
                p-3
                bg-white
              "
            >
              {itemCount > 0 ? (
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="
                    btn-primary
                    w-full
                    !justify-between
                    !px-4
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <ShoppingBag size={16} />
                    View Cart ({itemCount})
                  </span>

                  <span>{formatPrice(subtotal)}</span>
                </Link>
              ) : (
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="
                    btn-secondary
                    w-full
                  "
                >
                  Start Shopping
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
