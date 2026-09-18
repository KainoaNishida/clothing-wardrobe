mod app_state;
mod commands;
mod db;
mod error;
mod repositories;
mod services;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let state = app_state::AppState::initialize(app.handle())?;
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::app::app_get_status,
            commands::body::body_get_profile,
            commands::body::body_save_profile
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
