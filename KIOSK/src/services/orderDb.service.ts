import { invoke } from "@tauri-apps/api/core";
import type { Order } from "@/types/order";

/**
 * Persist or update an order in the local Kiosk SQLite DB.
 * Call this whenever the Kiosk receives an order event from the server.
 */
export async function upsertOrder(order: Order): Promise<void> {
  await invoke("upsert_order", { order });
}

/**
 * Fetch a single order from local DB by ID.
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  return invoke<Order | null>("get_order", { orderId });
}

/**
 * Fetch all non-terminal (active) orders from local DB.
 */
export async function getActiveOrders(): Promise<Order[]> {
  return invoke<Order[]>("get_active_orders");
}

/**
 * Update just the status field of a local order record.
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<boolean> {
  return invoke<boolean>("update_order_status", { orderId, status });
}

/**
 * Mark a local order as COMPLETED with optional payment method.
 */
export async function markOrderCompleted(
  orderId: string,
  paymentMethod?: string,
): Promise<boolean> {
  return invoke<boolean>("mark_order_completed", { orderId, paymentMethod });
}

/**
 * Remove an order from local DB entirely.
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  return invoke<boolean>("delete_order", { orderId });
}
