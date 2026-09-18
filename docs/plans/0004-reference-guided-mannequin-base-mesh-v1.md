# 0004 Reference-Guided Mannequin Base Mesh v1

## Summary

Move beyond procedural primitive/ring tweaking and establish a stronger mannequin visual foundation based on the retail-display references documented in `docs/reference/mannequin-visual-reference-notes-v1.md`.

The goal is a smooth, featureless mannequin body that reads as one intentional display form from front, side, and back while still being driven by `solveMannequinBody()`.

## Recommended Direction

Use a project-owned or licensed base mesh with deterministic body controls.

Preferred path:

- Create or source one neutral mannequin GLB that the project is allowed to commit.
- Keep the mesh featureless, matte, and non-realistic.
- Add morph targets or scale regions for shoulder width, chest volume, waist taper, hip volume, torso length, arm length, leg length, and foot scale.
- Keep `solveMannequinBody()` as the only measurement/proportion source of truth.

Fallback path:

- Build a custom low-poly base mesh in Blender or code.
- Export it as a project-owned GLB.
- Add morph targets in a follow-up pass.

Avoid:

- More isolated primitive patches as the main strategy.
- SMPL, MakeHuman, MetaHuman, UMA, or other third-party body assets unless licensing and redistribution are explicitly resolved.
- Skin tones, facial features, hair, fingers, toes, or gendered presets.

## Implementation Checklist

- [ ] Confirm whether the repo may include a licensed mannequin GLB asset.
- [ ] Choose base mesh path: licensed GLB, project-owned Blender mesh, or temporary generated mesh.
- [ ] Add a renderer adapter that maps `MannequinBodyModel` to mesh transforms/morph weights.
- [ ] Add head mode support:
  - featureless oval head,
  - headless neck cap.
- [ ] Replace current procedural surface rendering behind the same `WardrobeScene` public API.
- [ ] Keep Body Profile measurement guides anchored to solved body landmarks.
- [ ] Keep outfit shells anchored to the same solved body landmarks.
- [ ] Add visual smoke tests or screenshots for default, tall/long-inseam, short/broad, and broad-shouldered profiles.

## Acceptance Criteria

- The mannequin resembles the documented reference family more than the current generated surface.
- It reads as one continuous display form, not assembled primitives.
- It remains abstract, unisex, matte, private, and nonjudgmental.
- Measurement edits visibly affect the appropriate silhouette regions.
- Front, side, and back views are all coherent.
- Garment anchors remain stable for future clothing fitting work.

## Verification

- `npm run typecheck`
- `npm run build`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Browser visual smoke test across:
  - default profile,
  - tall/long-inseam profile,
  - short/broad profile,
  - broad-shouldered profile,
  - front, side, and back camera presets.
