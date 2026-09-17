# Version 1 App Architecture Contract v0

## Purpose

This contract defines the technical architecture direction for version 1 of the clothing wardrobe app.

The current architectural goal is to prove the hardest product thesis first: a private, local wardrobe app with a body-aware mannequin that can represent the user's proportions credibly enough to make outfit previewing useful.

## Accepted Architecture Direction

The following decisions are accepted for the first prototype:

- Build a desktop shell first, not a web-first app.
- Start as a local single-user app.
- Keep all user wardrobe data, body measurements, and uploaded images private on the user's machine in the first prototype.
- Use a React and TypeScript interface embedded in the desktop shell.
- Use Three.js through React Three Fiber for the 3D mannequin and outfit renderer.
- Use a local database, likely SQLite, for prototype persistence.
- Store wardrobe images and generated assets in local app storage.
- Run product-link import as an in-request prototype first.
- Use deterministic outfit recommendations first.
- Keep body measurement onboarding manual and illustrated. Do not use AI for onboarding guidance in version 1.

This direction intentionally optimizes for the mannequin, wardrobe, and local desktop experience before cloud sync, multi-user auth, mobile, or production deployment.

## Why The Direction Changed

A web-first architecture would make account-backed sync, mobile access, and hosted AI workflows easier. It would also bias early decisions toward server routes, cloud storage, web deployment, and multi-user authorization before the core desktop mannequin experience is proven.

Because this product is expected to feel like a focused desktop tool and may later be hard to migrate cleanly from a web-first shape, the first implementation should be designed as a desktop app from the start.

The contract should still preserve future flexibility. The domain logic, measurement engine, renderer, recommendation rules, and import pipeline should live in reusable packages so they can later support a cloud backend or mobile client.

## Recommended Prototype Architecture

Version 1 should start as a local desktop monorepo built around:

- A desktop shell, with the exact shell still undecided between Tauri and Electron.
- React, TypeScript, and Vite for the app UI.
- Three.js through React Three Fiber for the 3D scene.
- Drei camera controls for rotate, zoom, and front/side/back presets.
- A deterministic measurement engine that converts user measurements into mannequin parameters.
- A deterministic garment engine that converts garment metadata into simple category-specific shells.
- SQLite for local structured data.
- Local app-data file storage for clothing images, thumbnails, and generated assets.
- A small local import service for public product-page extraction.
- Optional AI extraction only as a later fallback for clothing metadata or garment measurements, not for body-measurement onboarding.

## Decision Needed: Desktop Shell

The accepted product direction is "desktop shell first." The remaining architecture decision is which desktop shell to use.

### Option A: Tauri

Tauri packages a web UI inside a native desktop shell using the operating system's WebView and a Rust backend.

Pros:

- Smaller app bundles than Electron in many cases.
- Strong security model with explicit permissions and capabilities.
- Good fit for local files, native menus, and desktop packaging.
- Encourages a clean boundary between UI code and privileged native code.
- Better long-term posture if the app should feel lightweight and native.

Cons:

- Adds Rust and Tauri-specific app architecture.
- More friction if the app needs heavy Node.js tooling inside the desktop app.
- Product-link importing with browser automation may require extra design, such as a Node sidecar, external service, or simpler HTTP extraction first.
- Smaller ecosystem than Electron for some desktop integrations.

### Option B: Electron

Electron packages a Chromium browser and Node.js runtime with the app.

Pros:

- Mature desktop ecosystem.
- JavaScript and Node can be used across the app shell and local services.
- Easier first path for local product import, filesystem workflows, image processing, and Playwright-style browser automation.
- Large community and many examples for local SQLite apps.
- Faster if we want the prototype to stay mostly TypeScript.

Cons:

- Larger application footprint.
- Requires careful renderer/main-process security discipline.
- Can encourage mixing UI, privileged filesystem code, and local service code unless boundaries are enforced.
- Less lightweight than Tauri.

### Current Lean

This is a genuine tradeoff.

If the first prototype values fast local implementation and product-link import experimentation, Electron is the pragmatic choice.

If the first prototype values a smaller, more native-feeling app and cleaner long-term desktop boundaries, Tauri is the cleaner choice.

My current recommendation is:

