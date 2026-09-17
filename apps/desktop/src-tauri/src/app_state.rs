use std::{
    fs,
    path::PathBuf,
    sync::Mutex,
};

use rusqlite::Connection;
use tauri::Manager;

use crate::{db, error::AppError};

pub struct AppState {
    pub app_data_dir: PathBuf,
    pub app_local_data_dir: PathBuf,
    pub database_path: PathBuf,
    pub db: Mutex<Connection>,
}

impl AppState {
    pub fn initialize(app: &tauri::AppHandle) -> Result<Self, AppError> {
        let app_data_dir = app.path().app_data_dir()?;
        let app_local_data_dir = app.path().app_local_data_dir()?;
        let assets_dir = app_local_data_dir.join("assets");

        fs::create_dir_all(&app_data_dir)?;
        fs::create_dir_all(&assets_dir)?;
        fs::create_dir_all(assets_dir.join("clothing"))?;
        fs::create_dir_all(assets_dir.join("imports"))?;
        fs::create_dir_all(assets_dir.join("exports"))?;

        let database_path = app_data_dir.join("wardrobe.db");
        let connection = Connection::open(&database_path)?;
        db::migrate(&connection)?;

        Ok(Self {
            app_data_dir,
            app_local_data_dir,
            database_path,
            db: Mutex::new(connection),
        })
    }
}
