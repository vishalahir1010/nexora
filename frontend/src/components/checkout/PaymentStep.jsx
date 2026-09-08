import { useState } from "react";
import { Tag } from "lucide-react";

const PaymentStep = ({ paymentMethod, setPaymentMethod, couponCode, onApplyCoupon, onBack, onPlaceOrder, placing }) => {
  const [couponInput, setCouponInput] = useState(couponCode || "");

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Payment Method</h2>

      <div className="flex gap-2 mb-6">
        <input
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          placeholder="Coupon code (e.g. WELCOME10)"
          className="input-field flex-1"
        />
        <button onClick={() => onApplyCoupon(couponInput)} className="btn-secondary !px-5">
          <Tag size={15} /> Apply
        </button>
      </div>

      <div className="space-y-3">
        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${paymentMethod === "razorpay" ? "border-ink bg-gray-50" : "border-gray-200"}`}>
          <input type="radio" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} />
          <div>
            <p className="text-sm font-medium">Pay Online (Razorpay)</p>
            <p className="text-xs text-muted">Cards, UPI, Netbanking, Wallets</p>
          </div>
        </label>
        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${paymentMethod === "cod" ? "border-ink bg-gray-50" : "border-gray-200"}`}>
          <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
          <div>
            <p className="text-sm font-medium">Cash on Delivery</p>
            <p className="text-xs text-muted">Pay when your order arrives</p>
          </div>
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="btn-secondary">Back</button>
        <button onClick={onPlaceOrder} disabled={placing} className="btn-primary flex-1">
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
