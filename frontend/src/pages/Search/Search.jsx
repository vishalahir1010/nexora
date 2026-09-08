import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { SearchX, Search as SearchIcon, X } from "lucide-react";
import { productService } from "../../services/productService.js";
import ProductCard from "../../components/product/ProductCard.jsx";
import ProductCardSkeleton from "../../components/product/ProductCardSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { debounce } from "../../utils/format.js";

const RECENT_KEY = "nexora_recent_searches";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";

  // This page previously had no text input at all — on mobile, where the
  // navbar's inline search box is hidden and tapping the search icon lands
  // here directly, there was literally no way to type a new query. This
  // input is the fix, and it also carries live suggestions like the navbar's
  // desktop search does, so mobile isn't a second-class experience.
  const [inputValue, setInputValue] = useState(q);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY)) || []);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    setInputValue(q);
    if (!q) {
      setLoading(false);
      return;
    }
    setLoading(true);
    productService.getProducts({ keyword: q }).then((res) => {
      setProducts(res.data.data.products);
      setLoading(false);

      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const updated = [q, ...stored.filter((s) => s !== q)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecent(updated);
    });
  }, [q]);

  const fetchSuggestions = useState(() =>
    debounce(async (value) => {
      if (!value || value.trim().length < 2) return setSuggestions({ products: [], categories: [] });
      try {
        const res = await productService.getSuggestions(value);
        setSuggestions(res.data.data);
      } catch {
        setSuggestions({ products: [], categories: [] });
      }
    }, 300)
  )[0];

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    fetchSuggestions(e.target.value);
  };

  const submitSearch = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    setShowSuggestions(false);
    setSearchParams({ q: inputValue.trim() });
  };

  const clearSearch = () => {
    setInputValue("");
    setSuggestions({ products: [], categories: [] });
    setSearchParams({});
  };

  const removeRecent = (term, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recent.filter((t) => t !== term);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Search input — always visible on this page now, on every screen size */}
      <form onSubmit={submitSearch} className="relative max-w-xl mb-8">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          autoFocus
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search products, brands, categories..."
          className="input-field !pl-11 !pr-11"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 tap-target"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        {showSuggestions && inputValue && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-cardHover border border-gray-100 py-2 max-h-80 overflow-auto z-20">
            {suggestions.categories.map((c) => (
              <Link
                key={c._id}
                to={`/shop?category=${c.slug}`}
                onClick={() => setShowSuggestions(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-muted"
              >
                <SearchIcon size={14} /> {c.name} <span className="text-xs">in Categories</span>
              </Link>
            ))}
            {suggestions.products.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p.slug}`}
                onClick={() => setShowSuggestions(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
              >
                <img src={p.images?.[0]?.url} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                <span className="text-sm line-clamp-1">{p.name}</span>
              </Link>
            ))}
          </div>
        )}
      </form>

      {!q ? (
        <div className="max-w-xl">
          {recent.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-muted mb-3">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <Link
                    key={term}
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-sm hover:border-ink"
                  >
                    {term}
                    <button onClick={(e) => removeRecent(term, e)} aria-label={`Remove ${term}`}>
                      <X size={13} className="text-muted" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Start typing to search products, brands, and categories.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-6">{loading ? "Searching..." : `${products.length} products found for "${q}"`}</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No results found"
              description={`We couldn't find anything matching "${q}". Try a different search term.`}
              action={<Link to="/shop" className="btn-secondary">Browse All Products</Link>}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
