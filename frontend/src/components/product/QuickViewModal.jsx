import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { formatPrice, calcFinalPrice } from "../../utils/format.js";
import { addToCartDB, addGuestItem } from "../../redux/slices/cartSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import RatingStars from "../common/RatingStars.jsx";

const QuickViewModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || null);
  const [selectedSize, setSelectedSize] = useState(null);

  const hasVariants = product.variants && product.variants.length > 0;
  const finalPrice = calcFinalPrice(product.price, product.discountPercent);
  const inStock = (product.totalStock ?? product.stock) > 0;

  const handleAddToCart = async () => {
    if (hasVariants && (!selectedColor || !selectedSize)) {
      toast.error("Please select size and color");
      return;
    }
    if (isAuthenticated) {
      const result = await dispatch(addToCartDB({ productId: product._id, size: selectedSize, color: selectedColor, quantity: 1 }));
      if (addToCartDB.fulfilled.match(result)) {
        toast.success("Added to cart");
        onClose();
      } else {
        toast.error(result.payload || "Could not add to cart");
      }
    } else {
      dispatch(addGuestItem({
        productId: product._id,
        product: { name: product.name, slug: product.slug, images: product.images, price: product.price, discountPercent: product.discountPercent },
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        priceAtAdd: finalPrice,
      }));
      toast.success("Added to cart");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto grid sm:grid-cols-2">
        <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center z-10">
          <X size={16} />
        </button>
        <div className="aspect-square bg-gray-100">
          <img src={product.images?.[0]?.url} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-5">
          <p className="text-xs text-muted uppercase">{product.brand?.name}</p>
          <h2 className="font-display text-lg font-semibold mt-1">{product.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <RatingStars rating={product.rating} size={13} />
            <span className="text-xs text-muted">({product.numReviews || 0})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-semibold">{formatPrice(finalPrice)}</span>
            {product.discountPercent > 0 && <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>}
          </div>

          {hasVariants && (
            <>
              {product.colors?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium mb-1.5">Color</p>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`h-7 w-7 rounded-full border-2 ${selectedColor === c.name ? "border-ink" : "border-transparent"}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {product.sizes?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-1.5">Size</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`h-8 px-3 rounded-lg border text-xs font-medium ${selectedSize === s ? "bg-ink text-white border-ink" : "border-gray-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 mt-5">
            <button onClick={handleAddToCart} disabled={!inStock} className="btn-primary flex-1 !py-2.5 text-sm">
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
          <Link to={`/product/${product.slug}`} onClick={onClose} className="block text-center text-xs text-muted mt-3 hover:text-ink">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
