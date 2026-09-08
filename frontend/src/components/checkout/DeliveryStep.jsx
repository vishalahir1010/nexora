import { formatPrice } from "../../utils/format.js";

const DeliveryStep = ({ deliveryMethod, setDeliveryMethod, onBack, onNext }) => (
  <div>
    <h2 className="font-semibold text-lg mb-4">Delivery Method</h2>
    <div className="space-y-3">
      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer ${deliveryMethod === "standard" ? "border-ink bg-gray-50" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <input type="radio" checked={deliveryMethod === "standard"} onChange={() => setDeliveryMethod("standard")} />
          <div>
            <p className="text-sm font-medium">Standard Delivery</p>
            <p className="text-xs text-muted">5-6 business days</p>
          </div>
        </div>
        <span className="text-sm font-medium">{formatPrice(79)}</span>
      </label>
      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer ${deliveryMethod === "express" ? "border-ink bg-gray-50" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <input type="radio" checked={deliveryMethod === "express"} onChange={() => setDeliveryMethod("express")} />
          <div>
            <p className="text-sm font-medium">Express Delivery</p>
            <p className="text-xs text-muted">1-2 business days</p>
          </div>
        </div>
        <span className="text-sm font-medium">{formatPrice(199)}</span>
      </label>
    </div>
    <p className="text-xs text-muted mt-3">Free shipping automatically applies on orders over ₹999.</p>
    <div className="flex gap-3 mt-6">
      <button onClick={onBack} className="btn-secondary">Back</button>
      <button onClick={onNext} className="btn-primary flex-1">Continue to Payment</button>
    </div>
  </div>
);

export default DeliveryStep;
