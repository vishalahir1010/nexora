import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { couponService } from "../../services/couponService.js";
import { getErrorMessage } from "../../services/api.js";
import { formatDate } from "../../utils/format.js";
import Loader from "../../components/common/Loader.jsx";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { type: "percentage" },
  });

  const load = () => couponService.getAll().then((res) => { setCoupons(res.data.data.coupons); setLoading(false); });
  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      await couponService.create({
        ...data,
        value: Number(data.value),
        minOrderAmount: Number(data.minOrderAmount) || 0,
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        perUserLimit: Number(data.perUserLimit) || 1,
      });
      toast.success("Coupon created");
      reset({ type: "percentage" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await couponService.remove(id);
    toast.success("Coupon deleted");
    load();
  };

  const toggleActive = async (c) => {
    await couponService.update(c._id, { isActive: !c.isActive });
    load();
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Coupons</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary"><Plus size={15} /> New Coupon</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-gray-200 rounded-xl p-5 mb-8 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Coupon code" className="input-field" {...register("code", { required: true })} />
          <select className="input-field" {...register("type")}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input type="number" placeholder="Discount value" className="input-field" {...register("value", { required: true })} />
          <input type="number" placeholder="Min order amount" className="input-field" {...register("minOrderAmount")} />
          <input type="number" placeholder="Max discount amount" className="input-field" {...register("maxDiscountAmount")} />
          <input type="number" placeholder="Usage limit (blank = unlimited)" className="input-field" {...register("usageLimit")} />
          <input type="number" placeholder="Per-user limit" className="input-field" defaultValue={1} {...register("perUserLimit")} />
          <input type="date" className="input-field" {...register("expiresAt", { required: true })} />
          <button type="submit" disabled={isSubmitting} className="btn-primary col-span-2">Create Coupon</button>
        </form>
      )}

      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-gray-100">
              <th className="p-4 font-medium">Code</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Value</th>
              <th className="p-4 font-medium">Used</th>
              <th className="p-4 font-medium">Expires</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-gray-50">
                <td className="p-4 font-medium">{c.code}</td>
                <td className="p-4 capitalize">{c.type}</td>
                <td className="p-4">{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-4">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="p-4 text-muted">{formatDate(c.expiresAt)}</td>
                <td className="p-4">
                  <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded-full ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(c._id)} className="text-muted hover:text-accent"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponManagement;
