import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Archive, CheckCircle2 } from "lucide-react";
import { productService } from "../../services/productService.js";
import { getErrorMessage } from "../../services/api.js";
import { formatPrice } from "../../utils/format.js";
import Loader from "../../components/common/Loader.jsx";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const load = () => productService.getProducts({ limit: 60 }).then((res) => {
    setProducts(res.data.data.products);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p._id))));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted");
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected product(s)? This cannot be undone.`)) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => productService.deleteProduct(id)));
      toast.success(`${selected.size} product(s) deleted`);
      setProducts((p) => p.filter((x) => !selected.has(x._id)));
      setSelected(new Set());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkStatus = async (status) => {
    if (selected.size === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => productService.updateProduct(id, { status })));
      toast.success(`${selected.size} product(s) marked ${status}`);
      setProducts((p) => p.map((x) => (selected.has(x._id) ? { ...x, status } : x)));
      setSelected(new Set());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBulkWorking(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button disabled={bulkWorking} onClick={() => handleBulkStatus("active")} className="btn-secondary !py-1.5 !px-3 text-xs">
            <CheckCircle2 size={13} /> Mark Active
          </button>
          <button disabled={bulkWorking} onClick={() => handleBulkStatus("archived")} className="btn-secondary !py-1.5 !px-3 text-xs">
            <Archive size={13} /> Archive
          </button>
          <button disabled={bulkWorking} onClick={handleBulkDelete} className="btn-secondary !py-1.5 !px-3 text-xs text-accent border-accent/30">
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-muted ml-auto">Clear</button>
        </div>
      )}

      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-gray-100">
              <th className="p-4 w-10">
                <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleSelectAll} />
              </th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className={`border-b border-gray-50 ${selected.has(p._id) ? "bg-gray-50" : ""}`}>
                <td className="p-4">
                  <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} />
                </td>
                <td className="p-4 flex items-center gap-3">
                  <img src={p.images?.[0]?.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="line-clamp-1">{p.name}</span>
                </td>
                <td className="p-4 text-muted">{p.sku}</td>
                <td className="p-4">{formatPrice(p.price)}</td>
                <td className="p-4">{p.totalStock ?? p.stock}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/products/${p._id}`} className="text-muted hover:text-ink"><Pencil size={15} /></Link>
                    <button onClick={() => handleDelete(p._id)} className="text-muted hover:text-accent"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
