use tauri::Manager;

pub mod db;

// ─── Commands ────────────────────────────────────────────────────────────────
// Add your Rust commands here.
// Call from frontend: invoke("command_name", { arg: value })

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello from Rust, {}!", name)
}

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
            greet
            // add more commands here
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
