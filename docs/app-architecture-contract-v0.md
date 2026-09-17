# Version 1 App Architecture Contract v0

## Purpose

This contract defines the recommended technical architecture for version 1 of the clothing wardrobe app.

The goal is to choose a build shape that supports the product's hardest requirements without prematurely optimizing for future features:

- Private user accounts and sensitive body data.
- Desktop-first wardrobe and outfit building.
- A body-aware 3D mannequin.
- Clothing photo uploads and product-link imports.
- AI-assisted metadata and measurement extraction.
- Future mobile support.
- Future outfit and shopping recommendations.

## Research Summary

Research looked at five architecture families:

- Web-first app.
- Native desktop shell first.
- Local-first desktop app.
- Cloud-first account-backed app.
- Hybrid cloud app with a later native wrapper.

The strongest version 1 direction is a web-first, desktop-optimized application with a strict privacy model and a client-side 3D renderer. This keeps the product buildable, shareable, and ready for future mobile support while still serving the desktop-first experience.

Native desktop packaging should remain a later layer, not the version 1 foundation.

## Recommended Version 1 Architecture

Version 1 should be a TypeScript web application built around:

- Next.js App Router for the application shell, routing, server-side reads, server actions, and API route handlers.
- React for the interface.
- Three.js through React Three Fiber for the 3D mannequin and outfit renderer.
- Drei camera controls for rotate, zoom, and preset view ergonomics.
- PostgreSQL as the source of truth.
- Supabase-style Auth, Storage, and Row Level Security for private per-user data.
- Drizzle ORM and SQL migrations for typed database access and transparent schema evolution.
- A Node.js job worker for product-page imports, image analysis, and AI measurement extraction.
- Private object storage for clothing photos, generated thumbnails, and future texture assets.

The app should be desktop-first in layout and interaction design, but implemented as a responsive web application so that later mobile support is an extension rather than a rewrite.

## Decision Needed: App Shell

There are three viable app-shell strategies.

Option A: Web-first desktop app.

- Build a responsive web app optimized for desktop.
- Fastest path to product iteration.
- Easiest future path to mobile.
- Easier cloud auth, storage, product imports, and AI.
- Does not feel fully native unless later wrapped.

Option B: Tauri desktop app first.

- Better native desktop packaging and local filesystem affordances.
- Smaller native binaries than Electron because Tauri uses the OS WebView.
- Strong security model with explicit capabilities.
- Adds Rust/toolchain and desktop distribution complexity.
- Makes cloud/mobile product work less direct early on.

Option C: Electron desktop app first.

- Mature desktop app ecosystem.
- JavaScript/Node everywhere.
- Easier local Node-based product import and filesystem behavior.
- Larger app footprint.
- Requires careful security discipline around renderer/main-process boundaries.

Recommendation: choose Option A for version 1. Keep a future Tauri wrapper on the roadmap if native distribution, offline mode, or local file workflows become central.

## Decision Needed: Account Model

There are two viable version 1 account models.

Option A: Real user accounts from the start.

- Aligns with private per-user wardrobe and body data.
- Supports future mobile and sync.
- Makes storage and authorization architecture honest from the beginning.
- Adds setup and auth work before the app feels useful.

Option B: Local single-user prototype first.

- Faster for a visual mannequin prototype.
- Avoids auth while the product is still changing.
- Creates migration work later.
- Can hide privacy and authorization problems until too late.

Recommendation: use real accounts in version 1, while allowing local development to use a seeded test user. Body measurements and wardrobe data are sensitive enough that per-user authorization should not be bolted on later.

## Decision Needed: Backend Provider Shape

There are two reasonable backend shapes.

Option A: Integrated backend platform.

- Supabase-style Auth, Postgres, Storage, and RLS in one system.
- Strong match for private per-user data.
- Fast to prototype.
- Storage policies can live near database ownership rules.
- Some vendor coupling.

Option B: Composable backend.

- Auth provider, Postgres provider, object storage, and job worker chosen independently.
- More control and replaceability.
- More integration work.
- More privacy and authorization surfaces to design manually.

Recommendation: use an integrated Supabase-style backend for version 1 unless there is a strong reason to avoid it. The combination of Auth, Postgres, Storage, and RLS directly matches the product's privacy requirements.

## Decision Needed: ORM And Schema Management

There are two strong TypeScript database approaches.

