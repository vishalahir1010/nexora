import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { registerUser } from "../../redux/slices/authSlice.js";
import { mergeGuestCartIntoDB } from "../../redux/slices/cartSlice.js";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone }));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      await dispatch(mergeGuestCartIntoDB());
      navigate("/");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1">Create your account</h1>
      <p className="text-sm text-muted mb-8">Join NEXORA for premium shopping</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input placeholder="Full name" className="input-field" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="text-xs text-accent mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <input type="email" placeholder="Email address" className="input-field" {...register("email", { required: "Email is required" })} />
          {errors.email && <p className="text-xs text-accent mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input placeholder="Phone number" className="input-field" {...register("phone")} />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
          />
          {errors.password && <p className="text-xs text-accent mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            className="input-field"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && <p className="text-xs text-accent mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Already have an account? <Link to="/login" className="text-ink font-medium">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
