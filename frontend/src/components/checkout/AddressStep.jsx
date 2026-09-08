import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { addressService } from "../../services/addressService.js";
import { getErrorMessage } from "../../services/api.js";

const AddressStep = ({ addresses, setAddresses, selectedAddressId, setSelectedAddressId, onNext }) => {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await addressService.addAddress(data);
      setAddresses(res.data.data.addresses);
      const newest = res.data.data.addresses[res.data.data.addresses.length - 1];
      setSelectedAddressId(newest._id);
      reset();
      setShowForm(false);
      toast.success("Address added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>

      <div className="space-y-3 mb-5">
        {addresses.map((addr) => (
          <label
            key={addr._id}
            className={`block p-4 rounded-xl border cursor-pointer ${selectedAddressId === addr._id ? "border-ink bg-gray-50" : "border-gray-200"}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selectedAddressId === addr._id}
                onChange={() => setSelectedAddressId(addr._id)}
                className="mt-1"
              />
              <div className="text-sm">
                <p className="font-medium">{addr.fullName} <span className="text-muted font-normal">· {addr.phone}</span></p>
                <p className="text-muted mt-0.5">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} {addr.postalCode}</p>
                {addr.isDefault && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full mt-1 inline-block">Default</span>}
              </div>
            </div>
          </label>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-secondary !py-2">
          <Plus size={15} /> Add New Address
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-gray-200 rounded-xl p-5 space-y-3">
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
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">Save Address</button>
            {addresses.length > 0 && <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>}
          </div>
        </form>
      )}

      <button onClick={onNext} className="btn-primary w-full mt-6">Continue to Delivery</button>
    </div>
  );
};

export default AddressStep;
