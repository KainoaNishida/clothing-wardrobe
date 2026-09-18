# Blender Asset Pipeline

This folder contains local authoring scripts for assets that are generated outside the app runtime.

The app should never require users to install Blender, MPFB, MakeHuman, or any other modeling tool. These scripts are for project development only.

## Requirements

- Blender 5.2.1 LTS is installed locally at:
  - `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`
- MPFB is installed through Blender's extension manager.

## Neutral MPFB Source Probe

Run from the repo root:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --addons mpfb --python tools/blender/export_mpfb_neutral_mannequin.py
```

This generates:

- `assets/mannequin/source/mpfb-neutral-source-v1.blend`
- `assets/mannequin/source/mpfb-neutral-source-v1.glb`
- `assets/mannequin/source/mpfb-neutral-source-v1-preview.png`

These are source/probe assets. They validate that we can create and export a neutral CC0-derived basemesh with stable morph target names, but they are not yet the final in-app display mannequin.

## Display Mannequin v1 Draft

Run from the repo root:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --addons mpfb --python tools/blender/build_display_mannequin_v1.py
```

This generates:

- `assets/mannequin/display/display-mannequin-v1.blend`
- `assets/mannequin/display/display-mannequin-v1.glb`
- `assets/mannequin/display/display-mannequin-v1-preview.png`
- `assets/mannequin/templates/{template_id}.blend`
- `assets/mannequin/templates/{template_id}.glb`
- `assets/mannequin/templates/{template_id}-preview.png`

This is the first mannequin-facing asset set. It starts from the MPFB source mesh, smooths identity/detail groups, rounds the head into a more featureless form, gently moves the arms toward a display posture, and emits a 3x3 short/average/tall by slim/average/wide template grid.
