import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil } from "lucide-react";
import { categoryService } from "../../services/productService.js";
import { getErrorMessage } from "../../services/api.js";
import Loader from "../../components/common/Loader.jsx";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => categoryService.getAllAdmin().then((res) => { setCategories(res.data.data.categories); setLoading(false); });
  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, data);
        toast.success("Category updated");
      } else {
        await categoryService.createCategory(data);
        toast.success("Category created");
      }
      reset();
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    reset({ name: c.name, image: c.image });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleActive = async (c) => {
    await categoryService.updateCategory(c._id, { isActive: !c.isActive });
    load();
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="section-title mb-6">Categories</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl">
        <input placeholder="Category name" className="input-field min-w-0" {...register("name", { required: true })} />
        <input placeholder="Image URL" className="input-field min-w-0" {...register("image")} />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto shrink-0">
          <Plus size={15} /> {editingId ? "Update" : "Add"}
        </button>
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="card p-4 flex items-center gap-3">
            <img src={c.image} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              <button onClick={() => toggleActive(c)} className={`text-xs mt-0.5 ${c.isActive ? "text-green-600" : "text-muted"}`}>
                {c.isActive ? "Active" : "Inactive"}
              </button>
            </div>
            <button onClick={() => handleEdit(c)} className="text-muted hover:text-ink shrink-0"><Pencil size={14} /></button>
            <button onClick={() => handleDelete(c._id)} className="text-muted hover:text-accent shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;