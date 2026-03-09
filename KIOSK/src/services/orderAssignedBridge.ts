import type { Order } from "@/types/order";

/**
 * Allows AppContext (parent) to trigger OrderContext (child) state updates
 * when ORDER_ASSIGNED arrives and position is SAME — without circular deps.
 */
type Handler = (order: Order) => void;
let _handler: Handler | null = null;

export const orderAssignedBridge = {
  register: (fn: Handler) => { _handler = fn; },
  trigger: (order: Order) => { _handler?.(order); },
};
