# Clothing Wardrobe

A private desktop-first wardrobe and outfit simulator for fashion hobbyists and everyday users.

The product lets users catalogue clothing, enter body measurements, preview outfits on a body-aware mannequin, and save outfit ideas. Version 1 focuses on a mannequin that accurately follows the user's body type, plus a practical wardrobe and outfit-building workflow.

## Current Stage

This repository is in product-contract and initial technical-architecture mode. No application code has been implemented yet.

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
- [Garment rendering and measurement contract](docs/garment-rendering-contract-v0.md)
- [App architecture contract](docs/app-architecture-contract-v0.md)
- [Technical architecture design](docs/technical-architecture-design-v0.md)

## Next Planning Areas

- Tauri scaffold and app shell.
- Wardrobe data model implementation.
- Body measurement onboarding flow.
- First 3D renderer scaffold.
