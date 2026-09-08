import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { formatPrice, calcFinalPrice } from "../../utils/format.js";
import { addToCartDB, addGuestItem } from "../../redux/slices/cartSlice.js";
import { useAuth } from "../../hooks/useAuth.js";

// Builds a simple "frequently bought together" strip from the current product
// plus up to 2 related items. Note: the related-products list from the API
// doesn't include variant data, so bundle add-to-cart only works cleanly for
// items without required variants — if one needs a size/color choice, that
// specific add fails gracefully and the shopper is told to pick it manually.
const FrequentlyBoughtTogether = ({ mainProduct, related }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const candidates = related.slice(0, 2);
  const allItems = [mainProduct, ...candidates];

  const [checked, setChecked] = useState(() => new Set(allItems.map((p) => p._id)));
  const [adding, setAdding] = useState(false);

  if (candidates.length === 0) return null;

  const toggle = (id) => {
    if (id === mainProduct._id) return; // main product always included
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = allItems.filter((p) => checked.has(p._id));
  const total = selectedItems.reduce((sum, p) => sum + calcFinalPrice(p.price, p.discountPercent || 0), 0);

  const handleAddAll = async () => {
    setAdding(true);
    let failed = [];
    for (const p of selectedItems) {
      const price = calcFinalPrice(p.price, p.discountPercent || 0);
      try {
        if (isAuthenticated) {
          const result = await dispatch(addToCartDB({ productId: p._id, quantity: 1 }));
          if (!addToCartDB.fulfilled.match(result)) failed.push(p.name);
        } else {
          dispatch(addGuestItem({
            productId: p._id,
            product: { name: p.name, slug: p.slug, images: p.images, price: p.price, discountPercent: p.discountPercent },
            quantity: 1,
            priceAtAdd: price,
          }));
        }
      } catch {
        failed.push(p.name);
      }
    }
    setAdding(false);
    if (failed.length === 0) {
      toast.success("Added to cart");
    } else if (failed.length < selectedItems.length) {
      toast.success(`Added ${selectedItems.length - failed.length} item(s). "${failed[0]}" needs a size/color — pick it on its own page.`);
    } else {
      toast.error("These items need size/color selection — please add them from their own pages");
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-gray-100">
      <h2 className="font-semibold text-lg mb-5">Frequently bought together</h2>
      <div className="flex flex-wrap items-center gap-3">
        {allItems.map((p, i) => (
          <div key={p._id} className="flex items-center gap-3">
            <label className={`flex items-center gap-2 border rounded-xl p-2 pr-3 cursor-pointer ${checked.has(p._id) ? "border-ink" : "border-gray-200 opacity-60"}`}>
              <input
                type="checkbox"
                checked={checked.has(p._id)}
                onChange={() => toggle(p._id)}
                disabled={p._id === mainProduct._id}
                className="ml-1"
              />
              <img src={p.images?.[0]?.url} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-medium line-clamp-1 max-w-[110px]">{p.name}</p>
                <p className="text-xs text-muted">{formatPrice(calcFinalPrice(p.price, p.discountPercent || 0))}</p>
              </div>
            </label>
            {i < allItems.length - 1 && <Plus size={16} className="text-muted shrink-0" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-5">
        <div>
          <p className="text-xs text-muted">Total for {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}</p>
          <p className="text-lg font-semibold">{formatPrice(total)}</p>
        </div>
        <button onClick={handleAddAll} disabled={adding || selectedItems.length === 0} className="btn-primary">
          {adding ? "Adding..." : "Add selected to cart"}
        </button>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;
