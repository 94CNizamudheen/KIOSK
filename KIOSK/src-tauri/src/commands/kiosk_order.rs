use tauri::{command, AppHandle};
use crate::db::{self, models::{kiosk_order::KioskOrder, kiosk_order_repo}};

/// Persist or update an order received via WebSocket into local SQLite.
#[command]
pub fn upsert_order(app: AppHandle, order: KioskOrder) -> Result<(), String> {
    let conn = db::connection(&app);
    kiosk_order_repo::upsert_order(&conn, &order).map_err(|e| e.to_string())
}

/// Fetch a single order by ID.
#[command]
pub fn get_order(app: AppHandle, order_id: String) -> Result<Option<KioskOrder>, String> {
    let conn = db::connection(&app);
    kiosk_order_repo::get_order(&conn, &order_id).map_err(|e| e.to_string())
}

/// Fetch all non-terminal orders.
#[command]
pub fn get_active_orders(app: AppHandle) -> Result<Vec<KioskOrder>, String> {
    let conn = db::connection(&app);
    kiosk_order_repo::get_active_orders(&conn).map_err(|e| e.to_string())
}

/// Update the status of a local order record.
#[command]
pub fn update_order_status(
    app: AppHandle,
    order_id: String,
    status: String,
) -> Result<bool, String> {
    let conn = db::connection(&app);
    kiosk_order_repo::update_order_status(&conn, &order_id, &status)
        .map_err(|e| e.to_string())
}

/// Mark a local order as completed with optional payment method.
#[command]
pub fn mark_order_completed(
    app: AppHandle,
    order_id: String,
    payment_method: Option<String>,
) -> Result<bool, String> {
    let conn = db::connection(&app);
    kiosk_order_repo::mark_completed(&conn, &order_id, payment_method.as_deref())
        .map_err(|e| e.to_string())
}

/// Delete a local order record.
#[command]
pub fn delete_order(app: AppHandle, order_id: String) -> Result<bool, String> {
    let conn = db::connection(&app);
    kiosk_order_repo::delete_order(&conn, &order_id).map_err(|e| e.to_string())
}
