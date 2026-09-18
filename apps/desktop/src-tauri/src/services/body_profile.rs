use std::{
    collections::{HashMap, HashSet},
    time::{SystemTime, UNIX_EPOCH},
};

use rusqlite::Connection;
use serde::{Deserialize, Serialize};

use crate::{
    error::AppError,
    repositories::body_profile::{self, BodyProfileRecord, BodyProfileWrite},
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveBodyProfileInput {
    display_name: Option<String>,
    measurements: HashMap<String, f64>,
    template_id: Option<String>,
    unit_system: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyProfileDto {
    id: String,
    display_name: Option<String>,
    unit_system: String,
    template_id: String,
    measurement_completeness: String,
    measurements: HashMap<String, f64>,
    created_at: i64,
    updated_at: i64,
}

struct MeasurementRule {
    key: &'static str,
    label: &'static str,
    min_cm: f64,
    max_cm: f64,
}

const MEASUREMENT_RULES: [MeasurementRule; 9] = [
    MeasurementRule {
        key: "heightCm",
        label: "Height",
        min_cm: 80.0,
        max_cm: 230.0,
    },
    MeasurementRule {
        key: "shoulderWidthCm",
        label: "Shoulders",
        min_cm: 20.0,
        max_cm: 80.0,
    },
    MeasurementRule {
        key: "chestCircumferenceCm",
        label: "Chest",
        min_cm: 45.0,
        max_cm: 220.0,
    },
    MeasurementRule {
        key: "waistCircumferenceCm",
        label: "Waist",
        min_cm: 35.0,
        max_cm: 220.0,
    },
    MeasurementRule {
        key: "hipCircumferenceCm",
        label: "Hips",
        min_cm: 45.0,
        max_cm: 230.0,
    },
    MeasurementRule {
        key: "torsoLengthCm",
        label: "Torso",
        min_cm: 25.0,
        max_cm: 110.0,
    },
    MeasurementRule {
        key: "inseamCm",
        label: "Inseam",
        min_cm: 35.0,
        max_cm: 140.0,
    },
    MeasurementRule {
        key: "armLengthCm",
        label: "Arm",
        min_cm: 25.0,
        max_cm: 110.0,
    },
    MeasurementRule {
        key: "footLengthCm",
        label: "Foot",
        min_cm: 10.0,
        max_cm: 45.0,
    },
];

const TEMPLATE_IDS: [&str; 9] = [
    "short_slim",
    "short_average",
    "short_wide",
    "average_slim",
    "average_average",
    "average_wide",
    "tall_slim",
    "tall_average",
    "tall_wide",
];

pub fn get_current_profile(connection: &Connection) -> Result<Option<BodyProfileDto>, AppError> {
    Ok(body_profile::load_current(connection)?.map(BodyProfileDto::from))
}

pub fn save_current_profile(
    connection: &mut Connection,
    input: SaveBodyProfileInput,
) -> Result<BodyProfileDto, AppError> {
    validate_unit_system(&input.unit_system)?;
    validate_measurements(&input.measurements)?;
    let template_id = normalize_template_id(input.template_id)?;

    let now = current_timestamp()?;
    let measurements = input.measurements;
    let height_cm = *measurements
        .get("heightCm")
        .ok_or_else(|| AppError::Validation("Height is required".to_string()))?;
    let write = BodyProfileWrite {
        display_name: normalize_display_name(input.display_name),
        height_cm,
        measurement_completeness: "complete".to_string(),
        measurements,
        template_id,
        unit_system: input.unit_system,
    };
    let profile_id = body_profile::save_current(connection, write, now)?;

    body_profile::load_current(connection)?
        .filter(|profile| profile.id == profile_id)
        .map(BodyProfileDto::from)
        .ok_or_else(|| AppError::State("saved body profile could not be loaded".to_string()))
}

impl From<BodyProfileRecord> for BodyProfileDto {
    fn from(record: BodyProfileRecord) -> Self {
        Self {
            id: record.id,
            display_name: record.display_name,
            unit_system: record.unit_system,
            template_id: record.template_id,
            measurement_completeness: record.measurement_completeness,
            measurements: record.measurements,
            created_at: record.created_at,
            updated_at: record.updated_at,
        }
    }
}

fn normalize_template_id(template_id: Option<String>) -> Result<String, AppError> {
    let value = template_id.unwrap_or_else(|| "average_average".to_string());

    if TEMPLATE_IDS.contains(&value.as_str()) {
        Ok(value)
    } else {
        Err(AppError::Validation(format!(
            "Unknown mannequin template: {value}"
        )))
    }
}

fn validate_unit_system(unit_system: &str) -> Result<(), AppError> {
    match unit_system {
        "metric" | "imperial" => Ok(()),
        _ => Err(AppError::Validation(
            "Unit system must be metric or imperial".to_string(),
        )),
    }
}

fn validate_measurements(measurements: &HashMap<String, f64>) -> Result<(), AppError> {
    let allowed_keys = MEASUREMENT_RULES
        .iter()
        .map(|rule| rule.key)
        .collect::<HashSet<_>>();

    for key in measurements.keys() {
        if !allowed_keys.contains(key.as_str()) {
            return Err(AppError::Validation(format!(
                "Unknown body measurement key: {key}"
            )));
        }
    }

    for rule in MEASUREMENT_RULES {
        let value = measurements
            .get(rule.key)
            .ok_or_else(|| AppError::Validation(format!("{} is required", rule.label)))?;

        if !value.is_finite() {
            return Err(AppError::Validation(format!(
                "{} must be a number",
                rule.label
            )));
        }

        if *value < rule.min_cm || *value > rule.max_cm {
            return Err(AppError::Validation(format!(
                "{} must be between {} and {} cm",
                rule.label, rule.min_cm, rule.max_cm
            )));
        }
    }

    Ok(())
}

fn normalize_display_name(display_name: Option<String>) -> Option<String> {
    display_name.and_then(|name| {
        let trimmed = name.trim();

        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn current_timestamp() -> Result<i64, AppError> {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| AppError::State(format!("system clock error: {error}")))?;

    Ok(duration.as_secs() as i64)
}
