# Technical Architecture Design v0

## Status

This is the first implementation-oriented architecture design for the clothing wardrobe app.

Accepted inputs:

- Desktop shell first.
- Tauri first.
- Local single-user prototype first.
- React, TypeScript, and Vite for the UI.
- React Three Fiber and Three.js for the 3D scene.
- Manual illustrated body-measurement onboarding.
- Deterministic recommendations first.
- In-request product imports first.

Accepted implementation choice:

- Use Rust-owned SQLite behind Tauri commands for the first prototype.

This is the selected first persistence strategy. It is cleaner for Tauri than forcing a Node-style ORM into the desktop shell.

## Architecture Summary

The app should be a local Tauri desktop application with a React WebView frontend and a Rust privileged backend.

```text
React + Vite WebView
  |
  | Tauri invoke commands
  |
Rust app core
  |
  | services
  | repositories
  | filesystem
  | product import
  |
SQLite + local app files
```

The WebView should own interactive UI, local UI state, and 3D rendering. The Rust side should own privileged operations: persistence, filesystem writes, local asset paths, import fetching, and future native integrations.

## Selected Stack

- Desktop shell: Tauri 2.
- Frontend: React, TypeScript, Vite.
- 3D renderer: Three.js through React Three Fiber.
- Camera helpers: Drei.
- Local database: SQLite.
- Privileged backend: Rust Tauri commands.
- Local files: Tauri app data and local app data directories.
- Product import: Rust-side HTTP extraction first.
- Node sidecar: deferred until browser automation becomes necessary.
- Cloud backend: deferred.
- Accounts/auth: deferred.

## Why Not Electron

Electron would make Node-based import tooling and Drizzle-based local persistence more direct. Tauri is now the chosen shell because the product should be designed from the beginning as a lightweight native-feeling desktop app with strict boundaries between UI and privileged local operations.

The tradeoff is that we should not assume a Node runtime exists inside the app. That changes the database and import design.

## Accepted Persistence Decision

Choosing Tauri creates three viable persistence options. The selected path is Rust-owned SQLite behind Tauri commands.

### Option A: Rust-Owned SQLite Commands

The Rust side owns SQLite access. The frontend calls typed Tauri commands such as `list_clothing_items`, `save_body_profile`, and `save_outfit`.

Pros:

- Clean Tauri boundary.
- Database is not exposed directly to renderer code.
- Local filesystem and database logic can share the same Rust app state.
- Works naturally with Tauri permissions.
- Keeps sensitive body and wardrobe data behind command APIs.

Cons:

- More Rust code.
- TypeScript domain types and Rust DTOs must be kept aligned.
- Drizzle is not the runtime query layer.

Decision: use this for the first prototype.

### Option B: Tauri SQL Plugin From Renderer

The frontend uses `@tauri-apps/plugin-sql` to query SQLite directly.

Pros:

- Faster to prototype simple CRUD.
- Less Rust repository code.
- Official Tauri path for frontend-to-SQL access.
- Built-in migration support through the plugin.

Cons:

- Gives renderer-side code database access.
- Components can drift toward direct SQL unless a strict data module is enforced.
- Weaker boundary for sensitive body and wardrobe data.

Use this only if Rust-owned commands slow the prototype too much.

### Option C: Node Sidecar With Drizzle

A bundled Node sidecar owns SQLite access using Drizzle.

Pros:

- Keeps Drizzle and most app logic in TypeScript.
- Strong TypeScript schema and migration ergonomics.
- Easier path for Playwright-like browser automation later.

Cons:

- More packaging complexity.
- More moving parts inside the desktop app.
- Less Tauri-native than Rust-owned commands.
- Requires a sidecar IPC protocol in addition to Tauri commands.

Use this later only if product import or TypeScript-only persistence becomes more valuable than architectural simplicity.

## Process Model

The app has two primary runtime surfaces.

### React WebView

Responsibilities:

