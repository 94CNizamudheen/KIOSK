use tauri::{command, AppHandle};
use crate::db::{self, models::{kiosk_order::KioskOrder, kiosk_order_repo, app_state_repo}};

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

/// Find a non-terminal order by its human-readable order number (e.g. "A047").
#[command]
pub fn get_order_by_number(app: AppHandle, order_number: String) -> Result<Option<KioskOrder>, String> {
    let conn = db::connection(&app);
    kiosk_order_repo::get_order_by_number(&conn, &order_number).map_err(|e| e.to_string())
}

/// Get a value from the app_state table by key.
#[command]
pub fn get_app_state(app: AppHandle, key: String) -> Result<Option<String>, String> {
    let conn = db::connection(&app);
    app_state_repo::get(&conn, &key).map_err(|e| e.to_string())
}

/// Set (upsert) a value in the app_state table.
#[command]
pub fn set_app_state(app: AppHandle, key: String, value: String) -> Result<(), String> {
    let conn = db::connection(&app);
    app_state_repo::set(&conn, &key, &value).map_err(|e| e.to_string())
}

/// Wipe every user table in the local Kiosk DB.
/// Called when POS sends a CLEAR_KIOSK_DATA command.
#[command]
pub fn clear_all_data(app: AppHandle) -> Result<(), String> {
    let conn = db::connection(&app);

    let mut stmt = conn
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .map_err(|e| e.to_string())?;

    let tables: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    conn.execute("PRAGMA foreign_keys = OFF", []).map_err(|e| e.to_string())?;
    for table in &tables {
        conn.execute(&format!("DELETE FROM {}", table), []).ok();
    }
    conn.execute("PRAGMA foreign_keys = ON", []).map_err(|e| e.to_string())?;

    log::info!("clear_all_data: cleared {} table(s)", tables.len());
    Ok(())
}