- Choose Electron if in-app product importing and TypeScript-only iteration are the highest priorities for the first prototype.
- Choose Tauri if the desktop shell itself should set the long-term foundation and we are comfortable handling import automation more carefully.

## Accepted Decision: Local Single-User Prototype First

The first prototype should not require real user accounts.

Rules:

- Treat the prototype as one private local user.
- Design the data model with stable IDs and owner-like boundaries so future sync is possible.
- Do not expose body measurements, wardrobe images, or import data to remote services unless a feature explicitly requires it.
- Avoid building multi-user authorization until the cloud/sync direction is chosen.

This keeps the first milestone focused on body profile creation, mannequin accuracy, wardrobe item creation, outfit building, and saved outfits.

## Clarification Needed: Backend Provider Shape

Earlier options compared an integrated backend against a composable backend. In a local desktop prototype, this decision changes meaning.

The prototype does not need a hosted backend provider at all. The first "backend" can be local app code plus a local database plus local file storage.

The backend-provider decision becomes a future sync/cloud decision.

### Option A: Integrated Cloud Backend Later

Examples: a Supabase-style setup with Auth, Postgres, Storage, and row-level security in one platform.

Pros:

- Fastest path from local prototype to private synced accounts.
- Auth, database, storage, and authorization policies live close together.
- Good match for private per-user wardrobe and body data.
- Lower integration burden.

Cons:

- Some vendor coupling.
- App architecture may start following the provider's way of doing things.
- Local-first sync can be harder if the cloud backend becomes the source of truth too early.

### Option B: Composable Cloud Backend Later

Examples: separate auth provider, hosted Postgres, object storage, background worker, and AI services.

Pros:

- More control over each piece.
- Easier to replace one layer without replacing the whole backend.
- Useful if recommendations, imports, and AI become specialized services.

Cons:

- More integration work.
- More privacy and authorization surfaces to design.
- More operational complexity before the product has proven the core loop.

### Option C: Local-First With Optional Sync Later

Keep the desktop app's local database as the primary user experience, then add sync after the local model is stable.

Pros:

- Best match for a private desktop-first product.
- The app remains useful offline.
- Reduces pressure to solve multi-user infrastructure before the mannequin and wardrobe are good.
- Keeps body data local by default.

Cons:

- Sync is a hard engineering problem when added later.
- Conflict handling must be designed if users edit on multiple devices.
- Mobile support eventually needs either sync or a separate data-access strategy.

### Current Lean

For version 1, defer the cloud provider choice. Build local-first, but keep the data model sync-ready.

The next cloud decision should happen only after the mannequin, wardrobe, outfit builder, and local persistence loop are working.

## Clarification Needed: ORM And Schema Management

An ORM or query layer is the code that defines the database schema, runs migrations, and gives the app typed access to persisted data.

For a desktop-first local prototype, the database should likely be SQLite. The ORM decision should be judged by how well it supports:

- Local SQLite development.
- Clear schema migrations.
- TypeScript type safety.
- A future path to cloud Postgres or sync.
- Packaging inside a desktop app.

### Option A: Drizzle

Drizzle is a TypeScript-first schema and query toolkit that stays close to SQL.

Pros:

- Transparent schema definitions.
- SQL-like query style.
- Good fit when we want to understand and control the database shape.
- Works with SQLite and Postgres.
- Easier to keep migrations explicit.
- Good match for measurement tables where schema clarity matters.

Cons:

- Less abstracted than Prisma.
- Some app patterns require more explicit SQL thinking.
- Developer experience can feel more manual.

### Option B: Prisma

Prisma uses a schema file to generate a typed client for database access.

Pros:

- Very polished developer experience.
- Strong generated client.
- Excellent documentation and community adoption.
- Comfortable for fast CRUD-heavy app development.
- Good local SQLite support for many prototypes.

Cons:

- More abstracted from SQL.
- Future row-level security or advanced SQL policy work may require extra care.
- Desktop packaging can require attention around generated clients and native engines.
- Switching between local SQLite and future Postgres may require more migration discipline.

### Option C: Lightweight SQL Query Builder

Examples: Kysely or carefully organized raw SQL.

Pros:

- Very explicit and portable.
- Minimal abstraction.
- Strong for local-first apps where SQL clarity matters.

Cons:

- More manual schema and migration work.
- Less of a full batteries-included app data layer.
- More room for inconsistency if patterns are not enforced.

### Current Lean

My recommendation is Drizzle for the first implementation, because the app needs a clear local schema, measurement-heavy tables, and a plausible future path to Postgres or sync. Prisma is also reasonable if you strongly prefer the generated-client workflow and faster CRUD ergonomics.

This decision should be judged before implementation starts.

## High-Level System Diagram

```text
Desktop app shell
  |
  | React + TypeScript UI
  | - wardrobe catalogue
  | - body profile onboarding
  | - outfit builder
  | - saved outfits
  | - client-side 3D scene
  |
Local app services
  |
  | measurement engine
  | garment shell engine
  | deterministic recommendation engine
  | product-link import prototype
  |
Local persistence
  |
  | SQLite database
  | local image and asset storage
```

## Codebase Shape

The repository should start as a small monorepo.

Recommended structure:

```text
apps/
  desktop/
    src/
    public/
packages/
  domain/
  renderer/
  measurement/
  garments/
  recommender/
  importer/
  db/
docs/
```

Package responsibilities:

- `apps/desktop`: desktop shell, app composition, local service wiring, window behavior.
- `packages/domain`: clothing categories, units, confidence models, outfit entities, shared types.
- `packages/renderer`: React Three Fiber scene, camera controls, mannequin and garment render components.
- `packages/measurement`: body measurement normalization, mannequin parameter mapping, validation, estimation.
- `packages/garments`: garment shell parameters, ease calculations, layer ordering, category rules.
- `packages/recommender`: deterministic outfit-generation rules.
- `packages/importer`: public product-page extraction, parsing, source evidence, future AI extraction schemas.
- `packages/db`: SQLite schema, migrations, typed query helpers.

This keeps the core product logic out of UI components and makes future cloud or mobile work less painful.

## Desktop App Boundaries

The desktop app should have explicit boundaries between:

- UI renderer code.
- Privileged local app code.
- Database access.
- Filesystem access.
- Product import code.
- Optional AI calls.

Rules:

- The UI should not directly own filesystem paths, API keys, or privileged import logic.
- The 3D renderer should consume normalized body and garment parameters.
- Body measurement validation should happen before data reaches the renderer.
- Product imports should produce editable drafts, not confirmed wardrobe items.
- Any future AI provider key must stay outside the untrusted renderer surface.

## Frontend Architecture

The app should feel like a focused desktop tool, not a landing page.

Primary views:

- Body Profile.
- Wardrobe.
- Clothing Item Detail.
- Outfit Builder.
- Recommendations.
- Saved Outfits.
- Privacy and Data Settings.

The main wardrobe and outfit builder view should use the split layout:

- Left: searchable, filterable wardrobe catalogue.
- Right: black 3D environment with mannequin and selected outfit.

UI state should be separated into:

- Persistent local state: body profile, clothing items, measurements, outfits, imports.
- Local interaction state: selected item, active filters, panel state, active camera preset.
- Renderer state: mannequin parameters, garment parameters, camera, render quality.

## 3D Renderer Architecture

The renderer should use React Three Fiber on top of Three.js.

Version 1 renderer modules:

- `WardrobeScene`: owns canvas, lighting, environment, camera controls, and scene layout.
- `Mannequin`: renders the parametric body mesh.
- `GarmentLayer`: renders category-specific garment shells.
- `OutfitComposition`: maps selected outfit data into mannequin and garment render props.
- `CameraControls`: front, side, back, reset, rotate, zoom.
- `RenderQualityController`: pixel ratio, shadows, antialiasing, and future quality settings.

Initial 3D decisions:

- Use GLB/glTF for the base mannequin asset.
- Use a neutral unisex base mesh with morph targets or procedural transforms.
- Use simple generated garment meshes first.
- Use color and pattern labels for visual identity.
- Defer image projection until the mannequin and shell system is stable.
- Keep rendering deterministic so measurement changes produce understandable visual changes.

## Mannequin Engine

The mannequin engine should be deterministic and testable outside the UI.

Inputs:

- Required user body measurements.
- Optional user body measurements.
- Unit preference.
- Measurement completeness.

Outputs:

- Mannequin parameters.
- Body landmarks.
- Circumference regions.
- Segment lengths.
- Renderer-ready mesh parameters.

