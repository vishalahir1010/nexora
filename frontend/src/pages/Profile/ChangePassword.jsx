import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { authService } from "../../services/authService.js";
import { getErrorMessage } from "../../services/api.js";

const ChangePassword = () => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="section-title mb-6">Change Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <input type="password" placeholder="Current password" className="input-field" {...register("currentPassword", { required: true })} />
        <input
          type="password"
          placeholder="New password"
          className="input-field"
          {...register("newPassword", { required: true, minLength: { value: 6, message: "At least 6 characters" } })}
        />
        {errors.newPassword && <p className="text-xs text-accent">{errors.newPassword.message}</p>}
        <input
          type="password"
          placeholder="Confirm new password"
          className="input-field"
          {...register("confirm", { validate: (v) => v === watch("newPassword") || "Passwords do not match" })}
        />
        {errors.confirm && <p className="text-xs text-accent">{errors.confirm.message}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