Option A: Drizzle ORM.

- TypeScript schema definitions.
- SQL-like query style.
- Works well with Postgres and Supabase.
- Migration flow can generate SQL and still allow raw SQL for RLS policies.
- Less abstracted than Prisma.

Option B: Prisma ORM.

- Very mature developer experience.
- Strong generated client.
- Broad documentation and framework guidance.
- More abstracted schema layer.
- RLS and SQL policy work may require extra care.

Recommendation: use Drizzle for version 1 because this product needs transparent Postgres schema, RLS policies, and category-specific measurement tables that may benefit from staying close to SQL.

## High-Level System Diagram

```text
User browser
  |
  | Next.js app shell
  | - wardrobe catalogue
  | - body profile
  | - outfit builder
  | - client-only 3D scene
  |
Next.js server
  |
  | Server Components: internal reads
  | Server Actions: user-triggered mutations
  | Route Handlers: upload URLs, product import requests, future APIs
  |
Postgres + Auth + Storage
  |
  | private rows, private images, RLS policies
  |
Job worker
  |
  | product import
  | image analysis
  | AI measurement extraction
  | thumbnail/asset preparation
```

## Codebase Shape

The repository should start as a small monorepo, even if there is only one app at first.

Recommended structure:

```text
apps/
  web/
    app/
    components/
    lib/
    public/
packages/
  domain/
  renderer/
  measurement/
  importer/
  db/
docs/
```

Package responsibilities:

- `apps/web`: Next.js app, routes, UI composition, server actions, route handlers.
- `packages/domain`: product categories, measurement schemas, units, confidence models, outfit rules.
- `packages/renderer`: React Three Fiber scene, camera controls, mannequin and garment render components.
- `packages/measurement`: body measurement normalization, mannequin parameter mapping, garment ease calculations.
- `packages/importer`: product-page extraction, retailer parsing utilities, AI extraction schemas.
- `packages/db`: database schema, migrations, RLS policy SQL, typed query helpers.

This keeps the 3D renderer, measurement logic, and database model from being trapped inside UI components.

## Frontend Architecture

The frontend should be built as a desktop-first application interface, not a marketing site.

Primary routes:

- `/onboarding/body-profile`.
- `/wardrobe`.
- `/wardrobe/[itemId]`.
- `/outfits`.
- `/outfits/[outfitId]`.
- `/settings/privacy`.

The main wardrobe and outfit builder view should use the already defined split:

- Left: searchable, filterable wardrobe catalogue.
- Right: black 3D environment with mannequin and selected outfit.

UI state should be separated into:

- Persistent server state: wardrobe items, measurements, outfits, imports.
- Local interaction state: selected item, active filters, 3D camera state, hover state.
- Renderer state: mannequin parameters, garment shell parameters, camera preset, render quality.

## Next.js Data Boundaries

Use the Next.js App Router patterns this way:

- Server Components for internal reads where data can be fetched before rendering.
- Server Actions for mutations triggered by the app UI.
- Route Handlers for external-style endpoints, upload flows, product import submission, future mobile API endpoints, and webhooks.
- Node.js runtime by default, especially for imports, AI calls, image processing, and database operations.

The 3D renderer must be a client-only component. Three.js, React Three Fiber, and browser rendering APIs should not run during server rendering.

## 3D Renderer Architecture

The renderer should use React Three Fiber on top of Three.js.

Version 1 renderer modules:

- `WardrobeScene`: owns canvas, lighting, environment, camera controls, and scene layout.
- `Mannequin`: renders the parametric body mesh.
- `GarmentLayer`: renders category-specific garment shells.
- `OutfitComposition`: maps selected outfit data into mannequin and garment render props.
- `CameraControls`: front, side, back, reset, rotate, zoom.
- `RenderQualityController`: pixel ratio, shadows, antialiasing, and future low/high-quality assets.

Initial 3D decisions:

- Use GLB/glTF for base mannequin assets.
- Use a neutral unisex base mesh with morph targets or procedural transforms.
- Use simple generated garment meshes first.
- Use color and pattern labels for visual identity.
- Defer image projection until the mannequin and shell system is stable.
- Use demand-based rendering or performance scaling where possible so the 3D pane is not constantly expensive.

OffscreenCanvas and Web Workers are future optimizations. They should not be required for the first implementation unless mannequin or garment generation blocks the UI.