- Application layout and navigation.
- Body measurement forms.
- Wardrobe catalogue UI.
- Outfit builder UI.
- Deterministic recommendation UI.
- 3D scene rendering.
- Live mannequin preview from unsaved form inputs.
- Calling Tauri commands through a narrow TypeScript API client.

Non-responsibilities:

- Raw filesystem writes.
- Raw local asset paths.
- Database connections.
- Product page fetching.
- API keys or secret handling.

### Rust App Core

Responsibilities:

- App startup and local directory creation.
- SQLite connection and migrations.
- Repository layer for persisted entities.
- Tauri command handlers.
- Local asset ingestion and deletion.
- Product URL validation and HTTP fetching.
- Future sidecar process management if needed.
- Future export/backup flows.

Non-responsibilities:

- 3D rendering.
- UI state.
- Mannequin mesh rendering.
- Frontend layout.

## Monorepo Layout

```text
apps/
  desktop/
    package.json
    index.html
    vite.config.ts
    src/
      app/
      components/
      features/
        body-profile/
        wardrobe/
        outfits/
        recommendations/
      renderer/
      tauri/
        api-client.ts
        commands.ts
        dto.ts
      styles/
    src-tauri/
      Cargo.toml
      tauri.conf.json
      capabilities/
      migrations/
      src/
        lib.rs
        commands/
        services/
        repositories/
        db/
        filesystem/
        import/
packages/
  domain/
  measurement/
  garments/
  renderer/
  recommender/
  importer/
  testing/
docs/
```

Package responsibilities:

- `apps/desktop/src/app`: app frame, navigation, top-level state composition.
- `apps/desktop/src/features`: feature-specific React UI.
- `apps/desktop/src/tauri`: typed frontend wrappers around `invoke`.
- `apps/desktop/src-tauri/src/commands`: command handlers exposed to the WebView.
- `apps/desktop/src-tauri/src/services`: application workflows.
- `apps/desktop/src-tauri/src/repositories`: SQL-backed persistence.
- `packages/domain`: shared TypeScript product concepts and validation helpers.
- `packages/measurement`: body measurement normalization and mannequin parameter generation.
- `packages/garments`: garment shell parameter generation.
- `packages/renderer`: React Three Fiber scene primitives.
- `packages/recommender`: deterministic outfit rules.
- `packages/importer`: shared extraction schemas and parsing helpers where practical.

## Command Boundary

Frontend code should not call `invoke` directly from components. Components call a TypeScript API client, and the API client calls Tauri commands.

Example command families:

```text
app_get_status()
body_get_profile()
body_save_profile(input)
wardrobe_list_items(query)
wardrobe_create_item(input)
wardrobe_update_item(input)
wardrobe_import_image(input)
wardrobe_delete_item(input)
outfits_list()
outfits_save(input)
outfits_delete(input)
imports_preview_product_url(input)
assets_get_url(input)
```

Rules:

- Commands return DTOs, not database rows.
- Commands return structured errors.
- Commands should not expose raw absolute file paths unless the renderer needs an asset URL.
- Command names should be stable because the frontend API client depends on them.
- Long-running commands should return progress events or become queued later.

## Type Boundary

The first prototype can keep TypeScript DTOs and Rust Serde structs manually aligned.

Rules:

- Keep DTOs small and specific.
- Prefer explicit command input/output types over giant shared models.
- Add generated bindings later if command drift becomes painful.
- Do not expose internal database columns as public command contracts.

## Local Data Model Draft

SQLite tables for the first prototype:

```text
app_settings
body_profiles
body_measurements
clothing_items
clothing_images
garment_measurements
outfits
outfit_items
import_drafts
generated_assets
```

Common columns:

- `id` as text UUID.
- `created_at` as ISO timestamp or integer milliseconds.
- `updated_at` as ISO timestamp or integer milliseconds.
- `deleted_at` nullable for recoverable local deletes where useful.

### `body_profiles`

Stores the local user's body profile.

Key fields:

