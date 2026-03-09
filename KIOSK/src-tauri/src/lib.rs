use tauri::Manager;

pub mod commands;
pub mod db;

// ─── Entry point ─────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            db::init(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::kiosk_order::upsert_order,
            commands::kiosk_order::get_order,
            commands::kiosk_order::get_active_orders,
            commands::kiosk_order::get_order_by_number,
            commands::kiosk_order::get_app_state,
            commands::kiosk_order::set_app_state,
            commands::kiosk_order::clear_all_data,
            commands::kiosk_order::update_order_status,
            commands::kiosk_order::mark_order_completed,
            commands::kiosk_order::delete_order,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
