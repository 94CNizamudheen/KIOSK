import { Minus, Plus, Trash2, HeadphonesIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "@/types/product";
import { useOrder } from "@/context/OrderContext";

interface CartSidebarProps {
  cartItems: CartItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartSidebar({
  cartItems,
  onIncrease,
  onDecrease,
  onRemove,
}: CartSidebarProps) {
  const navigate = useNavigate();
  const { requestAssistance, isConnected } = useOrder();
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const count = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <div
      className="flex flex-col h-full rounded-2xl p-5"
      style={{ backgroundColor: "#F1F1EC" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-extrabold text-gray-900">Your Cart</span>
        <span className="w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">
          {count}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">
            Your cart is empty
          </p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-white rounded-xl p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-800 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="w-5 text-center text-sm font-bold">
                  {item.qty}
                </span>
                <button
                  onClick={() => onIncrease(item.id)}
                  className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <Plus size={10} />
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-6 h-6 rounded-md bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition-colors ml-1"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-xs">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-3xl font-extrabold" style={{ color: "#B5E533" }}>
          ${total.toFixed(2)}
        </p>

        <button
          onClick={() => requestAssistance(cartItems)}
          disabled={cartItems.length === 0 || !isConnected}
          className="w-full py-3 rounded-full text-black font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "#B5E533" }}
        >
          <HeadphonesIcon size={16} />
          Request Assistance
        </button>

        <button
          onClick={() => navigate("/payment", { state: { cartItems, total } })}
          className="w-full py-4 rounded-full text-black font-extrabold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#B5E533" }}
        >
          Complete order
        </button>
      </div>
    </div>
  );
}