Rules:

- Measurement conversion must happen before rendering.
- Missing optional measurements should be estimated and labeled as estimated.
- Body shape logic should live in `packages/measurement`, not inside React components.
- Rendering should consume normalized body parameters rather than raw form fields.

## Garment Rendering Engine

Garment rendering should be deterministic and category-specific.

Inputs:

- Clothing category and subcategory.
- Garment measurements.
- Fit descriptor.
- Measurement confidence.
- Dominant colors and pattern labels.
- Layer order.

Outputs:

- Garment shell geometry parameters.
- Ease values.
- Fit notes.
- Renderer material parameters.

Rules:

- The renderer should never treat AI-estimated measurements as confirmed.
- Low-confidence measurements can affect visuals but should not produce strong fit notes.
- Fit notes should remain descriptive and non-judgmental.

## Local Data Model Areas

The first local database schema should cover:

- Local profile.
- Body profiles.
- Body measurements.
- Clothing items.
- Clothing images.
- Garment measurements.
- Measurement sources and confidence.
- Outfits.
- Outfit items.
- Product import drafts.
- Generated assets.

Because the first prototype is local single-user, not every table needs an account owner. Still, entities should use stable IDs and timestamps so future sync is possible.

Sensitive fields:

- Raw body measurements.
- Clothing photos.
- Product import URLs.
- AI extraction inputs and outputs, if added later.
- Saved outfit notes.

## Local Storage Architecture

Use local app-data storage for:

- Original uploaded clothing photos.
- Product images saved by the user through imports.
- Generated thumbnails.
- Future segmentation masks.
- Future generated textures.

Recommended local path shape:

```text
app-data/
  wardrobe/
    clothing/
      {itemId}/
        original/
        thumbnails/
        generated/
  database/
```

Rules:

- Do not store body measurements in logs.
- Generate thumbnails for catalogue browsing.
- Keep original images available for future reprocessing.
- Strip unnecessary image metadata where feasible.
- Add export and delete flows before treating the app as production-ready.

## Product Link Import Architecture

Product link import should begin as an in-request prototype.

Flow:

1. User submits a public product URL.
2. The desktop app validates the URL.
3. The local import service fetches or inspects the public page.
4. The importer extracts metadata, product images, size data, and candidate measurements when possible.
5. The importer creates an editable clothing-item draft.
6. The user reviews and confirms imported data.

Rules:

- Do not require logged-in retailer pages.
- Do not bypass anti-bot systems.
- Do not scrape private accounts.
- Reject local, private-network, and non-HTTP(S) URLs.
- Keep source and confidence on every imported measurement.
- Prefer saved HTML fixtures for tests instead of live retailer tests.

Future upgrade:

- Move imports to an async local queue or cloud worker if they become slow, flaky, or browser-automation-heavy.

Shell-specific note:

- Electron makes local Node and Playwright-style import experiments easier.
- Tauri may push us toward simple HTTP extraction first, a Node sidecar, or a later import service.

## AI Architecture

AI should not be used for body-measurement onboarding in version 1.

Acceptable future AI uses:

- Product metadata cleanup.
- Category and subcategory detection.
- Color and pattern labels.
- Measurement extraction from product descriptions.
- Measurement estimation from clothing images when no better source exists.

Rules:

- AI outputs must remain editable by the user.
- Store AI source and confidence.
- Do not treat AI-estimated garment measurements as exact.
- Avoid sending body measurements or wardrobe photos to any remote provider unless the feature explicitly requires it and the privacy disclosure is clear.
- Keep prompt and schema versions if AI extraction is added.

## Recommendation Architecture

Version 1 recommendations should be deterministic first.

Inputs:

- Category coverage.
- Color labels.
- Pattern labels.
- Tags.
- Season or weather tags if available.
- Previously saved outfits.
- User exclusions or favorites, if available.

Outputs:

- Outfit candidates.
- Explanation tags such as "complete outfit", "uses saved favorite", or "lightweight outerwear".

Rules:

- Recommendations should be framed as outfit ideas, not authority.
- The recommendation engine should not be coupled to the 3D renderer.
- Users should be able to edit, save, or ignore recommendations.
- AI styling assistance can be considered later after the deterministic engine produces usable outfit candidates.

