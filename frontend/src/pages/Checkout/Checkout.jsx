import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { addressService } from "../../services/addressService.js";
import { orderService } from "../../services/orderService.js";
import { paymentService } from "../../services/paymentService.js";
import { couponService } from "../../services/couponService.js";
import { getErrorMessage } from "../../services/api.js";
import { useCartTotals } from "../../hooks/useCartTotals.js";
import { formatPrice } from "../../utils/format.js";
import AddressStep from "../../components/checkout/AddressStep.jsx";
import DeliveryStep from "../../components/checkout/DeliveryStep.jsx";
import PaymentStep from "../../components/checkout/PaymentStep.jsx";

const STEPS = ["Address", "Delivery", "Payment"];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const { subtotal, itemCount } = useCartTotals();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [pricing, setPricing] = useState({ itemsPrice: subtotal, discountAmount: 0, shippingPrice: 0, taxPrice: 0, totalPrice: subtotal });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (itemCount === 0) navigate("/cart");
    addressService.getAddresses().then((res) => {
      setAddresses(res.data.data.addresses);
      const def = res.data.data.addresses.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def._id);
    });
  }, []);

  useEffect(() => {
    orderService
      .getPricingPreview({ couponCode: couponCode || undefined, deliveryMethod })
      .then((res) => setPricing(res.data.data))
      .catch(() => {});
  }, [deliveryMethod, couponCode]);

  const applyCoupon = async (code) => {
    try {
      const res = await couponService.apply(code, pricing.itemsPrice);
      setCouponDiscount(res.data.data.discount);
      setCouponCode(code);
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const placeOrder = async () => {
    const address = addresses.find((a) => a._id === selectedAddressId);
    if (!address) return toast.error("Please select a shipping address");

    setPlacing(true);
    try {
      const orderRes = await orderService.createOrder({
        shippingAddress: address,
        billingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
        deliveryMethod,
      });
      const order = orderRes.data.data.order;

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        navigate(`/account/orders/${order._id}`);
        return;
      }

      // Razorpay flow — order is created "pending"; payment verified server-side
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Could not load payment gateway. Please try again.");
        setPlacing(false);
        return;
      }

      const rpRes = await paymentService.createRazorpayOrder(order._id);
      const { razorpayOrderId, amount, currency, keyId } = rpRes.data.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "NEXORA",
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Order confirmed.");
            navigate(`/account/orders/${order._id}`);
          } catch (err) {
            toast.error(getErrorMessage(err) || "Payment verification failed");
            navigate(`/account/orders/${order._id}`);
          }
        },
        modal: {
          ondismiss: async () => {
            await paymentService.markFailed(order._id);
            toast.error("Payment cancelled");
            setPlacing(false);
          },
        },
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: "#0f1115" },
      });
      rzp.on("payment.failed", async () => {
        await paymentService.markFailed(order._id);
        toast.error("Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Desktop: full stepper with connectors. Mobile: compact "Step X of Y" —
          the full horizontal stepper overflowed narrow screens before this. */}
      <div className="hidden sm:flex items-center gap-4 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              i < step ? "bg-green-600 text-white" : i === step ? "bg-ink text-white" : "bg-gray-100 text-muted"
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200 ml-2" />}
          </div>
        ))}
      </div>
      <div className="flex sm:hidden items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-full bg-ink text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {step + 1}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{STEPS[step]}</p>
          <p className="text-xs text-muted">Step {step + 1} of {STEPS.length}</p>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-ink" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        <div>
          {step === 0 && (
            <AddressStep
              addresses={addresses}
              setAddresses={setAddresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              onNext={() => selectedAddressId ? setStep(1) : toast.error("Please select or add an address")}
            />
          )}
          {step === 1 && (
            <DeliveryStep
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <PaymentStep
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              couponCode={couponCode}
              onApplyCoupon={applyCoupon}
              onBack={() => setStep(1)}
              onPlaceOrder={placeOrder}
              placing={placing}
            />
          )}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(pricing.itemsPrice)}</span></div>
            {pricing.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(pricing.discountAmount)}</span></div>
            )}
            <div className="flex justify-between text-muted"><span>Shipping</span><span>{pricing.shippingPrice === 0 ? "Free" : formatPrice(pricing.shippingPrice)}</span></div>
            <div className="flex justify-between text-muted"><span>Tax</span><span>{formatPrice(pricing.taxPrice)}</span></div>
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-semibold">
            <span>Total</span><span>{formatPrice(pricing.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
