import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { fetchWishlist, removeFromWishlist } from "../../redux/slices/wishlistSlice.js";
import { addToCartDB } from "../../redux/slices/cartSlice.js";
import { formatPrice, calcFinalPrice } from "../../utils/format.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Loader from "../../components/common/Loader.jsx";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlist, status } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleMoveToCart = async (product) => {
    const result = await dispatch(addToCartDB({ productId: product._id, quantity: 1 }));
    if (addToCartDB.fulfilled.match(result)) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Moved to cart");
    } else {
      toast.error(result.payload || "Could not add to cart");
    }
  };

  if (status === "loading") return <Loader full />;

  if (wishlist.products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love here so you don't lose track of them."
          action={<Link to="/shop" className="btn-primary">Explore Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="section-title mb-8">My Wishlist ({wishlist.products.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {wishlist.products.map((product) => {
          const inStock = (product.totalStock ?? product.stock) > 0;
          return (
            <div key={product._id} className="card rounded-2xl overflow-hidden">
              <Link to={`/product/${product.slug}`} className="block aspect-[3/4] bg-gray-100">
                <img src={product.images?.[0]?.url} alt={product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.slug}`} className="text-sm font-medium line-clamp-1">{product.name}</Link>
                <p className="font-semibold text-sm mt-1">{formatPrice(calcFinalPrice(product.price, product.discountPercent))}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={!inStock}
                    className="btn-primary flex-1 !py-2 !px-3 text-xs"
                  >
                    <ShoppingBag size={13} /> {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button onClick={() => dispatch(removeFromWishlist(product._id))} className="p-2 border border-gray-300 rounded-full">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
