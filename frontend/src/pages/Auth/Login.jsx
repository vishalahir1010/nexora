import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginUser } from "../../redux/slices/authSlice.js";
import { mergeGuestCartIntoDB } from "../../redux/slices/cartSlice.js";
import { fetchWishlist } from "../../redux/slices/wishlistSlice.js";

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      await dispatch(mergeGuestCartIntoDB());
      dispatch(fetchWishlist());
      navigate(location.state?.from?.pathname || "/");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1">Welcome back</h1>
      <p className="text-sm text-muted mb-8">Log in to continue to your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email address"
            className="input-field"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="text-xs text-accent mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <p className="text-xs text-accent mt-1">{errors.password.message}</p>}
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-muted hover:text-ink">Forgot password?</Link>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Don't have an account? <Link to="/register" className="text-ink font-medium">Create one</Link>
      </p>
    </div>
  );
};

export default Login;