## Mannequin Engine

The mannequin engine should be deterministic and testable outside the UI.

Inputs:

- Required user body measurements.
- Optional user body measurements.
- Unit preference.
- Measurement confidence or completeness.

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
- Rendering should consume normalized body parameters rather than raw user form fields.

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

## Data Model Areas

The first database schema should cover:

- Users and private profiles.
- Body profiles.
- Body measurements.
- Clothing items.
- Clothing images.
- Garment measurements.
- Measurement sources and confidence.
- Outfits.
- Outfit items.
- Product import jobs.
- AI extraction runs.
- Generated assets.

Every private table should include an owner reference and RLS policy.

Sensitive fields:

- Raw body measurements.
- Clothing photos.
- Product import URLs.
- AI extraction inputs and outputs.
- Saved outfit notes.

## Storage Architecture

Use private object storage for:

- Original uploaded clothing photos.
- Product images copied with permission or user intent.
- Generated thumbnails.
- Future segmentation masks.
- Future generated textures.

Recommended storage path shape:

```text
users/{userId}/clothing/{itemId}/original/{assetId}
users/{userId}/clothing/{itemId}/thumb/{assetId}
users/{userId}/generated/{assetId}
```

Rules:

- Buckets should be private by default.
- Access should be mediated by signed URLs or authenticated storage policies.
- The app should generate thumbnails so catalogue browsing does not use full-resolution originals.
- Future image processing should strip unnecessary metadata where possible.

## Product Link Import Architecture

Product link import should be asynchronous.

Flow:

1. User submits a public product URL.
2. Server validates the URL.
3. Server creates an import job.
4. Worker fetches the public page.
5. Worker extracts metadata, product images, size data, and candidate measurements.
6. Worker uses AI only when structured extraction is insufficient.
7. Worker creates or updates a clothing item draft.
8. User reviews and confirms imported data.

Rules:

- Do not block the UI while extraction runs.
- Do not require logged-in retailer pages.
- Do not bypass anti-bot systems.
- Do not scrape private accounts.
- Protect against SSRF by rejecting local, private-network, and non-HTTP(S) URLs.
- Store raw extraction evidence only when useful and privacy-safe.
- Keep source and confidence on every imported measurement.

## AI Architecture

AI should be used as a fallback and assistant, not as the source of truth.

Version 1 AI use cases:

- Product metadata cleanup.
- Category and subcategory detection.
- Color and pattern labels.
- Measurement extraction from product descriptions.
- Measurement estimation from images when no better source exists.
- Optional body measurement guidance text.

AI outputs should use structured schemas wherever possible.

Rules:

- Store AI result confidence and source.
- Let users edit or reject AI outputs.
- Avoid sending body measurements or clothing photos to AI providers unless necessary for the specific feature and covered by privacy disclosure.
- Do not use user body data or wardrobe photos for shared model training without explicit opt-in.
- Prefer prompt and schema versioning so extraction behavior can be audited later.

## Recommendation Architecture

Version 1 recommendations should be separated into two layers:

- Rules layer: deterministic outfit ideas using category, color, weather/season tags if available, saved outfits, and user preferences.
- AI layer: optional natural-language styling assistant that explains or refines outfit ideas.

Recommendation data should not be entangled with the renderer. The renderer shows selected outfits; recommendation logic produces outfit candidates.

Decision needed: whether AI-assisted recommendations ship in the first release or after the catalogue, mannequin, and saved outfits are stable.

## Privacy And Security Architecture

Privacy requirements are central, not decorative.

Requirements:

- All user-owned rows must be protected by owner-scoped authorization.
- Storage objects must be private by default.
- Service-role keys and AI provider keys must never be exposed to the browser.
- Body measurements should not be logged in analytics.
- Product import workers should log job state, not sensitive raw body or wardrobe data.
- Users should be able to delete clothing items, photos, saved outfits, and body profiles.
- Future sharing features must exclude body data by default.

Architecture rule: if an endpoint can read or mutate private wardrobe data, it must be designed assuming another authenticated user may try to access it.

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

- Auth ownership checks.
- RLS policy behavior.
- Clothing item creation.
- Photo upload metadata.
- Product import job lifecycle.
- AI extraction schema validation.

Renderer tests:

