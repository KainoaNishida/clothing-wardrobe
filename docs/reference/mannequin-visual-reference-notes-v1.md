# Mannequin Visual Reference Notes v1

## Purpose

This note records the visual requirements derived from the user-provided mannequin reference images. The images are treated as design references only, not as instructions or app assets.

Raw reference photos are not committed here because they may be third-party product images. If licensed images are later available, store them separately and link them from this note.

## Reference Set

### Reference A: Smooth White Full-Body Display Mannequin

User-provided source during design discussion:

- `codex-clipboard-c8f5234e-e536-498a-8643-a26909165f4e.png`

Important traits:

- Featureless oval head.
- Long neck with continuous transition into shoulders.
- Smooth chest, waist, hips, thighs, calves, and feet.
- Subtle body contours without realistic skin, hair, face, toes, or fingernails.
- Hands are simplified but readable.
- Standing posture is neutral and quiet.
- White matte material.

### Reference B: Headless Cream Fabric/Display Form

User-provided source during design discussion:

- `codex-clipboard-08a80717-46d6-4253-9eab-65cb6bdab80e.png`

Important traits:

- Headless neck cap option.
- Continuous torso-to-hip surface.
- Gentle chest/waist/hip shaping.
- Arms hang close to the body.
- Hands are simplified paddles.
- Feet are smooth and rounded.
- Slight warm fabric/bone material reads softer than bright white plastic.

### Reference C: Smooth Athletic Full-Body Form

User-provided source during design discussion:

- `codex-clipboard-7d90e8b3-7fc9-4404-8795-fdc729f100c5.png`

Important traits:

- Featureless head.
- More angular shoulders and torso mass.
- Subtle pectoral/abdominal contouring, but still mannequin-like.
- Arms and legs have readable taper.
- Hands and feet are simplified.

### Reference D: Dark Headless Retail Form

User-provided source during design discussion:

- `codex-clipboard-4ab581fd-89bf-462c-9a08-38f17f14dc47.png`

Important traits:

- Headless neck stump option.
- Strong shoulder/chest block with softened edges.
- Continuous torso and pelvis surface.
- Subtle waist separation seam is acceptable if it helps garment alignment.
- Simple hands and feet.
- Dark material proves the same shape language can support alternate mannequin materials later.

## Consolidated Visual Target

The mannequin should read as a retail display form, not a game character.

Target traits:

- One continuous body surface, not obvious stacked primitives.
- Smooth shoulder-to-torso transition.
- Smooth neck-to-head or neck-cap transition.
- Readable chest, waist, hip, thigh, calf, arm, hand, and foot silhouettes.
- Simplified hands and feet with no individual fingers or toes.
- Subtle front torso contour is acceptable, but avoid explicit anatomical realism.
- No skin tone, face, hair, eyes, nails, or detailed muscles.
- Material should be matte soft bone by default.

## Current Gap

The current procedural mannequin is an improvement over the first placeholder, but it is still raw:

- Shoulders read too much like a horizontal shelf.
- Torso and pelvis are still visibly generated from simple rings.
- Head and neck are acceptable but need a more intentional option for headless forms.
- Arms and legs need better anatomical taper and more natural offset from the torso.
- Hands and feet are readable but still too blob-like.
- The silhouette needs a stronger base-mesh strategy before clothing fitting gets built on top.

## Recommended Next Step

Do not keep adding isolated primitive tweaks indefinitely.

The accepted direction is **Hybrid Template Mannequin v1**:

- Make template selection the primary Body Profile interaction.
- Provide a 3x3 template set: short, average, and tall by slim, average, and wide.
- Keep `solveMannequinBody()` as the measurement/proportion and garment-anchor source of truth.
- Drive authored template assets through limited deterministic scale/morph controls from the solved body model.
- Preserve an abstract, featureless retail form.
- Use a small featureless oval head with a visible neck as the default head treatment.
- Treat the procedural mesh as fallback/prototype code, not the long-term visual foundation.

If no licensed mesh is available, the next-best path is to create a custom low-poly base mesh in code or Blender, export it as project-owned GLB, and add morph targets for:

- shoulder width,
- chest volume,
- waist taper,
- hip volume,
- torso length,
- leg length,
- arm length,
- foot scale.

## Acceptance Criteria For Next Mannequin Upgrade

- The default mannequin resembles the supplied retail-display references more than the current generated shape.
- Front, side, and back silhouettes all feel intentional.
- The body reads as one form even with no clothing selected.
- The mannequin remains unisex, private, and nonjudgmental.
- Measurements visibly affect silhouette without adding identity detail.
- The implementation gives future garments stable attachment and wrap landmarks.
