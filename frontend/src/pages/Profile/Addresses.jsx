import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Star } from "lucide-react";
import { addressService } from "../../services/addressService.js";
import { getErrorMessage } from "../../services/api.js";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => addressService.getAddresses().then((res) => { setAddresses(res.data.data.addresses); setLoading(false); });

  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      const res = await addressService.addAddress(data);
      setAddresses(res.data.data.addresses);
      reset();
      setShowForm(false);
      toast.success("Address added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await addressService.deleteAddress(id);
      setAddresses(res.data.data.addresses);
      toast.success("Address removed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSetDefault = async (id) => {
    const res = await addressService.setDefault(id);
    setAddresses(res.data.data.addresses);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Saved Addresses</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-secondary !py-2">
          <Plus size={15} /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-gray-200 rounded-xl p-5 space-y-3 mb-6 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Full name" className="input-field" {...register("fullName", { required: true })} />
            <input placeholder="Phone number" className="input-field" {...register("phone", { required: true })} />
          </div>
          <input placeholder="Address line 1" className="input-field" {...register("line1", { required: true })} />
          <input placeholder="Address line 2 (optional)" className="input-field" {...register("line2")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="City" className="input-field" {...register("city", { required: true })} />
            <input placeholder="State" className="input-field" {...register("state", { required: true })} />
            <input placeholder="PIN code" className="input-field" {...register("postalCode", { required: true })} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">Save Address</button>
        </form>
      )}

      {addresses.length === 0 ? (
        <EmptyState title="No saved addresses" description="Add an address to speed up your checkout." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{addr.fullName}</p>
                  <p className="text-xs text-muted mt-1">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-xs text-muted mt-1">{addr.phone}</p>
                </div>
                <button onClick={() => handleDelete(addr._id)} className="text-muted hover:text-accent">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-3">
                {addr.isDefault ? (
                  <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <Star size={11} className="fill-gold text-gold" /> Default
                  </span>
                ) : (
                  <button onClick={() => handleSetDefault(addr._id)} className="text-xs text-muted hover:text-ink underline">
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
