use rusqlite::Connection;

use crate::error::AppError;

pub fn migrate(connection: &Connection) -> Result<(), AppError> {
    connection.execute_batch(include_str!("../../migrations/0001_initial.sql"))?;
    Ok(())
}
