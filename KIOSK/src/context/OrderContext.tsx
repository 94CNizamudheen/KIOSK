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
  /** Set when POS assigns an order to this KIOSK — cleared once customer dismisses */
  posAssignedOrder: Order | null;
  clearPosAssignedOrder: () => void;
  clearActiveOrder: () => void;
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
  const [posAssignedOrder, setPosAssignedOrder] = useState<Order | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Keep refs so event handlers can read current values without stale closures
  const activeOrderRef = useRef<Order | null>(null);
  activeOrderRef.current = activeOrder;
  const posAssignedOrderRef = useRef<Order | null>(null);
  posAssignedOrderRef.current = posAssignedOrder;

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

      // POS sent order to this KIOSK — show review overlay, navigate to menu in background
      orderEventBus.subscribe(
        "ORDER_ASSIGNED",
        (msg: WsMessage<{ order: Order }>) => {
          const order = msg.payload.order;
          setActiveOrder(order);
          orderDb.upsertOrder(order);
          setPosAssignedOrder(order);
          navigate("/menu");
        },
      ),

      // Order updated (POS editing, status change, recall, etc.)
      orderEventBus.subscribe(
        "ORDER_UPDATED",
        (msg: WsMessage<{ order: Order }>) => {
          const updated = msg.payload.order;
          orderDb.upsertOrder(updated);

          // POS recalled the order: server sets status='TRANSFERRED', ownerTerminal=null
          // and broadcasts to all. We detect this by checking posAssignedOrder matches
          // AND the update has no owner (the KIOSK customer's own releaseOrder clears
          // posAssignedOrderRef before the WS round-trip comes back, so no false trigger).
          if (
            posAssignedOrderRef.current?.orderId === updated.orderId &&
            !updated.ownerTerminal &&
            updated.status === "TRANSFERRED"
          ) {
            setPosAssignedOrder(null);
            setActiveOrder(null);
            navigate("/");
            return;
          }

          setActiveOrder((prev) =>
            prev?.orderId === updated.orderId ? updated : prev,
          );
          // Keep posAssignedOrder in sync (items may be updated by POS)
          setPosAssignedOrder((prev) =>
            prev?.orderId === updated.orderId ? updated : prev,
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
          const { orderId } = msg.payload;
          orderDb.updateOrderStatus(orderId, "EXPIRED");
          if (posAssignedOrderRef.current?.orderId === orderId) {
            setPosAssignedOrder(null);
          }
          if (activeOrderRef.current?.orderId === orderId) {
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
        posAssignedOrder,
        clearPosAssignedOrder: () => setPosAssignedOrder(null),
        clearActiveOrder: () => setActiveOrder(null),
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
