# 0003 Smooth Display Mannequin v1

## Summary

Move the mannequin from separate visible primitives toward a smooth, featureless retail-display mannequin similar to the supplied reference image. The target is a continuous white body form with readable human proportions, softened joints, simplified hands and feet, no facial features, and no realistic skin detail.

The implementation should keep the existing `solveMannequinBody()` architecture and add a generated surface layer:

```text
BodyMeasurements
  -> solveMannequinBody()
  -> MannequinSurfaceModel
  -> generated BufferGeometry meshes
  -> WardrobeScene
```

## Prior-Art Direction

- SMPL proves that high-quality body models separate shape parameters, joint locations, skinning, and mesh deformation. We should continue borrowing that separation without importing SMPL assets.
- MakeHuman and MB-Lab show the production pattern of a stable base mesh plus morph targets/shape keys. This is a strong future direction, but v1 can approximate it procedurally.
- CLO-style avatar editors reinforce that avatar measurements, arrangement points, and bounding volumes matter for future garment simulation.
- VRM and glTF define reusable humanoid skeleton and morph-target concepts. If we later import a GLTF mannequin, it should align with these conventions.
- Implicit/metaball/SDF body approaches show that smooth organic figures can be made from skeleton-aligned primitives and then polygonized. For this app, a CPU-generated mesh is simpler and more inspectable than shader raymarching.
- Three.js `BufferGeometry` is appropriate for generated mesh surfaces; `SkinnedMesh` and glTF morph targets are better suited to a later asset-backed mannequin.

## Implementation Checklist

- [x] Add a `MannequinSurfaceModel` or renderer-local surface builder that consumes `MannequinBodyModel`.
- [x] Generate a smooth torso/pelvis surface from elliptical cross-section rings:
  - pelvis,
  - waist,
  - lower chest,
  - chest,
  - upper chest/shoulders,
  - neck.
- [x] Generate tapered limb surfaces from solved landmarks:
  - upper/lower arms,
  - wrist transitions,
  - upper/lower legs,
  - ankle transitions.
- [x] Add simplified mannequin hands and feet:
  - no fingers/toes in v1,
  - soft paddle-like hands,
  - smooth foot forms with subtle toe direction only.
- [x] Replace box-like garment anchors with body-relative anchors that still fit the smoother surface.
- [x] Use a soft white/bone material with subtle roughness and lighting, matching the reference without translucency or skin texture.
- [x] Keep Body mode guide overlays, but make them float slightly outside the new surface.
- [x] Preserve the current solver diagnostics and deterministic measurement behavior.

## Acceptance Criteria

- The mannequin reads as one smooth featureless human-like display form rather than stacked capsules and boxes.
- Height changes redistribute through the whole surface model.
- Shoulder, chest, waist, hip, inseam, arm, and foot edits visibly affect the appropriate body regions.
- Front, side, and back views all look coherent.
- Hands and feet are simplified but no longer look like rectangular blocks.
- Body Profile mode still shows guide overlays; Outfit mode hides them.
- The model remains unisex and measurement-driven, not tied to a gendered preset.
- No third-party body model asset is imported in this version.

## Verification

- `npm run typecheck`
- `npm run build`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Browser smoke test at desktop viewport:
  - default profile,
  - tall/long-inseam profile,
  - short/broad profile,
  - front, side, and back camera presets.
- Manual visual review against the supplied reference image:
  - smooth silhouette,
  - featureless face,
  - softened shoulders,
  - continuous torso/waist/pelvis,
  - simplified limbs, hands, and feet.

## Notes For Future Agents

- Do not add skin tones, facial features, hair, fingers, toes, or anatomical realism beyond the smooth display-mannequin silhouette.
- Do not infer gender, sex, or sensitive body attributes from measurements.
- If the procedural mesh becomes too brittle, the next step should be an asset-backed GLTF mannequin with licensed morph targets, not a larger pile of primitives.
- Keep the solver independent from rendering so future garment fitting can use the same landmarks.

## Research References

- [SMPL](https://smpl.is.tue.mpg.de/)
- [MakeHuman targets](https://static.makehumancommunity.org/assets/creatingassets/maketarget/targets.html)
- [MB-Lab measures](https://mb-lab-docs.readthedocs.io/en/latest/measures_file.html)
- [MB-Lab modeling process](https://mb-lab-docs.readthedocs.io/en/latest/model_process.html)
- [CLO Avatar Editor Guide](https://support.clo3d.com/hc/en-us/articles/360052611653-CLO-Avatar-Editor-Guide)
- [VRM humanoid specification](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0/humanoid.md)
- [glTF 2.0 morph targets and skins](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [Three.js BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html)
- [Three.js SkinnedMesh](https://threejs.org/docs/pages/SkinnedMesh.html)
- [Creating and Rendering Convolution Surfaces](https://onlinelibrary.wiley.com/doi/abs/10.1111/1467-8659.00232)
