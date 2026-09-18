# 0006 Hybrid Template Mannequin v1

## Summary

Move the mannequin from fully measurement-sculpted procedural geometry to a template-first hybrid system.

Users choose one of nine curated body templates first: short, average, or tall by slim, average, or wide. Measurements remain available as advanced fine tuning and continue to drive solved body anchors for guides and future garment placement.

## Key Changes

- [x] Add mannequin template metadata in `@cw/measurement`.
- [x] Add `template_id` persistence for body profiles.
- [x] Make Body Profile template-first, with measurements inside fine tuning.
- [x] Generate nine GLB mannequin template assets through Blender/MPFB.
- [x] Add an asset-backed mannequin renderer with procedural fallback.
- [x] Keep `WardrobeScene` consuming a solved `MannequinBodyModel`.
- [x] Keep outfit shells anchored to solved body landmarks.

## Asset Contract

Template GLBs live in `assets/mannequin/templates/` and are named by template id:

- `short_slim`
- `short_average`
- `short_wide`
- `average_slim`
- `average_average`
- `average_wide`
- `tall_slim`
- `tall_average`
- `tall_wide`

Every GLB should expose these stable node and mesh names:

- `CW_TemplateMannequin_Body`
- `CW_TemplateMannequin_Head`
- `CW_TemplateMannequin_Neck`
- `CW_TemplateMannequin_NeckBase`
- `CW_TemplateMannequin_BodyMesh`
- `CW_TemplateMannequin_HeadMesh`
- `CW_TemplateMannequin_NeckMesh`
- `CW_TemplateMannequin_NeckBaseMesh`

## Verification

- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `C:\Users\kaino\.cargo\bin\cargo.exe check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- [x] GLB metadata parse confirms all nine files use stable node and mesh names.
- [x] Browser smoke test confirms template switching and nonblank WebGL rendering for default and tall/wide templates.

## Notes

- The templates are still generated from the current display mannequin draft, so this is an architecture improvement and a visible shape improvement, not the final retail-quality sculpt.
- Manual visual review after implementation still shows lower-body, shoulder, hand, and foot sculpt issues that should be handled in the next asset-quality pass.
- Fine tuning is intentionally clamped near each template baseline so the model does not return to uncanny arbitrary deformation.
- Raw third-party reference images remain design references only and are not committed.
