import { useEffect, useRef, useState } from "react";
import { CheckCircle, Clock, ShoppingBag, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

// ── Step indicator ────────────────────────────────────────────────────────────

const steps = [
  { label: "Requested" },
  { label: "Team on way" },
  { label: "Reviewing" },
];

function StepBar({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-xs">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                  done
                    ? "text-white"
                    : active
                      ? "text-black"
                      : "bg-gray-200 text-gray-400"
                }`}
                style={
                  done
                    ? { backgroundColor: "#B5E533" }
                    : active
                      ? { backgroundColor: "#B5E533", boxShadow: "0 0 0 4px #B5E53340" }
                      : {}
                }
              >
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  done || active ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-4 mx-1 rounded transition-all"
                style={{ backgroundColor: i < current ? "#B5E533" : "#E5E7EB" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AssistanceBanner() {
  const navigate = useNavigate();
  const { activeOrder, releaseOrder } = useOrder();
  const [updatedFlash, setUpdatedFlash] = useState(false);
  const prevItemsKey = useRef<string>("");

  const visible =
    activeOrder &&
    (activeOrder.status === "TRANSFERRED" || activeOrder.status === "IN_PROGRESS");

  // Flash the items list when a team member edits the order
  useEffect(() => {
    if (!activeOrder) return;
    const key = JSON.stringify(activeOrder.items);
    if (prevItemsKey.current && prevItemsKey.current !== key) {
      setUpdatedFlash(true);
      const t = setTimeout(() => setUpdatedFlash(false), 1500);
      return () => clearTimeout(t);
    }
    prevItemsKey.current = key;
  }, [activeOrder?.items]);

  if (!visible) return null;

  const isReviewing = activeOrder.status === "IN_PROGRESS";
  const step: 0 | 1 | 2 = isReviewing ? 2 : 1;
  const total = activeOrder.total ?? activeOrder.items.reduce((s, i) => s + i.price * i.qty, 0) * 1.1;

  function handleProceed() {
    // Capture data before releasing (releaseOrder clears activeOrder)
    const orderNumber = activeOrder!.orderNumber;
    const items = activeOrder!.items;
    const orderTotal = activeOrder!.total;
    releaseOrder(activeOrder!.orderId);
    navigate("/payment", {
      state: {
        orderNumber,
        cartItems: items.map((i) => ({
          id: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        total: orderTotal,
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-5 rounded-3xl px-8 py-8 shadow-2xl w-full max-w-md mx-4"
        style={{ backgroundColor: "#F1F1EC" }}
      >
        {/* Step indicator */}
        <StepBar current={step} />

        {/* Icon + status */}
        <div className="flex flex-col items-center gap-2 mt-1">
          {isReviewing ? (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#B5E533" }}
            >
              <UserCheck className="w-8 h-8 text-black" />
            </div>
          ) : (
            <div className="relative w-16 h-16">
              <div
                className="w-16 h-16 rounded-full border-4 border-gray-200 animate-spin"
                style={{ borderTopColor: "#B5E533" }}
              />
              <Clock className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
            </div>
          )}

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Order
            </p>
            <p className="text-4xl font-extrabold text-gray-900">
              #{activeOrder.orderNumber}
            </p>
          </div>

          <p className="text-center font-bold text-gray-700 text-sm">
            {isReviewing
              ? "A team member is reviewing your order"
              : "Looking for an available team member…"}
          </p>
          {isReviewing && (
            <p className="text-xs text-gray-400 text-center">
              Items may be adjusted. Review below before proceeding.
            </p>
          )}
        </div>

        {/* Order items */}
        <div
          className={`w-full rounded-2xl overflow-hidden border transition-all duration-300 ${
            updatedFlash ? "border-[#B5E533] shadow-md" : "border-gray-200"
          }`}
          style={{ backgroundColor: "#fff" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Your order
              </span>
            </div>
            {updatedFlash && (
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-black"
                style={{ backgroundColor: "#B5E533" }}
              >
                Updated
              </span>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto divide-y divide-gray-50">
            {activeOrder.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center text-black shrink-0"
                    style={{ backgroundColor: "#B5E533" }}
                  >
                    {item.qty}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-600 shrink-0 ml-2">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <span className="text-sm font-bold text-gray-700">Total</span>
            <span className="text-base font-extrabold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {isReviewing ? (
          <button
            onClick={handleProceed}
            className="w-full py-4 rounded-full font-extrabold text-base text-black transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: "#B5E533" }}
          >
            Looks Good — Proceed to Payment
          </button>
        ) : (
          <button
            onClick={() => releaseOrder(activeOrder.orderId)}
            className="w-full py-3 rounded-full border-2 border-gray-300 text-gray-500 font-bold text-sm hover:border-gray-400 hover:bg-gray-100 transition-all"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
}
