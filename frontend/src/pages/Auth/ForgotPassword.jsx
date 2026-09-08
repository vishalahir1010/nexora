import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../services/authService.js";
import { getErrorMessage } from "../../services/api.js";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data);
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-muted">If an account exists with that email, we've sent a password reset link.</p>
        <Link to="/login" className="btn-secondary w-full mt-6">Back to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1">Reset your password</h1>
      <p className="text-sm text-muted mb-8">Enter your email and we'll send you a reset link</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="email" placeholder="Email address" className="input-field" {...register("email", { required: true })} />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        <Link to="/login" className="text-ink font-medium">Back to login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