- `id`
- `display_name`
- `unit_system`
- `height_cm`
- `measurement_completeness`
- `created_at`
- `updated_at`

### `body_measurements`

Stores body measurements as typed rows so the measurement set can evolve.

Key fields:

- `id`
- `body_profile_id`
- `measurement_key`
- `value_cm`
- `source`
- `required`
- `created_at`
- `updated_at`

### `clothing_items`

Stores wardrobe item metadata.

Key fields:

- `id`
- `category`
- `subcategory`
- `brand`
- `name`
- `size_label`
- `primary_color`
- `pattern`
- `source_url`
- `notes`
- `created_at`
- `updated_at`

### `clothing_images`

Stores metadata about local image files.

Key fields:

- `id`
- `clothing_item_id`
- `asset_id`
- `role`
- `width`
- `height`
- `created_at`

### `garment_measurements`

Stores measurements needed for garment shell rendering.

Key fields:

- `id`
- `clothing_item_id`
- `measurement_key`
- `value_cm`
- `source`
- `confidence`
- `created_at`
- `updated_at`

### `outfits` And `outfit_items`

Stores saved outfits and their item order/layering.

Key fields:

- `outfits.id`
- `outfits.name`
- `outfits.notes`
- `outfit_items.outfit_id`
- `outfit_items.clothing_item_id`
- `outfit_items.layer_index`
- `outfit_items.slot`

### `import_drafts`

Stores product URL import previews before the user confirms them.

Key fields:

- `id`
- `source_url`
- `status`
- `raw_title`
- `raw_brand`
- `candidate_json`
- `error_message`
- `created_at`
- `updated_at`

## Local File Layout

Use app-specific directories rather than arbitrary user filesystem paths.

Recommended layout:

```text
AppData/
  clothing-wardrobe/
    wardrobe.db
    migrations-state/
AppLocalData/
  clothing-wardrobe/
    assets/
      clothing/
        {itemId}/
          original/
          thumbnails/
          generated/
      imports/
      exports/
```

Rules:

- Store the SQLite database in app data.
- Store larger images in local app data.
- Store only relative asset references in SQLite.
- Resolve real paths on the Rust side.
- Return scoped asset URLs to the WebView, not arbitrary filesystem paths.
- Add export/backup before encouraging long-term real wardrobe use.

## Asset Loading

The renderer needs to show local clothing photos and future generated textures.

Initial design:

1. Rust imports an image into app-local asset storage.
2. Rust records relative asset metadata in SQLite.
3. Frontend requests a display URL through `assets_get_url`.
4. Rust returns a Tauri asset URL that is scoped to app-owned asset folders.
5. The WebView uses that URL in image elements or Three.js textures.

Security rule: the Tauri asset protocol scope should include only app-owned asset folders.

## Body Profile Flow

```text
Body Profile UI
  |
  | live form values
  v
packages/measurement
  |
  | mannequin parameters
  v
3D Mannequin Preview

On save:

Body Profile UI
  |
  | body_save_profile(input)
  v
Rust command -> body service -> SQLite
```

Rules:

- Live preview should update before saving.
- Save should persist normalized centimeter values.
- Missing optional measurements should be marked estimated.
- The renderer should receive normalized mannequin parameters, not raw form field state.

## 3D Renderer Flow

```text
Body profile + selected outfit
  |
packages/measurement + packages/garments
  |
renderer props
  |
React Three Fiber scene
```

Initial scene:

- Black or near-black environment.
- Neutral mannequin placeholder.
- Camera controls for rotate and zoom.
- Preset camera buttons: front, side, back, reset.
- Simple garment shell placeholders.

The first renderer milestone should not wait for final mannequin asset quality. It should prove that the split-pane app and camera controls work.

## Wardrobe Flow

```text
Wardrobe UI
  |
  | wardrobe_list_items(query)
  v
Rust command -> repository -> SQLite
  |
  | item DTOs with asset ids
  v
Wardrobe catalogue
```

Adding an item:

