import { OrderWebSocketClient } from "./OrderWebSocketClient";
import { orderEventBus } from "./orderEventBus";
import type { OrderLineItem, TerminalType } from "@/types/order";

class OrderWebSocketService {
  private client: OrderWebSocketClient | null = null;
  private connectionChangeCb: ((connected: boolean) => void) | null = null;

  /** Creates a new WS client and connects. Safe to call again for reconnect with new settings. */
  init(wsUrl: string, terminalId: string, terminalType: TerminalType): void {
    if (this.client) {
      this.client.disconnect();
    }

    const client = new OrderWebSocketClient(wsUrl, terminalId, terminalType);

    // Route every incoming WS message into the event bus
    client.on("*", (msg) => orderEventBus.emit(msg));

    // Re-apply stored connection change callback on new client
    if (this.connectionChangeCb) {
      client.onConnectionChange(this.connectionChangeCb);
    }

    this.client = client;
    client.connect().catch(console.error);
  }

  disconnect(): void {
    this.client?.disconnect();
    this.client = null;
  }

  isConnected(): boolean {
    return this.client?.isConnected() ?? false;
  }

  getTerminalId(): string {
    return this.client?.getTerminalId() ?? "";
  }

  forceReconnect(): void {
    this.client?.forceReconnect();
  }

  onConnectionChange(cb: (connected: boolean) => void): void {
    this.connectionChangeCb = cb;
    this.client?.onConnectionChange(cb);
  }

  // ─── KIOSK actions ────────────────────────────────────────────────────────

  /** KIOSK: request cashier assistance with current cart */
  requestAssistance(items: OrderLineItem[]): void {
    this.client?.send("REQUEST_ASSISTANCE", { items });
  }

  /** KIOSK customer accepted the POS-sent order (proceed to payment or add more items) */
  acceptKioskOrder(orderId: string): void {
    this.client?.send("KIOSK_ACCEPTED", { orderId });
  }

  /** KIOSK customer completed payment — persists completed order to POS DB */
  completeKioskOrder(
    orderId: string | null,
    items: OrderLineItem[],
    method: string,
  ): void {
    this.client?.send("KIOSK_COMPLETE_ORDER", { orderId, items, method });
  }

  // ─── Shared actions ───────────────────────────────────────────────────────

  /** Either terminal: update order items */
  updateOrder(orderId: string, items: OrderLineItem[]): void {
    this.client?.send("UPDATE_ORDER", { orderId, items });
  }

  /** Either terminal: release order ownership back to unclaimed */
  releaseOrder(orderId: string): void {
    this.client?.send("RELEASE_ORDER", { orderId });
  }

  /** KIOSK claiming its own order number (POS→KIOSK flow) */
  claimOrder(orderId: string): void {
    this.client?.send("CLAIM_ORDER", { orderId });
  }
}

export const orderWebSocketService = new OrderWebSocketService();
