const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  out_for_delivery: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const OrderStatusBadge = ({ status }) => (
  <span className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${STATUS_STYLES[status] || "bg-gray-100"}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export default OrderStatusBadge;
