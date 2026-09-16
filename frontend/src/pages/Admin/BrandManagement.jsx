import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil } from "lucide-react";
import { brandService } from "../../services/productService.js";
import { getErrorMessage } from "../../services/api.js";
import Loader from "../../components/common/Loader.jsx";

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => brandService.getBrands().then((res) => { setBrands(res.data.data.brands); setLoading(false); });
  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await brandService.updateBrand(editingId, data);
        toast.success("Brand updated");
      } else {
        await brandService.createBrand(data);
        toast.success("Brand created");
      }
      reset();
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    reset({ name: b.name, logo: b.logo });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ name: "", logo: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand? Products already using it will keep the reference, so only delete brands with no products.")) return;
    try {
      await brandService.deleteBrand(id);
      toast.success("Brand deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleActive = async (b) => {
    await brandService.updateBrand(b._id, { isActive: !b.isActive });
    load();
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="section-title mb-6">Brands</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl">
        <input placeholder="Brand name" className="input-field min-w-0" {...register("name", { required: true })} />
        <input placeholder="Logo URL (optional)" className="input-field min-w-0" {...register("logo")} />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto shrink-0">
          <Plus size={15} /> {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit} className="btn-secondary w-full sm:w-auto shrink-0">
            Cancel
          </button>
        )}
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {brands.map((b) => (
          <div key={b._id} className="card p-4 flex items-center gap-3">
            {b.logo ? (
              <img src={b.logo} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0 bg-gray-100" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-xs font-semibold text-muted">
                {b.name?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{b.name}</p>
              <button onClick={() => toggleActive(b)} className={`text-xs mt-0.5 ${b.isActive ? "text-green-600" : "text-muted"}`}>
                {b.isActive ? "Active" : "Inactive"}
              </button>
            </div>
            <button onClick={() => handleEdit(b)} className="text-muted hover:text-ink shrink-0"><Pencil size={14} /></button>
            <button onClick={() => handleDelete(b._id)} className="text-muted hover:text-accent shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
        {brands.length === 0 && (
          <p className="text-sm text-muted col-span-full text-center py-8">No brands yet — add your first one above.</p>
        )}
      </div>
    </div>
  );
};

export default BrandManagement;