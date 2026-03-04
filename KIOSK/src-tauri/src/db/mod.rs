pub mod migrate;

use tauri::AppHandle;

pub fn init(app: &AppHandle) {
    migrate::run_migrations_once(app);
}
