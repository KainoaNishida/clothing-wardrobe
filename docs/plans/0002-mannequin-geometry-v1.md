# 0002 Mannequin Geometry v1

## Summary

Improve the abstract mannequin so it resembles a simplified human form and responds coherently to body measurements. The key change is to introduce a body proportion solver between raw measurements and rendering:

```text
BodyMeasurements
  -> solveMannequinBody()
  -> MannequinBodyModel
  -> WardrobeScene
```

This prevents isolated behavior such as height only moving the head upward. Height, torso, inseam, shoulders, chest, waist, hips, arms, and feet should all contribute to one solved set of landmarks, segment lengths, widths, and guide anchors.

## Prior-Art Direction

- SMPL separates body shape, joint locations, skeleton, and mesh deformation. We should borrow the separation, not the licensed model asset.
- MakeHuman/MPFB uses a stable base mesh plus morph targets. This is the likely future direction after v1, but v1 should stay procedural.
- VRM and game avatar rigs standardize humanoid bones such as hips, spine, chest, neck, head, upper/lower limbs, and feet. Our body model should use similarly named landmarks.
- UMA treats character body values as avatar DNA separate from wardrobe recipes. Our body profile should remain separate from clothing/outfit data.
- CLO-style garment tools rely on avatar measurements, arrangement points, and bounding volumes. V1 should begin producing garment-friendly landmarks even before true cloth simulation exists.
- Three.js supports both procedural `BufferGeometry` and future `SkinnedMesh` workflows. V1 should use procedural geometry; a later version can move to a skinned mesh or GLTF mannequin.
- Anthropometric datasets such as ANSUR II and NASA references should inform plausibility guardrails, not automatically infer sensitive user attributes.

## Implementation Checklist

- [x] Add `MannequinBodyModel` types in the measurement package.
- [x] Add `solveMannequinBody(measurements)` to produce:
  - overall height and floor/head landmarks,
  - hips, pelvis, waist, chest, shoulders, neck, and head landmarks,
  - upper/lower arm and upper/lower leg segment lengths,
  - foot length and foot anchor points,
  - circumference-derived body radii/ellipses,
  - guide anchors for height, shoulder, chest, waist, hip, inseam, arm, and foot measurements,
  - diagnostics for clamped or reconciled measurements.
- [x] Make height affect the whole solved body:
  - preserve explicit user measurements where possible,
  - reconcile impossible combinations with deterministic clamps,
  - distribute residual height across legs, torso, neck, and head instead of moving one part alone.
- [x] Update `WardrobeScene` to consume `MannequinBodyModel` rather than deriving landmarks locally.
- [x] Replace the current blocky/capsule mannequin with a smoother abstract human:
  - featureless head and neck,
  - readable shoulders and ribcage,
  - narrower waist and pelvis volume,
  - upper/lower arms,
  - upper/lower legs,
  - simple feet,
  - solid soft-bone material with no facial details.
- [x] Re-anchor measurement guides to solved landmarks.
- [x] Keep garment shells rendering in outfit mode using the same body model so future garment fitting has one shared coordinate system.
- [x] Document any solver assumptions directly in the plan or measurement package comments if they materially affect fit.

## Acceptance Criteria

- Increasing height changes the full body proportions, not only head position.
- Short, tall, narrow, broad, long-torso, and long-inseam profiles all render without broken geometry.
- The mannequin reads as an abstract human from front, side, and back.
- Measurement guide rings and bars stay attached to meaningful landmarks.
- Body mode still updates live while editing measurements.
- Outfit mode still hides body-profile guides and shows selected garment shells.
- The solution does not import SMPL, MakeHuman, MetaHuman, UMA, or other third-party body assets.

## Verification

- `npm run typecheck`
- `npm run build`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Browser smoke test at desktop viewport:
  - switch to Body mode,
  - verify the canvas renders non-black pixels,
  - test at least three measurement profiles: default, tall/long-inseam, short/broad.
- Manual visual check:
  - front/side/back camera presets,
  - zoom/orbit behavior,
  - body-profile guide placement,
  - outfit mode still works.

## Notes For Future Agents

- Do not add realistic facial features, skin tones, hair, hands, or anatomical detail in v1.
- Do not move clothing import, outfit recommendations, or garment physics into this feature.
- Keep the mannequin unisex and abstract; use measurements and landmarks, not gendered body presets.
- Prefer a deterministic solver over AI or statistical inference for this version.
- If a measurement combination is implausible, clamp and report a diagnostic instead of producing broken geometry.

## Research References

- [SMPL](https://smpl.is.tue.mpg.de/)
- [MakeHuman targets](https://static.makehumancommunity.org/oldsite/faq/what_is_a_target.html)
- [MPFB MakeTarget docs](https://github.com/makehumancommunity/mpfb2/blob/master/docs/ui/create_assets/maketarget.md)
- [VRM humanoid specification](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0/humanoid.md)
- [Unity UMA](https://github.com/umasteeringgroup/UMA)
- [CLO Avatar Editor Guide](https://support.clo3d.com/hc/en-us/articles/360052611653-CLO-Avatar-Editor-Guide)
- [Three.js BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html)
- [Three.js SkinnedMesh](https://threejs.org/docs/pages/SkinnedMesh.html)
- [ANSUR II dataset overview](https://www.openlab.psu.edu/ansur2/)
