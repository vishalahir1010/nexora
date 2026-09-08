import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Zap, Star } from "lucide-react";
import { productService, categoryService, brandService } from "../../services/productService.js";
import ProductCard from "../../components/product/ProductCard.jsx";
import ProductCardSkeleton from "../../components/product/ProductCardSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import BrandStrip from "../../components/common/BrandStrip.jsx";

const useProductSection = (params) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    productService
      .getProducts(params)
      .then((res) => {
        if (active) setProducts(res.data.data.products);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { products, loading };
};

const ProductRow = ({ title, subtitle, params, viewAllHref, bg = "white" }) => {
  const { products, loading } = useProductSection(params);

  return (
    <section className={`${bg === "gray" ? "bg-gray-50/60" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          <Link to={viewAllHref} className="hidden sm:flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="Nothing here yet" description="Check back soon for new products." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        <div className="sm:hidden mt-6 text-center">
          <Link to={viewAllHref} className="text-sm font-medium inline-flex items-center gap-1">
            View all <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Dedicated Flash Sale block — dark background so it reads as an urgent,
// distinct moment on the page rather than just another product row.
const FlashSaleSection = () => {
  const { products, loading } = useProductSection({ flashSale: "true", limit: 8 });

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-accent fill-accent" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">Flash Sale</h2>
              <p className="text-sm text-white/50">Deep discounts, while stock lasts</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] !bg-white/10" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/shop?flashSale=true" className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:gap-2.5 transition-all">
            View all flash deals <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data.data.categories));
    brandService.getBrands().then((res) => setBrands(res.data.data.brands));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-4">New Season Arrivals</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              Premium style,<br />delivered daily.
            </h1>
            <p className="mt-5 text-muted text-base md:text-lg max-w-md">
              Discover fashion, electronics, watches and lifestyle essentials — curated with an eye for quality.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/shop?flashSale=true" className="btn-secondary">
                Flash Sale
              </Link>
            </div>

            {/* Trust indicator strip — general, non-fabricated phrasing (no
                invented exact stats) so it stays honest as the store grows */}
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-xs text-muted font-medium">Loved by shoppers across India</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-cardHover">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format"
              alt="Featured collection"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, label: "Free Shipping ₹999+" },
            { icon: RotateCcw, label: "7-Day Easy Returns" },
            { icon: ShieldCheck, label: "Secure Checkout" },
            { icon: Headphones, label: "24/7 Support" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <b.icon size={22} className="text-ink shrink-0" />
              <span className="text-sm font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <h2 className="section-title mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link key={c._id} to={`/shop?category=${c.slug}`} className="group relative aspect-square rounded-2xl overflow-hidden">
              <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-semibold text-sm">{c.name}</span>
              <span className="absolute bottom-4 left-4 translate-y-5 opacity-0 group-hover:translate-y-[1.65rem] group-hover:opacity-100 text-white/80 text-xs transition-all duration-300">
                Shop now →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Trending Now" subtitle="Popular picks this week" params={{ sort: "popularity", limit: 8 }} viewAllHref="/shop?sort=popularity" bg="gray" />
      <ProductRow title="New Arrivals" subtitle="Just landed" params={{ newArrival: "true", limit: 8 }} viewAllHref="/shop?newArrival=true" bg="white" />

      <FlashSaleSection />

      <ProductRow title="Best Sellers" subtitle="Customer favorites" params={{ bestseller: "true", limit: 8 }} viewAllHref="/shop?bestseller=true" bg="white" />

      <BrandStrip brands={brands} />

      {/* Newsletter */}
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2">Stay in the loop</h2>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Subscribe for early access to new arrivals, exclusive offers, and style edits.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-ink text-sm focus:outline-none"
            />
            <button className="bg-white text-ink px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
