import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateProfile } from "../../redux/slices/authSlice.js";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || "" },
  });

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) toast.success("Profile updated");
    else toast.error(result.payload || "Update failed");
  };

  return (
    <div>
      <h1 className="section-title mb-6">My Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Full Name</label>
          <input className="input-field" {...register("name", { required: true })} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <input className="input-field bg-gray-50" value={user?.email} disabled />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
          <input className="input-field" {...register("phone")} />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
