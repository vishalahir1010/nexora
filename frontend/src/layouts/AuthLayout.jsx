import { Link, Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
      <Link to="/" className="font-display text-2xl font-bold">NEXORA</Link>
      <div>
        <h2 className="font-display text-3xl leading-tight mb-3">Premium shopping,<br />redefined.</h2>
        <p className="text-white/60 max-w-sm text-sm">
          Join thousands of shoppers discovering fashion, electronics, and lifestyle essentials curated for modern living.
        </p>
      </div>
      <p className="text-xs text-white/40">© {new Date().getFullYear()} NEXORA. All rights reserved.</p>
    </div>
    <div className="flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