1. User chooses category and metadata.
2. User imports an image or adds a product URL.
3. Rust copies image assets into app-local storage.
4. Rust saves item metadata and image records.
5. UI refreshes the catalogue and can select the new item into an outfit.

## Product Import Flow

The first import flow is in-request and public-page-only.

```text
Product URL form
  |
  | imports_preview_product_url(url)
  v
Rust import service
  |
  | validate URL
  | reject local/private network targets
  | HTTP fetch public page
  | extract title, brand, image candidates, size hints
  v
Editable import draft
```

Rules:

- Start with simple HTTP extraction.
- Do not bypass retailer anti-bot systems.
- Do not support logged-in retailer pages.
- Store measurement source and confidence.
- If simple extraction is too weak, decide between a Node sidecar and later cloud importer.

## Recommendation Flow

Recommendations should be deterministic and local.

```text
Wardrobe items + saved outfits + tags
  |
packages/recommender
  |
outfit candidates
  |
Outfit Builder UI
```

Initial rule examples:

- Prefer complete outfits with top, pants, and shoes.
- Respect category availability.
- Avoid duplicate category conflicts unless layering is valid.
- Prefer saved-favorite colors or tags when available.
- Add simple explanation labels.

## Security And Privacy

Local prototype requirements:

- Do not load remote app code.
- Do not send body measurements to remote services.
- Do not log raw body measurements.
- Do not log local image paths unnecessarily.
- Scope local file and asset access to app-owned directories.
- Keep product import URL validation on the Rust side.
- Use explicit Tauri capabilities instead of broad filesystem permissions.

Future cloud requirements:

- Add account ownership before sync.
- Treat body measurements and wardrobe images as sensitive data.
- Make cloud sync explicit in the product contract before implementation.

## First Scaffold Milestone

The first code milestone should create the skeleton, not the full product.

Must include:

- Tauri app boots locally.
- React/Vite app loads inside Tauri.
- Desktop split layout exists.
- Left pane shows sample wardrobe items.
- Right pane shows a black 3D scene.
- A mannequin placeholder renders.
- Camera rotate, zoom, front, side, and back controls exist.
- `app_get_status` Tauri command works.
- Local app directories are created on startup.
- Package layout is in place.

Nice to include:

- Initial SQLite connection and migration.
- One persisted body profile.
- One persisted clothing item.

Not included yet:

- Real garment simulation.
- Product URL import.
- AI extraction.
- Cloud sync.
- Mobile support.

## Testing Strategy

Unit tests:

- `packages/measurement`.
- `packages/garments`.
- `packages/recommender`.
- TypeScript command API client mapping.

Rust tests:

- URL validation.
- Repository CRUD.
- Migration application.
- Asset path resolution.

Renderer verification:

- App launches.
- Canvas is nonblank.
- Camera controls respond.
- Mannequin remains framed on desktop viewport.

End-to-end tests:

- Start after the first scaffold is running.
- Use fixture data first.
- Add Tauri-specific desktop automation after the basic UI is stable.

## Open Decisions

1. Decide whether product import starts as simple HTTP extraction only, or whether we plan for browser automation early.
2. Decide whether body measurement edits should update the mannequin live before saving.
3. Decide whether optional weight is excluded, hidden, or allowed as optional context.
4. Decide whether version 1 mannequin pose is neutral only.

## Sources

- Tauri architecture: https://v2.tauri.app/concept/architecture/
- Tauri frontend-to-Rust commands: https://v2.tauri.app/develop/calling-rust/
- Tauri file system plugin: https://v2.tauri.app/plugin/file-system/
- Tauri SQL plugin: https://v2.tauri.app/plugin/sql/
- Tauri sidecars: https://v2.tauri.app/develop/sidecar/
- Tauri asset protocol config: https://v2.tauri.app/reference/config/
- React Three Fiber: https://r3f.docs.pmnd.rs/
- Drei controls: https://drei.docs.pmnd.rs/controls/introduction
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
