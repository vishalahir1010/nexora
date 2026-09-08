import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, Truck, RotateCcw, ShieldCheck, Minus, Plus, Check, Share2, ChevronRight } from "lucide-react";
import { fetchProductBySlug, clearCurrentProduct } from "../../redux/slices/productSlice.js";
import { addToCartDB, addGuestItem } from "../../redux/slices/cartSlice.js";
import { addToWishlist, removeFromWishlist } from "../../redux/slices/wishlistSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import { formatPrice, calcFinalPrice } from "../../utils/format.js";
import RatingStars from "../../components/common/RatingStars.jsx";
import ProductCard from "../../components/product/ProductCard.jsx";
import DeliveryChecker from "../../components/product/DeliveryChecker.jsx";
import FrequentlyBoughtTogether from "../../components/product/FrequentlyBoughtTogether.jsx";
import Loader from "../../components/common/Loader.jsx";
import ReviewSection from "./ReviewSection.jsx";

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { current: product, related, status } = useSelector((state) => state.products);
  const wishlistProducts = useSelector((state) => state.wishlist.wishlist.products);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const [justAdded, setJustAdded] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    window.scrollTo(0, 0);
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, slug]);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setSelectedColor(product.colors?.[0]?.name || null);
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [product]);

  if (status === "loading" || !product) return <Loader full />;

  const hasVariants = product.variants && product.variants.length > 0;
  const matchedVariant = hasVariants
    ? product.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
    : null;
  const availableStock = hasVariants ? (matchedVariant ? matchedVariant.stock : 0) : product.stock;
  const finalPrice = calcFinalPrice(matchedVariant?.priceOverride ?? product.price, product.discountPercent);
  const isWishlisted = wishlistProducts.some((p) => p._id === product._id);

  const availableSizesForColor = hasVariants
    ? [...new Set(product.variants.filter((v) => v.color === selectedColor).map((v) => v.size))]
    : [];

  const handleAddToCart = async (buyNow = false) => {
    if (hasVariants && (!selectedColor || !selectedSize)) {
      toast.error("Please select a size and color");
      return;
    }
    if (availableStock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    if (isAuthenticated) {
      const result = await dispatch(
        addToCartDB({
          productId: product._id,
          variantId: matchedVariant?._id,
          size: selectedSize,
          color: selectedColor,
          quantity,
        })
      );
      if (addToCartDB.fulfilled.match(result)) {
        toast.success("Added to cart");
        if (!buyNow) { setJustAdded(true); setTimeout(() => setJustAdded(false), 1500); }
        if (buyNow) window.location.href = "/checkout";
      } else {
        toast.error(result.payload || "Could not add to cart");
      }
    } else {
      dispatch(
        addGuestItem({
          productId: product._id,
          product: { name: product.name, slug: product.slug, images: product.images, price: product.price, discountPercent: product.discountPercent },
          variantId: matchedVariant?._id,
          size: selectedSize,
          color: selectedColor,
          quantity,
          priceAtAdd: finalPrice,
        })
      );
      toast.success("Added to cart");
      if (!buyNow) { setJustAdded(true); setTimeout(() => setJustAdded(false), 1500); }
      if (buyNow) window.location.href = "/login";
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) return toast.error("Please log in to use wishlist");
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product._id));
      toast.success("Added to wishlist");
    }
  };

  const handleShare = async () => {
    const shareData = { title: product.name, text: product.shortDescription || product.name, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the native share sheet — no error needed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-40 md:pb-8">
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        {product.category?.name && (
          <>
            <ChevronRight size={12} />
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-ink line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 cursor-zoom-in hidden md:block"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomStyle({ display: "none" })}
          >
            <img src={product.images[activeImage]?.url} alt={product.name} className="h-full w-full object-cover" />
            {/* Zoom lens preview — desktop only, shows a magnified crop following the cursor */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${product.images[activeImage]?.url})`,
                backgroundSize: "200%",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 md:hidden">
            <img src={product.images[activeImage]?.url} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex gap-3 overflow-auto">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 ${activeImage === i ? "border-ink" : "border-transparent"}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info — sticky on desktop so it stays in view while the gallery/
            description scroll, matching the pattern Zara/Nike use */}
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">{product.brand?.name}</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-muted">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-2xl font-semibold">{formatPrice(finalPrice)}</span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-muted line-through text-sm">{formatPrice(product.price)}</span>
                <span className="text-accent text-sm font-medium">-{product.discountPercent}%</span>
              </>
            )}
          </div>

          <p className={`text-sm mt-2 font-medium ${availableStock > 0 ? "text-green-600" : "text-accent"}`}>
            {availableStock > 0 ? (availableStock <= 5 ? `Only ${availableStock} left in stock` : "In Stock") : "Out of Stock"}
          </p>

          {hasVariants && (
            <>
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Color: {selectedColor}</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(c.name); setSelectedSize(null); }}
                      className={`h-9 w-9 rounded-full border-2 ${selectedColor === c.name ? "border-ink" : "border-transparent"}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const available = availableSizesForColor.includes(s);
                    return (
                      <button
                        key={s}
                        disabled={!available}
                        onClick={() => setSelectedSize(s)}
                        className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
                          selectedSize === s ? "bg-ink text-white border-ink" : "border-gray-300"
                        } ${!available ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-300 rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3"><Minus size={14} /></button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))} className="p-3"><Plus size={14} /></button>
            </div>
            <button onClick={handleWishlist} className="p-3 border border-gray-300 rounded-full">
              <Heart size={18} className={isWishlisted ? "fill-accent text-accent" : ""} />
            </button>
            <button onClick={handleShare} className="p-3 border border-gray-300 rounded-full" aria-label="Share product">
              <Share2 size={18} />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={availableStock === 0}
              className={`btn-secondary flex-1 transition-colors duration-300 ${justAdded ? "!bg-green-50 !border-green-600 !text-green-700" : ""}`}
            >
              {justAdded ? (
                <span className="flex items-center gap-1.5 animate-[fadeIn_0.2s_ease]"><Check size={16} /> Added</span>
              ) : (
                "Add to Cart"
              )}
            </button>
            <button onClick={() => handleAddToCart(true)} disabled={availableStock === 0} className="btn-primary flex-1">
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-gray-100">
            <div className="flex flex-col items-center text-center gap-1.5">
              <Truck size={20} />
              <span className="text-xs text-muted">Free shipping ₹999+</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <RotateCcw size={20} />
              <span className="text-xs text-muted">7-day returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <ShieldCheck size={20} />
              <span className="text-xs text-muted">Secure checkout</span>
            </div>
          </div>

          <DeliveryChecker />
        </div>
      </div>

      {/* Description/specs sit full-width below the sticky grid — keeping them
          out of the sticky info column means long descriptions don't fight
          the sticky panel for scroll space. */}
      <div className="max-w-3xl mt-12">
        <div className="pt-8 border-t border-gray-100">
          <h3 className="font-semibold mb-2">Description</h3>
          <div
            className="text-sm text-muted leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>

        {product.specifications?.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="font-semibold mb-3">Specifications</h3>
            <dl className="text-sm space-y-2">
              {product.specifications.map((s) => (
                <div key={s.key} className="flex justify-between border-b border-gray-50 pb-2">
                  <dt className="text-muted">{s.key}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <FrequentlyBoughtTogether mainProduct={product} related={related || []} />

      {/* Sticky add-to-cart bar — mobile only. Positioned exactly on top of the
          bottom tab bar (56px + safe-area-inset-bottom, matching MobileTabBar's
          actual height) so it never overlaps or gets overlapped on notched phones. */}
      <div
        className="fixed left-0 right-0 z-30 bg-white border-t border-gray-100 p-3 flex items-center gap-3 md:hidden"
        style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{formatPrice(finalPrice)}</p>
          <p className="text-[11px] text-muted truncate">{product.name}</p>
        </div>
        <button onClick={() => handleAddToCart(false)} disabled={availableStock === 0} className="btn-secondary !py-2.5 !px-4 text-xs shrink-0">
          Add to Cart
        </button>
        <button onClick={() => handleAddToCart(true)} disabled={availableStock === 0} className="btn-primary !py-2.5 !px-4 text-xs shrink-0">
          Buy Now
        </button>
      </div>

      <ReviewSection productId={product._id} ratingBreakdown={product.ratingBreakdown} rating={product.rating} numReviews={product.numReviews} />

      {related?.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
