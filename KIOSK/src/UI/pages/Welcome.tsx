import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Wifi, WifiOff } from "lucide-react";
import { useOrder } from "@/context/OrderContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { claimOrder, isConnected } = useOrder();
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    claimOrder(orderNumber.trim().toUpperCase());
    navigate("/menu");
  }

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center select-none relative"
      style={{ backgroundColor: "#F1F1EC" }}
      onClick={() => {
        if (!showOrderInput) navigate("/order-type");
      }}
    >
      {/* Connection status + settings — bottom right */}
      <div
        className="absolute bottom-6 right-6 flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {isConnected ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <Wifi className="w-3.5 h-3.5" />
            POS Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
            <WifiOff className="w-3.5 h-3.5" />
            POS Disconnected
          </span>
        )}
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition"
          title="POS Connection Settings"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {/* Brand */}
      <h1
        className="text-8xl mb-4"
        style={{ fontFamily: "'Pacifico', cursive", color: "#1C1C1C" }}
      >
        Delicious
      </h1>

      <p className="text-2xl font-semibold text-gray-400 mb-16">
        Self-Service Ordering
      </p>

      {/* CTA */}
      <button
        className="text-2xl font-bold px-16 py-5 rounded-full text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        style={{ backgroundColor: "#B5E533" }}
        onClick={(e) => {
          e.stopPropagation();
          navigate("/order-type");
        }}
      >
        Touch to proceed
      </button>

      <p className="mt-6 text-gray-400 text-base">Tap anywhere to get started</p>

      {/* Order number entry */}
      {!showOrderInput ? (
        <button
          className="mt-8 text-sm font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowOrderInput(true);
          }}
        >
          I have an order number
        </button>
      ) : (
        <form
          onSubmit={handleOrderSubmit}
          className="mt-8 flex flex-col items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. A047"
            className="px-6 py-3 rounded-full border-2 border-gray-300 text-center text-xl font-bold tracking-widest focus:outline-none focus:border-gray-600 w-48"
            style={{ backgroundColor: "#fff" }}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full text-black font-bold text-sm transition-all hover:opacity-80"
              style={{ backgroundColor: "#B5E533" }}
            >
              Continue
            </button>
            <button
              type="button"
              className="px-8 py-2.5 rounded-full border-2 border-gray-300 font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all"
              onClick={() => {
                setShowOrderInput(false);
                setOrderNumber("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
