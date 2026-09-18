use rusqlite::Connection;

use crate::error::AppError;

pub fn migrate(connection: &Connection) -> Result<(), AppError> {
    connection.execute_batch(include_str!("../../migrations/0001_initial.sql"))?;
    ensure_body_profile_template_column(connection)?;
    Ok(())
}

fn ensure_body_profile_template_column(connection: &Connection) -> Result<(), AppError> {
    let mut statement = connection.prepare("PRAGMA table_info(body_profiles)")?;
    let rows = statement.query_map([], |row| row.get::<_, String>(1))?;

    for row in rows {
        if row? == "template_id" {
            return Ok(());
        }
    }

    connection.execute(
        "ALTER TABLE body_profiles ADD COLUMN template_id TEXT NOT NULL DEFAULT 'average_average'",
        [],
    )?;

    Ok(())
}