## Privacy And Security Architecture

Privacy requirements are central even in a local prototype.

Requirements:

- Body measurements and wardrobe images stay local by default.
- The app should make it clear when data is imported from or sent to the web.
- Do not log raw body measurements.
- Do not log raw clothing photos.
- Do not log full imported product-page HTML unless intentionally stored for debugging fixtures.
- Users should be able to delete clothing items, photos, saved outfits, and body profiles.
- Future cloud sync must be opt-in or clearly part of the product contract.

Architecture rule: even before real accounts exist, design private data as if future sync will need strict ownership boundaries.

## Testing Strategy

The test plan should match the product's risk areas.

Unit tests:

- Unit conversion.
- Measurement validation.
- Body parameter generation.
- Garment ease calculation.
- Fit note generation.
- Recommendation rules.

Integration tests:

- Local database migrations.
- Clothing item creation.
- Image metadata records.
- Product import draft lifecycle.
- AI extraction schema validation, if added.

Renderer tests:

- Mannequin renders for representative body profiles.
- Garment shells render for each category.
- Front, side, and back views remain framed.
- Zoom controls stay bounded.
- Empty scene, loading scene, and error scene are not blank.

End-to-end tests:

- Create body profile.
- Add clothing item.
- Build outfit.
- Save outfit.
- Reopen saved outfit.
- Import product URL and review draft.

## Distribution And Deployment

The first prototype can be run locally by developers.

Prototype requirements:

- Clear install instructions.
- Local development command.
- Local database setup and migration command.
- Seed data for testing body profiles and wardrobe items.
- Manual export or backup path documented before real personal data is used heavily.

Production desktop distribution is a later decision. It will depend on the desktop shell choice.

## Future Cloud And Mobile Path

Future versions may add:

- Cloud sync.
- Real user accounts.
- Cross-device wardrobe access.
- Mobile app.
- Cloud product-import workers.
- AI-powered recommendations.
- External clothing search.

To preserve this path:

- Keep domain and measurement logic platform-agnostic.
- Keep renderer logic separate from desktop shell code.
- Use stable IDs for local entities.
- Store source and confidence metadata for imported measurements.
- Avoid assuming the local database will be the only storage forever.

## Research Sources

- React Three Fiber introduction: https://r3f.docs.pmnd.rs/
- React Three Fiber performance guidance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Drei controls: https://drei.docs.pmnd.rs/controls/introduction
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js OrbitControls: https://threejs.org/docs/pages/OrbitControls.html
- Tauri architecture: https://v2.tauri.app/concept/architecture/
- Tauri sidecars: https://v2.tauri.app/develop/sidecar/
- Tauri security: https://v2.tauri.app/security/
- Tauri capabilities: https://tauri.app/security/capabilities/
- Electron process model: https://www.electronjs.org/docs/latest/tutorial/process-model
- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Playwright browser automation docs: https://playwright.dev/docs/pages
- Playwright browser contexts: https://playwright.dev/docs/browser-contexts
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Drizzle schema: https://orm.drizzle.team/docs/sql-schema-declaration
- Prisma SQLite database connector: https://docs.prisma.io/docs/orm/core-concepts/supported-databases/sqlite
- OpenAI images and vision guide: https://platform.openai.com/docs/guides/images-vision
- OpenAI structured outputs guide: https://platform.openai.com/docs/guides/structured-outputs

## Resolved Architecture Decisions

- Build desktop shell first.
- Start local single-user.
- Use local persistence first.
- Keep 3D rendering client-side inside the desktop UI.
- Use React Three Fiber and Three.js for the renderer.
- Run product imports in-request for the prototype.
- Use deterministic recommendations first.
- Keep body-measurement onboarding manual and illustrated.
- Defer cloud auth, hosted storage, and multi-user authorization.

## Decisions For User Judgment

1. Desktop shell: Tauri or Electron?
2. Local database/query layer: Drizzle, Prisma, or a lighter SQL query builder?
3. Future backend direction: integrated cloud backend, composable cloud backend, or local-first sync?
4. Product import implementation detail: simple HTTP extraction first, or browser automation early?
5. Mannequin interaction details from the mannequin contract: live measurement preview, weight handling, and pose scope.
