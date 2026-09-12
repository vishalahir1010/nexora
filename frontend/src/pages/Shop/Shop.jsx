import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { productService, categoryService, brandService } from "../../services/productService.js";
import ProductCard from "../../components/product/ProductCard.jsx";
import ProductCardSkeleton from "../../components/product/ProductCardSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data.data.categories));
    brandService.getBrands().then((res) => setBrands(res.data.data.brands));
  }, []);

  const fetchProducts = useCallback(() => {
    setStatus("loading");
    const params = Object.fromEntries(searchParams.entries());
    productService
      .getProducts(params)
      .then((res) => {
        setProducts(res.data.data.products);
        setPagination(res.data.pagination);
        setStatus("succeeded");
      })
      .catch(() => setStatus("failed"));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === "" || value === null) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const toggleArrayParam = (key, value) => {
    const current = searchParams.getAll(key);
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => next.append(key, v));
    } else {
      [...current, value].forEach((v) => next.append(key, v));
    }
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const activeCategory = searchParams.get("category");
  const activeBrands = searchParams.getAll("brand");
  const activeSizes = searchParams.getAll("size");
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  const goToPage = (p) => updateParam("page", p);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Shop All</h1>
          <p className="text-sm text-muted mt-1">{pagination.total} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(true)} className="lg:hidden btn-secondary !py-2 !px-4">
            <SlidersHorizontal size={15} /> Filters
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none input-field !py-2 pr-9 text-sm cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className={`lg:block ${filtersOpen ? "fixed inset-0 z-50 bg-white flex flex-col" : "hidden"}`}>
          {filtersOpen && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 lg:hidden shrink-0">
              <span className="font-semibold">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="tap-target -mr-2"><X size={20} /></button>
            </div>
          )}

          <div className={filtersOpen ? "flex-1 overflow-y-auto px-6" : ""}>
            <FilterGroup title="Category">
              {categories.map((c) => (
                <label key={c._id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === c.slug}
                    onChange={() => updateParam("category", c.slug)}
                  />
                  {c.name}
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Brand">
              {brands.map((b) => (
                <label key={b._id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={activeBrands.includes(b._id)} onChange={() => toggleArrayParam("brand", b._id)} />
                  {b.name}
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Price Range">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={searchParams.get("minPrice") || ""}
                  onBlur={(e) => updateParam("minPrice", e.target.value)}
                  className="input-field !py-2 text-sm w-full"
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={searchParams.get("maxPrice") || ""}
                  onBlur={(e) => updateParam("maxPrice", e.target.value)}
                  className="input-field !py-2 text-sm w-full"
                />
              </div>
            </FilterGroup>

            <FilterGroup title="Rating">
              {[4, 3, 2, 1].map((r) => (
                <label key={r} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                  <input type="radio" name="rating" checked={searchParams.get("rating") === String(r)} onChange={() => updateParam("rating", r)} />
                  {r}★ & above
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Size">
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "6", "7", "8", "9", "10", "11"].map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleArrayParam("size", s)}
                    className={`h-8 px-3 rounded-lg border text-xs font-medium ${
                      activeSizes.includes(s) ? "bg-ink text-white border-ink" : "border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Availability">
              <label className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={searchParams.get("inStock") === "true"} onChange={(e) => updateParam("inStock", e.target.checked ? "true" : undefined)} />
                In Stock Only
              </label>
            </FilterGroup>

            <button onClick={clearFilters} className="text-sm text-accent font-medium mt-2 mb-4">Clear all filters</button>
          </div>

          {filtersOpen && (
            <div className="shrink-0 p-4 border-t border-gray-100 lg:hidden">
              <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full">
                Show {pagination.total} results
              </button>
            </div>
          )}
        </aside>

        <div>
          {status === "loading" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : status === "failed" ? (
            <ErrorState onRetry={fetchProducts} message="Couldn't load products right now." />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search terms." action={<button onClick={clearFilters} className="btn-secondary">Clear filters</button>} />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`h-9 w-9 rounded-full text-sm font-medium ${
                        page === i + 1 ? "bg-ink text-white" : "border border-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, children }) => (
  <div className="py-4 border-b border-gray-100">
    <p className="text-sm font-semibold mb-2">{title}</p>
    {children}
  </div>
);

export default Shop;