import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, UploadCloud, Loader2, X } from "lucide-react";
import { productService, categoryService, brandService } from "../../services/productService.js";
import { uploadService } from "../../services/uploadService.js";
import { getErrorMessage } from "../../services/api.js";
import Loader from "../../components/common/Loader.jsx";
import RichTextEditor from "../../components/admin/RichTextEditor.jsx";

const DEFAULT_COLOR = { name: "", hex: "#000000" };

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Variants are managed as local state (not react-hook-form) because they're a
  // generated cross-product of colors x sizes, not a flat list the user types in.
  const [hasVariants, setHasVariants] = useState(false);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variantStock, setVariantStock] = useState({}); // key: "color|size" -> stock number

  const { register, control, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: "", sku: "", brand: "", category: "", description: "", shortDescription: "",
      price: "", discountPercent: 0, stock: 0,
      images: [],
      specifications: [{ key: "", value: "" }],
      isFeatured: false, isBestseller: false, isNewArrival: false, status: "active",
    },
  });

  const imageFields = useFieldArray({ control, name: "images" });
  const specFields = useFieldArray({ control, name: "specifications" });

  useEffect(() => {
    categoryService.getAllAdmin().then((res) => setCategories(res.data.data.categories));
    brandService.getBrands().then((res) => setBrands(res.data.data.brands));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productService.getAdminProduct(id).then((res) => {
      const p = res.data.data.product;
      reset({
        ...p,
        brand: p.brand?._id,
        category: p.category?._id,
        images: p.images?.length ? p.images : [],
        specifications: p.specifications?.length ? p.specifications : [{ key: "", value: "" }],
      });

      if (p.variants?.length > 0) {
        setHasVariants(true);
        const colorMap = new Map();
        (p.colors || []).forEach((c) => colorMap.set(c.name, c.hex));
        p.variants.forEach((v) => {
          if (!colorMap.has(v.color)) colorMap.set(v.color, v.colorHex || "#000000");
        });
        setColors([...colorMap.entries()].map(([name, hex]) => ({ name, hex })));
        setSizes(p.sizes?.length ? p.sizes : [...new Set(p.variants.map((v) => v.size))]);
        const stockMap = {};
        p.variants.forEach((v) => {
          stockMap[`${v.color}|${v.size}`] = v.stock;
        });
        setVariantStock(stockMap);
      }
      setLoading(false);
    });
  }, [id]);

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const { url, publicId } = await uploadService.uploadImage(file);
      if (index === null) {
        imageFields.append({ url, publicId });
      } else {
        imageFields.update(index, { url, publicId });
      }
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingIndex(null);
    }
  };

  const addColor = () => setColors((c) => [...c, { ...DEFAULT_COLOR }]);
  const updateColor = (i, field, value) => setColors((c) => c.map((col, idx) => (idx === i ? { ...col, [field]: value } : col)));
  const removeColor = (i) => setColors((c) => c.filter((_, idx) => idx !== i));

  const addSize = (s) => {
    if (!s.trim() || sizes.includes(s.trim())) return;
    setSizes((prev) => [...prev, s.trim()]);
  };
  const removeSize = (s) => setSizes((prev) => prev.filter((x) => x !== s));

  const onSubmit = async (data) => {
    // Build the variants array fresh from current colors x sizes x stock state.
    // This is what fixes the old bug — variants are only ever [] if the admin
    // never enabled the "has variants" toggle, never as a silent side effect.
    let variants = [];
    if (hasVariants && colors.length > 0 && sizes.length > 0) {
      colors.forEach((color) => {
        sizes.forEach((size) => {
          const key = `${color.name}|${size}`;
          variants.push({
            color: color.name,
            colorHex: color.hex,
            size,
            stock: Number(variantStock[key] || 0),
            sku: `${data.sku}-${size}-${color.name.slice(0, 3).toUpperCase()}`,
          });
        });
      });
    }

    const payload = {
      ...data,
      price: Number(data.price),
      discountPercent: Number(data.discountPercent) || 0,
      stock: hasVariants ? 0 : Number(data.stock) || 0,
      images: data.images.filter((i) => i.url),
      specifications: data.specifications.filter((s) => s.key && s.value),
      colors: hasVariants ? colors.filter((c) => c.name) : [],
      sizes: hasVariants ? sizes : [],
      variants,
    };

    try {
      if (isEdit) {
        await productService.updateProduct(id, payload);
        toast.success("Product updated");
      } else {
        await productService.createProduct(payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="section-title mb-6">{isEdit ? "Edit Product" : "New Product"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Product Name</label>
            <input className="input-field" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">SKU</label>
            <input className="input-field" {...register("sku", { required: true })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Brand</label>
            <select className="input-field" {...register("brand", { required: true })}>
              <option value="">Select brand</option>
              {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <select className="input-field" {...register("category", { required: true })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Short Description</label>
          <input className="input-field" {...register("shortDescription")} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <input type="hidden" {...register("description", { required: true })} />
          <RichTextEditor value={watch("description")} onChange={(html) => setValue("description", html, { shouldValidate: true })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Price (₹)</label>
            <input type="number" className="input-field" {...register("price", { required: true })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Discount %</label>
            <input type="number" className="input-field" {...register("discountPercent")} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Stock {hasVariants && <span className="text-muted font-normal">(set per variant below)</span>}
            </label>
            <input type="number" className="input-field" disabled={hasVariants} {...register("stock")} />
          </div>
        </div>

        {/* Images — real upload, with URL as a fallback if Cloudinary isn't configured */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Product Images</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {imageFields.fields.map((field, i) => (
              <div key={field.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {field.url ? (
                  <img src={field.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted text-xs">No image</div>
                )}
                <button
                  type="button"
                  onClick={() => imageFields.remove(i)}
                  className="absolute top-1 right-1 h-6 w-6 bg-white/90 rounded-full flex items-center justify-center"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-ink transition-colors">
              {uploadingIndex !== null ? (
                <Loader2 size={20} className="animate-spin text-muted" />
              ) : (
                <>
                  <UploadCloud size={20} className="text-muted" />
                  <span className="text-[11px] text-muted">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, null)} />
            </label>
          </div>
          <p className="text-xs text-muted">
            Needs Cloudinary configured in backend/.env. If it's not set up yet, you can also paste an image URL directly below.
          </p>
          <div className="flex gap-2 mt-2">
            <input
              placeholder="Or paste an image URL and press Enter"
              className="input-field"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  imageFields.append({ url: e.currentTarget.value.trim() });
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-3">
            <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
            This product has size/color variants
          </label>

          {hasVariants && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted mb-2">Colors</p>
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(i, "hex", e.target.value)}
                      className="h-9 w-9 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      placeholder="Color name (e.g. Navy)"
                      value={c.name}
                      onChange={(e) => updateColor(i, "name", e.target.value)}
                      className="input-field !py-2"
                    />
                    <button type="button" onClick={() => removeColor(i)} className="p-2 text-muted"><Trash2 size={15} /></button>
                  </div>
                ))}
                <button type="button" onClick={addColor} className="text-sm text-muted flex items-center gap-1">
                  <Plus size={14} /> Add color
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-muted mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {sizes.map((s) => (
                    <span key={s} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs">
                      {s}
                      <button type="button" onClick={() => removeSize(s)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <input
                  placeholder="Type a size and press Enter (e.g. M, 9, XL)"
                  className="input-field !py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSize(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              {colors.length > 0 && sizes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted mb-2">Stock per variant</p>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left pb-2 pr-4 font-medium text-muted">Color</th>
                          {sizes.map((s) => <th key={s} className="pb-2 px-2 font-medium text-muted">{s}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {colors.filter((c) => c.name).map((c) => (
                          <tr key={c.name}>
                            <td className="py-1 pr-4 flex items-center gap-2">
                              <span className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }} />
                              {c.name}
                            </td>
                            {sizes.map((s) => {
                              const key = `${c.name}|${s}`;
                              return (
                                <td key={s} className="px-2 py-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={variantStock[key] ?? ""}
                                    onChange={(e) => setVariantStock((prev) => ({ ...prev, [key]: e.target.value }))}
                                    className="w-16 text-center input-field !py-1.5 !px-1"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Specifications</label>
          {specFields.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input className="input-field" placeholder="Key (e.g. Material)" {...register(`specifications.${i}.key`)} />
              <input className="input-field" placeholder="Value" {...register(`specifications.${i}.value`)} />
              <button type="button" onClick={() => specFields.remove(i)} className="p-2 text-muted"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => specFields.append({ key: "", value: "" })} className="text-sm text-muted flex items-center gap-1">
            <Plus size={14} /> Add specification
          </button>
        </div>

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("isFeatured")} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("isBestseller")} /> Bestseller</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("isNewArrival")} /> New Arrival</label>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Status</label>
          <select className="input-field" {...register("status")}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
