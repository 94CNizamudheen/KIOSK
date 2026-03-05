import { useOrder } from "@/context/OrderContext";

export default function AssistanceBanner() {
  const { activeOrder, releaseOrder } = useOrder();

  if (!activeOrder || (activeOrder.status !== "TRANSFERRED" && activeOrder.status !== "IN_PROGRESS")) {
    return null;
  }

  const isReviewing = activeOrder.status === "IN_PROGRESS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-6 rounded-3xl px-12 py-10 shadow-2xl max-w-sm w-full mx-4"
        style={{ backgroundColor: "#F1F1EC" }}
      >
        {/* Spinner */}
        <div
          className="w-16 h-16 rounded-full border-4 border-gray-200 animate-spin"
          style={{ borderTopColor: "#B5E533" }}
        />

        {/* Order number */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Order
          </p>
          <p
            className="text-5xl font-extrabold"
            style={{ color: "#1C1C1C" }}
          >
            #{activeOrder.orderNumber}
          </p>
        </div>

        {/* Status message */}
        <p className="text-center text-gray-600 font-medium text-base">
          {isReviewing
            ? "Cashier is reviewing your order"
            : "Waiting for cashier..."}
        </p>

        {/* Cancel */}
        <button
          onClick={() => releaseOrder(activeOrder.orderId)}
          className="mt-2 px-8 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-bold text-sm hover:border-gray-400 hover:bg-gray-100 transition-all"
        >
          Cancel Request
        </button>
      </div>
    </div>
  );
}
