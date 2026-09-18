# 0001 Body Profile v0

## Summary

Build a local, private body measurement editor that saves one current body profile to Rust-owned SQLite, drives the mannequin shape live, and shows simple measurement guide overlays while editing.

## Implementation Checklist

- [x] Add plan and commit tracking docs.
- [x] Add `body_get_profile` and `body_save_profile` Tauri commands.
- [x] Persist the current body profile with the existing `body_profiles` and `body_measurements` tables.
- [x] Extend the measurement package with field metadata, defaults, validation, and unit conversion helpers.
- [x] Add a Body Profile UI with metric/imperial editing, validation, reset, and save state.
- [x] Drive the mannequin from the current body profile in both Body and Wardrobe modes.
- [x] Add body-profile guide markers to the 3D scene and hide them in outfit mode.

## Acceptance Criteria

- The app loads without a saved body profile and uses default draft body measurements.
- A user can edit height, shoulders, chest, waist, hips, torso, inseam, arms, and feet.
- Measurement edits update the mannequin preview immediately.
- The user can toggle between centimeters and inches without changing the stored centimeter values.
- Saving writes the body profile locally through Tauri commands and SQLite.
- Reloading the app restores the saved body profile.
- Body-profile guides are visible only in Body mode.
- Wardrobe search, filtering, outfit ideas, selected garments, camera presets, zoom, and orbit controls continue to work.

## Verification

- `npm run typecheck`
- `npm run build`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`

## Notes For Future Agents

- V0 intentionally supports one local body profile.
- Body measurements are private local prototype data and are not exposed through any network path.
- The mannequin remains abstract: silhouette and proportions matter more than anatomical realism.
- The existing schema was sufficient, so this feature does not add a migration.
