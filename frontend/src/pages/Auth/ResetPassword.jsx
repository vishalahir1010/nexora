import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../services/authService.js";
import { getErrorMessage } from "../../services/api.js";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword({ token: params.get("token"), newPassword: data.newPassword });
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1">Set a new password</h1>
      <p className="text-sm text-muted mb-8">Choose a strong password for your account</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        <Link to="/login" className="text-ink font-medium">Back to login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