- Mannequin renders for representative body profiles.
- Garment shells render for each category.
- Front, side, and back views remain framed.
- Zoom controls stay bounded.
- Empty scene, loading scene, and error scene are not blank.

Product import tests:

- Prefer saved HTML fixtures over live retailer tests.
- Test public product-page extraction against fixtures.
- Test failure paths and manual fallback.

End-to-end tests:

- Create body profile.
- Add clothing item.
- Build outfit.
- Save outfit.
- Reopen saved outfit.
- Import product URL and review draft.

## Deployment Architecture

Recommended deployment shape:

- Web app deployed as a Node-capable Next.js app.
- Postgres/Auth/Storage hosted by the backend platform.
- Product import and AI extraction run in a background worker.
- Environment secrets managed by the deployment provider.
- Separate environments for local, preview, and production.

Avoid relying on Edge runtime for version 1 because product import, AI, image processing, and database libraries are more compatible with Node.js.

## Observability

The app should track operational health without collecting sensitive body data.

Useful events:

- Import job started, completed, failed.
- AI extraction completed or failed.
- Clothing item created.
- Outfit saved.
- Renderer error.
- Upload failed.

Avoid:

- Raw body measurements in logs.
- Raw clothing photos in logs.
- Full product page HTML in logs.
- Sensitive prompt inputs in analytics.

## Native Desktop Roadmap

A native desktop app is not required for version 1.

If the product later needs native packaging, the preferred path is:

1. Keep the core app web-based.
2. Keep domain, measurement, renderer, and importer code in shared packages.
3. Add a Tauri wrapper if native packaging, local filesystem access, or offline mode becomes important.

Electron should be considered only if Tauri is blocked by required native capabilities or JavaScript/Node desktop integration becomes a decisive advantage.

## Research Sources

- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js Server Actions / mutating data: https://nextjs.org/docs/app/getting-started/mutating-data
- React Three Fiber introduction: https://r3f.docs.pmnd.rs/
- React Three Fiber Canvas: https://github.com/pmndrs/react-three-fiber/blob/master/docs/API/canvas.mdx
- React Three Fiber performance guidance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Drei controls: https://drei.docs.pmnd.rs/controls/introduction
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js OrbitControls: https://threejs.org/docs/pages/OrbitControls.html
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase securing data: https://supabase.com/docs/guides/database/secure-data
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Drizzle guide: https://supabase.com/docs/guides/database/drizzle
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Drizzle schema: https://orm.drizzle.team/docs/sql-schema-declaration
- Tauri architecture: https://v2.tauri.app/concept/architecture/
- Tauri security: https://v2.tauri.app/security/
- Tauri capabilities: https://tauri.app/security/capabilities/
- Electron process model: https://www.electronjs.org/docs/latest/tutorial/process-model
- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Playwright browser automation docs: https://playwright.dev/docs/pages
- Playwright browser contexts: https://playwright.dev/docs/browser-contexts
- OpenAI image input and quickstart: https://platform.openai.com/docs/quickstart/make-your-first-api-request
- OpenAI images and vision guide: https://platform.openai.com/docs/guides/images-vision
- OpenAI structured outputs guide: https://platform.openai.com/docs/guides/structured-outputs
- MDN Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
- MDN OffscreenCanvas: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas

## Resolved Architecture Recommendations

These are recommendations, not yet accepted product decisions:

- Build web-first for version 1.
- Use real accounts from the start.
- Use a Supabase-style integrated backend.
- Use Drizzle for Postgres schema and migrations.
- Keep 3D rendering client-only.
- Use React Three Fiber and Three.js for the renderer.
- Run product import and AI extraction asynchronously in a worker.
- Defer native desktop packaging.

## Decisions For User Judgment

1. Should version 1 be web-first as recommended, or should we build a native desktop shell first?
2. Should version 1 use real accounts from the start, or begin as a local single-user prototype?
3. Should we use a Supabase-style integrated backend, or a more composable stack with separate auth, database, and object storage providers?
4. Should we use Drizzle as recommended, or would you prefer Prisma for the database layer?
5. Should product imports run through an asynchronous job worker from the start, or begin as a simpler in-request prototype?
6. Should AI-assisted outfit recommendations ship in version 1, or should version 1 keep recommendations deterministic until the wardrobe/mannequin flow is stable?
7. Should measurement onboarding include optional AI guidance, or remain manual with illustrated instructions only?
