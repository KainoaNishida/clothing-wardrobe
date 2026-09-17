use serde::Serialize;
use tauri::State;

use crate::{app_state::AppState, error::AppError};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
    app_name: String,
    architecture: String,
    persistence: String,
    app_data_dir: String,
    app_local_data_dir: String,
    database_path: String,
    database_ready: bool,
}

#[tauri::command]
pub fn app_get_status(state: State<'_, AppState>) -> Result<AppStatus, AppError> {
    let db = state
        .db
        .lock()
        .map_err(|_| AppError::State("database lock was poisoned".to_string()))?;

    db.query_row("SELECT COUNT(*) FROM app_settings", [], |_| Ok(()))?;

    Ok(AppStatus {
        app_name: "Clothing Wardrobe".to_string(),
        architecture: "Tauri + React/Vite".to_string(),
        persistence: "Rust-owned SQLite behind Tauri commands".to_string(),
        app_data_dir: state.app_data_dir.display().to_string(),
        app_local_data_dir: state.app_local_data_dir.display().to_string(),
        database_path: state.database_path.display().to_string(),
        database_ready: true,
    })
}
