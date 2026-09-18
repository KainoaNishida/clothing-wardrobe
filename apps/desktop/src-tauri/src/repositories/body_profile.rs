use std::collections::HashMap;

use rusqlite::{params, Connection, OptionalExtension};
use uuid::Uuid;

pub struct BodyProfileRecord {
    pub id: String,
    pub display_name: Option<String>,
    pub unit_system: String,
    pub template_id: String,
    pub measurement_completeness: String,
    pub measurements: HashMap<String, f64>,
    pub created_at: i64,
    pub updated_at: i64,
}

pub struct BodyProfileWrite {
    pub display_name: Option<String>,
    pub height_cm: f64,
    pub measurement_completeness: String,
    pub measurements: HashMap<String, f64>,
    pub template_id: String,
    pub unit_system: String,
}

struct BodyProfileRow {
    id: String,
    display_name: Option<String>,
    unit_system: String,
    template_id: String,
    measurement_completeness: String,
    created_at: i64,
    updated_at: i64,
}

pub fn load_current(connection: &Connection) -> Result<Option<BodyProfileRecord>, rusqlite::Error> {
    let profile = connection
        .query_row(
            "SELECT id, display_name, unit_system, template_id, measurement_completeness, created_at, updated_at
             FROM body_profiles
             ORDER BY updated_at DESC
             LIMIT 1",
            [],
            |row| {
                Ok(BodyProfileRow {
                    id: row.get(0)?,
                    display_name: row.get(1)?,
                    unit_system: row.get(2)?,
                    template_id: row.get(3)?,
                    measurement_completeness: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .optional()?;

    match profile {
        Some(profile) => {
            let measurements = load_measurements(connection, &profile.id)?;

            Ok(Some(BodyProfileRecord {
                id: profile.id,
                display_name: profile.display_name,
                unit_system: profile.unit_system,
                template_id: profile.template_id,
                measurement_completeness: profile.measurement_completeness,
                measurements,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            }))
        }
        None => Ok(None),
    }
}

pub fn save_current(
    connection: &mut Connection,
    write: BodyProfileWrite,
    now: i64,
) -> Result<String, rusqlite::Error> {
    let existing = connection
        .query_row(
            "SELECT id FROM body_profiles ORDER BY updated_at DESC LIMIT 1",
            [],
            |row| row.get::<_, String>(0),
        )
        .optional()?;

    let profile_id = existing.unwrap_or_else(|| Uuid::new_v4().to_string());
    let transaction = connection.transaction()?;

    transaction.execute(
        "INSERT INTO body_profiles (
            id, display_name, unit_system, template_id, height_cm, measurement_completeness, created_at, updated_at
         )
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
            display_name = excluded.display_name,
            unit_system = excluded.unit_system,
            template_id = excluded.template_id,
            height_cm = excluded.height_cm,
            measurement_completeness = excluded.measurement_completeness,
            updated_at = excluded.updated_at",
        params![
            profile_id,
            write.display_name.as_deref(),
            write.unit_system,
            write.template_id,
            write.height_cm,
            write.measurement_completeness,
            now,
            now
        ],
    )?;

    transaction.execute(
        "DELETE FROM body_measurements WHERE body_profile_id = ?1",
        params![profile_id],
    )?;

    for (key, value_cm) in write.measurements {
        transaction.execute(
            "INSERT INTO body_measurements (
                id, body_profile_id, measurement_key, value_cm, source, required, created_at, updated_at
             )
             VALUES (?1, ?2, ?3, ?4, 'manual', 1, ?5, ?6)",
            params![Uuid::new_v4().to_string(), profile_id, key, value_cm, now, now],
        )?;
    }

    transaction.commit()?;
    Ok(profile_id)
}

fn load_measurements(
    connection: &Connection,
    profile_id: &str,
) -> Result<HashMap<String, f64>, rusqlite::Error> {
    let mut statement = connection.prepare(
        "SELECT measurement_key, value_cm
         FROM body_measurements
         WHERE body_profile_id = ?1",
    )?;
    let rows = statement.query_map(params![profile_id], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))
    })?;
    let mut measurements = HashMap::new();

    for row in rows {
        let (key, value_cm) = row?;
        measurements.insert(key, value_cm);
    }

    Ok(measurements)
}
