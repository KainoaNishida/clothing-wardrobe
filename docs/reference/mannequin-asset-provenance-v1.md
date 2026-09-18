# Mannequin Asset Provenance v1

## Purpose

This note records the provenance of generated mannequin source assets so future agents can audit whether an asset is safe to keep in the repository.

## Current Generated Asset

Source/probe asset:

- `assets/mannequin/source/mpfb-neutral-source-v1.blend`
- `assets/mannequin/source/mpfb-neutral-source-v1.glb`
- `assets/mannequin/source/mpfb-neutral-source-v1-preview.png`

These files validate the Blender + MPFB + GLB export path. They are not yet the final polished in-app retail mannequin.

Display mannequin draft:

- `assets/mannequin/display/display-mannequin-v1.blend`
- `assets/mannequin/display/display-mannequin-v1.glb`
- `assets/mannequin/display/display-mannequin-v1-preview.png`

These files are the first mannequin-facing abstraction pass. They use a smaller featureless oval head, a visible simplified neck form, softened body/detail regions, and the same body mesh draft morph target names.

Template mannequin assets:

- `assets/mannequin/templates/short_slim.glb`
- `assets/mannequin/templates/short_average.glb`
- `assets/mannequin/templates/short_wide.glb`
- `assets/mannequin/templates/average_slim.glb`
- `assets/mannequin/templates/average_average.glb`
- `assets/mannequin/templates/average_wide.glb`
- `assets/mannequin/templates/tall_slim.glb`
- `assets/mannequin/templates/tall_average.glb`
- `assets/mannequin/templates/tall_wide.glb`

Each template also has a `.blend` source file and a `-preview.png` render in the same folder. The default display draft is copied from `average_average`.

Generated file sizes on creation:

- `.blend`: 1,352,155 bytes
- `.glb`: 4,173,052 bytes
- `.png`: 575,299 bytes

Generated display draft file sizes on creation:

- `.blend`: 1,701,570 bytes
- `.glb`: 4,322,764 bytes
- `.png`: 518,513 bytes

## Tooling

- Blender: 5.2.1 LTS
- Blender executable used locally:
  - `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`
- MPFB: Blender extension build `20260722`
- Generation script:
  - `tools/blender/export_mpfb_neutral_mannequin.py`
- Display build script:
  - `tools/blender/build_display_mannequin_v1.py`

## Source And License Notes

- The neutral basemesh is generated through MPFB using MakeHuman-compatible core assets.
- MakeHuman Community documentation says core graphical assets are released under CC0.
- No marketplace model assets are used.
- No user-provided reference images are embedded in the generated files.
- No personal body measurement data is embedded in the generated files.

## Current Limitations

- This asset is still a neutral humanoid source mesh, not the final anonymous display mannequin.
- It may retain anatomical topology from the source basemesh.
- The preview still shows face detail, fingers, toes, and an authoring-pose arm spread.
- The next asset pass should remove or smooth identity/detail regions and move the arms closer to a retail display stance.
- It should not replace the current procedural mannequin in the app until a de-identification/simplification pass is completed and visually reviewed.

Display draft limitations:

- The head and neck proportions now better match the reference direction, but the shoulder-to-neck transition still needs a more molded continuous form.
- Fingers and toes are softened but still visible.
- Arms are closer to the body than the source pose, but still need a more natural retail display hang.
- The body still has some anatomical detail that should be softened before it becomes the default in-app mannequin.

## Verified Draft Morph Targets

The generated GLB was re-imported into Blender and verified to contain these shape keys:

- `Basis`
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

The display draft GLB was also re-imported into Blender and verified to contain these meshes:

- `CW_TemplateMannequin_Body`
- `CW_TemplateMannequin_Head`
- `CW_TemplateMannequin_Neck`
- `CW_TemplateMannequin_NeckBase`

The body mesh contains the same draft morph targets listed above.

The nine template GLBs were parsed after export and verified to share these stable mesh names:

- `CW_TemplateMannequin_BodyMesh`
- `CW_TemplateMannequin_HeadMesh`
- `CW_TemplateMannequin_NeckMesh`
- `CW_TemplateMannequin_NeckBaseMesh`

## Reproduction Command

Run from the repo root:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --addons mpfb --python tools/blender/export_mpfb_neutral_mannequin.py
```

Build the display mannequin draft:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --addons mpfb --python tools/blender/build_display_mannequin_v1.py
```
