# Clothing Wardrobe

A private desktop-first wardrobe and outfit simulator for fashion hobbyists and everyday users.

The product lets users catalogue clothing, enter body measurements, preview outfits on a body-aware mannequin, and save outfit ideas. Version 1 focuses on a mannequin that accurately follows the user's body type, plus a practical wardrobe and outfit-building workflow.

## Current Stage

This repository has its first Tauri/React scaffold. The web preview, split app shell, placeholder wardrobe catalogue, 3D mannequin scene, and Rust-owned SQLite command boundary are in place.

## Version 1 Direction

- Desktop-first experience.
- Tauri desktop shell first.
- Local single-user prototype before cloud sync.
- Rust-owned SQLite behind Tauri commands.
- Private per-user wardrobe and body profile.
- Guided manual body measurement input.
- Template-driven parametric mannequin.
- Searchable and filterable clothing catalogue.
- Outfit builder with saved outfits.
- Public product-page imports when available.
- Simplified 3D garment shells, with image or texture hints as the product direction.

## Product Contracts

- [Product contract](docs/product-contract-v0.md)
- [Mannequin contract](docs/mannequin-contract-v0.md)
- [Mannequin visual design contract](docs/mannequin-visual-design-contract-v0.md)
- [Garment rendering and measurement contract](docs/garment-rendering-contract-v0.md)
- [App architecture contract](docs/app-architecture-contract-v0.md)
- [Technical architecture design](docs/technical-architecture-design-v0.md)

## Development

Install JavaScript dependencies:

```sh
npm install
```

Run the web preview:

```sh
npm run dev:web
```

Run typecheck and build:

```sh
npm run typecheck
npm run build
```

Run the scaffold visual verification while the web preview is running:

```sh
npm --workspace apps/desktop run verify:scaffold
```

Run the native Tauri app:

```sh
npm run dev
```

Native Tauri development requires Rust/Cargo and Microsoft Visual Studio Build Tools with MSVC and Windows SDK components.

## Next Planning Areas

- Wardrobe data model implementation.
- Body measurement onboarding flow.
- Rust repository and command modules for real wardrobe persistence.
- First real mannequin/body-profile workflow.
