import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { formatPrice, calcFinalPrice } from "../../utils/format.js";
import { addToWishlist, removeFromWishlist } from "../../redux/slices/wishlistSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import QuickViewModal from "./QuickViewModal.jsx";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const wishlistProducts = useSelector((state) => state.wishlist.wishlist.products);
  const isWishlisted = wishlistProducts.some((p) => p._id === product._id);

  const finalPrice = calcFinalPrice(product.price, product.discountPercent);
  const inStock = (product.totalStock ?? product.stock) > 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please log in to save items to your wishlist");
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product._id));
      toast.success("Added to wishlist");
    }
  };

  return (
    <>
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="card relative overflow-hidden rounded-2xl">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              -{product.discountPercent}%
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-medium text-ink">
              Out of Stock
            </span>
          )}
          <button
            onClick={handleWishlistToggle}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-110 active:scale-90"
          >
            <Heart size={16} className={`transition-all duration-200 ${isWishlisted ? "fill-accent text-accent scale-110" : "text-ink"}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
            aria-label="Quick view"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 bg-white text-ink text-xs font-medium px-4 py-2 rounded-full shadow-md hidden md:flex items-center gap-1.5"
          >
            <Eye size={13} /> Quick View
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{product.brand?.name}</p>
          <h3 className="mt-1 text-sm font-medium text-ink line-clamp-1">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <Star size={13} className="fill-gold text-gold" />
            <span>{product.rating?.toFixed(1) || "New"}</span>
            {product.numReviews > 0 && <span>({product.numReviews})</span>}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold text-ink">{formatPrice(finalPrice)}</span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
    {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
};

export default ProductCard;
