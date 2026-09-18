use tauri::State;

use crate::{
    app_state::AppState,
    error::AppError,
    services::body_profile::{self, BodyProfileDto, SaveBodyProfileInput},
};

#[tauri::command]
pub fn body_get_profile(state: State<'_, AppState>) -> Result<Option<BodyProfileDto>, AppError> {
    let db = state
        .db
        .lock()
        .map_err(|_| AppError::State("database lock was poisoned".to_string()))?;

    body_profile::get_current_profile(&db)
}

#[tauri::command]
pub fn body_save_profile(
    state: State<'_, AppState>,
    input: SaveBodyProfileInput,
) -> Result<BodyProfileDto, AppError> {
    let mut db = state
        .db
        .lock()
        .map_err(|_| AppError::State("database lock was poisoned".to_string()))?;

    body_profile::save_current_profile(&mut db, input)
}
