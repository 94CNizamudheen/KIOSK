import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Order, WsMessage, OrderLineItem } from "@/types/order";
import type { CartItem } from "@/types/product";
import { orderEventBus } from "@/services/orderWebSocket/orderEventBus";
import { orderWebSocketService } from "@/services/orderWebSocket/orderWebSocket.service";
import * as orderDb from "@/services/orderDb.service";
import { getPosUrl, getTerminalId } from "@/services/connectionConfig";

interface OrderContextValue {
  activeOrder: Order | null;
  isConnected: boolean;
  requestAssistance: (items: CartItem[]) => void;
  updateOrder: (orderId: string, items: CartItem[]) => void;
  releaseOrder: (orderId: string) => void;
  claimOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

function toLineItems(items: CartItem[]): OrderLineItem[] {
  return items.map((i) => ({
    productId: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    subtotal: i.price * i.qty,
  }));
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Keep a ref so event handlers can read current activeOrder without stale closure
  const activeOrderRef = useRef<Order | null>(null);
  activeOrderRef.current = activeOrder;

  useEffect(() => {
    // Boot WS connection — config stored in localStorage, falls back to env vars
    orderWebSocketService.init(getPosUrl(), getTerminalId(), "KIOSK");
    orderWebSocketService.onConnectionChange(setIsConnected);

    // ── Event subscriptions ──────────────────────────────────────────────────

    const unsubs = [
      // On reconnect: reconcile active orders
      orderEventBus.subscribe(
        "IDENTIFIED",
        (msg: WsMessage<{ activeOrders: Order[] }>) => {
          setIsConnected(true);
          const myId = orderWebSocketService.getTerminalId();
          const mine = msg.payload.activeOrders.find(
            (o) =>
              o.originTerminal.terminalId === myId ||
              o.ownerTerminal?.terminalId === myId,
          );
          setActiveOrder(mine ?? null);
        },
      ),

      // KIOSK sent REQUEST_ASSISTANCE → server confirms order created
      orderEventBus.subscribe(
        "ORDER_AVAILABLE",
        (msg: WsMessage<{ order: Order }>) => {
          const myId = orderWebSocketService.getTerminalId();
          if (msg.payload.order.originTerminal.terminalId === myId) {
            orderDb.upsertOrder(msg.payload.order);
            setActiveOrder(msg.payload.order);
          }
        },
      ),

      // POS sent order to this KIOSK
      orderEventBus.subscribe(
        "ORDER_ASSIGNED",
        (msg: WsMessage<{ order: Order }>) => {
          setActiveOrder(msg.payload.order);
          orderDb.upsertOrder(msg.payload.order);
          navigate("/menu");
        },
      ),

      // Order updated (POS editing, status change, etc.)
      orderEventBus.subscribe(
        "ORDER_UPDATED",
        (msg: WsMessage<{ order: Order }>) => {
          orderDb.upsertOrder(msg.payload.order);
          setActiveOrder((prev) =>
            prev?.orderId === msg.payload.order.orderId
              ? msg.payload.order
              : prev,
          );
        },
      ),

      // POS completed payment
      orderEventBus.subscribe(
        "ORDER_COMPLETED",
        (msg: WsMessage<{ order: Order }>) => {
          orderDb.upsertOrder(msg.payload.order);
          if (activeOrderRef.current?.orderId === msg.payload.order.orderId) {
            setActiveOrder(null);
            navigate("/confirmed");
          }
        },
      ),

      // Order expired without action
      orderEventBus.subscribe(
        "ORDER_EXPIRED",
        (msg: WsMessage<{ orderId: string }>) => {
          orderDb.updateOrderStatus(msg.payload.orderId, "EXPIRED");
          if (activeOrderRef.current?.orderId === msg.payload.orderId) {
            setActiveOrder(null);
            setTimeout(() => navigate("/"), 5000);
          }
        },
      ),
    ];

    return () => {
      unsubs.forEach((fn) => fn());
      orderWebSocketService.disconnect();
    };
  }, [navigate]);

  function requestAssistance(items: CartItem[]) {
    orderWebSocketService.requestAssistance(toLineItems(items));
  }

  function updateOrder(orderId: string, items: CartItem[]) {
    orderWebSocketService.updateOrder(orderId, toLineItems(items));
  }

  function releaseOrder(orderId: string) {
    orderWebSocketService.releaseOrder(orderId);
    setActiveOrder(null);
  }

  function claimOrder(orderId: string) {
    orderWebSocketService.claimOrder(orderId);
  }

  return (
    <OrderContext.Provider
      value={{
        activeOrder,
        isConnected,
        requestAssistance,
        updateOrder,
        releaseOrder,
        claimOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside OrderProvider");
  return ctx;
}
