# 0005 Mannequin Asset Pipeline v1

## Summary

Replace the current procedural mannequin as the primary visual representation with a project-owned GLB mannequin generated through an offline Blender + MPFB/MakeHuman authoring pipeline.

The goal is not photorealism. The goal is a smooth, anonymous, retail-display mannequin that can be shaped by the user's measurements while keeping the app private, local, and deterministic.

This plan refines `0004-reference-guided-mannequin-base-mesh-v1.md` using the research in `docs/research/mannequin-base-mesh-path-v1.md`.

## Recommended Direction

Use MPFB/MakeHuman only as an offline authoring source, not as a runtime dependency:

- Generate a neutral humanoid base in Blender using core CC0 assets.
- Convert it into an abstract display mannequin.
- Add a small rig for structural proportions.
- Add shape keys for silhouette changes.
- Export a GLB with stable names.
- Load and drive that GLB from the current Three.js renderer.
- Keep the current procedural mannequin as fallback until the GLB path is stable.

## Why This Path

The previous procedural surface can keep improving, but it is fighting the wrong problem. Smooth shoulders, pelvis, hands, feet, and front/side/back silhouettes are base-mesh problems.

An asset-backed model gives us:

- better retail-mannequin silhouette,
- stable topology for future garment fitting,
- stable landmarks and anchors,
- a clean separation between body solving and body rendering,
- a path to improve the asset in Blender without rewriting renderer geometry every time.

## Non-Goals

- Do not import MPFB, MakeHuman, SMPL, MetaHuman, UMA, VRoid, or Ready Player Me code into the app.
- Do not add identity-bearing details: no face, eyes, hair, skin texture, nails, fingers, or toes.
- Do not add AI body estimation in this feature.
- Do not change SQLite, Tauri commands, or Body Profile input schema.
- Do not remove the procedural mannequin fallback until the GLB path passes visual smoke tests.

## Asset Provenance Requirements

- Use only MPFB/MakeHuman core CC0 assets or wholly project-authored geometry.
- Document exact tool versions and asset source in a provenance note before committing any binary asset.
- Do not commit the user-provided reference images unless a separate license is available.
- Do not include third-party marketplace assets unless the license explicitly allows redistribution in this repo.

Suggested provenance file:

- `docs/reference/mannequin-asset-provenance-v1.md`

Suggested asset path:

- `packages/renderer/src/assets/mannequin/display-mannequin-v1.glb`

## Runtime Architecture

Add a renderer-local asset-backed mannequin layer:

- `AssetMannequin.tsx`
  - loads the GLB with Three.js/R3F tooling,
  - applies shared mannequin material overrides,
  - applies bone transforms and morph target weights,
  - exposes no persistence or privacy surface.
- `mannequinRigAdapter.ts`
  - maps `MannequinBodyModel` into normalized rig controls,
  - maps measurement deltas into morph target influences,
  - clamps controls to avoid broken silhouettes.
- `mannequinAssetContract.ts`
  - documents expected node, bone, and morph target names.

Keep `WardrobeScene` as the public renderer entrypoint.

## Proposed Rig Controls

Use bones or named transform nodes for structural proportions:

- `root`
- `pelvis`
- `spine`
- `chest`
- `neck`
- `head`
- `upper_arm_l`, `upper_arm_r`
- `lower_arm_l`, `lower_arm_r`
- `hand_l`, `hand_r`
- `upper_leg_l`, `upper_leg_r`
- `lower_leg_l`, `lower_leg_r`
- `foot_l`, `foot_r`

Control mapping:

- height scales the whole mannequin around foot-ground contact,
- torso length adjusts pelvis-to-chest distance,
- inseam adjusts leg segment length without moving only the head,
- arm length adjusts upper/lower arm reach,
- foot length adjusts foot scale and placement.

## Proposed Morph Targets

Use shape keys for silhouette and girth:

- `shoulder_width`
- `chest_volume`
- `waist_taper`
- `hip_volume`
- `upper_arm_volume`
- `forearm_volume`
- `thigh_volume`
- `calf_volume`
- `foot_width`
- `headless_neck_cap`

Target behavior:

- Morphs should stay subtle and mannequin-like.
- Morph weights should be normalized from the solved body model, not from raw user input.
- Extreme measurements should still produce a coherent display form.

## Implementation Checklist

- [x] Install or discover Blender 4.2+ in the local development environment.
- [x] Install MPFB in Blender.
- [x] Create a neutral mannequin source `.blend` using only acceptable assets.
- [x] Create a first display mannequin draft with featureless oval head and simplified neck.
- [x] Refine display draft with smaller head, visible neck, softened detail regions, and closer arm posture.
- [ ] Continue de-identifying and simplifying the display draft into the reference-guided retail form.
- [ ] Simplify hands, fingers, feet, and toes into display-mannequin forms.
- [ ] Improve arm posture and shoulder/neck transitions.
- [ ] Add rig controls for height, torso, arms, legs, and feet.
- [ ] Add final morph targets for shoulders, chest, waist, hips, arms, legs, and feet.
- [x] Export source/probe GLB with stable draft morph target names.
- [x] Export display draft GLB with stable draft morph target names.
- [ ] Promote a visually approved `display-mannequin-v1.glb` into the renderer asset path.
- [x] Add `docs/reference/mannequin-asset-provenance-v1.md`.
- [ ] Add a renderer asset contract documenting node, bone, and morph names.
- [ ] Add `AssetMannequin.tsx` and `mannequinRigAdapter.ts`.
- [ ] Render the GLB mannequin in Body mode.
- [ ] Keep the procedural mannequin as fallback.
- [ ] Keep measurement guides offset outside the asset surface.
- [ ] Keep outfit shell anchors mapped to `MannequinBodyModel`.

## Acceptance Criteria

- The mannequin resembles the retail-display reference family more than the current procedural mesh.
- Height changes scale the whole body and preserve foot-ground contact.
- Torso, inseam, arm, and foot measurements affect the correct regions.
- Chest, waist, hips, and shoulders change silhouette without becoming realistic anatomy.
- Front, side, and back camera presets all read as intentional.
- Head mode can support a featureless oval head and a headless neck cap.
- The app still works offline with local body data only.
- If the GLB fails to load, the current procedural mannequin still renders.

## Verification

- `npm run typecheck`
- `npm run build`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Browser smoke test:
  - GLB renders in Body mode.
  - Procedural fallback renders when the GLB import path is intentionally broken.
  - Default profile renders.
  - Tall/long-inseam profile renders.
  - Short/broad profile renders.
  - Broad-shouldered profile renders.
  - Front, side, and back camera presets work.
- Manual visual review:
  - smooth shoulders,
  - continuous torso and pelvis,
  - simplified hands and feet,
  - no face/skin/hair details,
  - guide overlays remain readable.

## Open Decisions

Recommended defaults:

- Default head mode: featureless oval head.
- Secondary head mode: headless neck cap.
- Default material: matte warm bone.
- Base posture: neutral upright stance with arms relaxed close to sides and feet shoulder-width or slightly narrower.

User judgment may be useful before implementation for:

- whether headless mode should be user-facing in v1 or kept as an internal asset variant,
- whether the default form should lean softer retail mannequin or more athletic display form,
- whether to commit the `.blend` source file or only the exported GLB plus provenance note.
