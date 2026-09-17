# Mannequin Visual Design Contract v0

## Purpose

This contract defines what the version 1 mannequin should look and feel like.

The mannequin should communicate body proportion and clothing silhouette without becoming a realistic avatar. It should help the user answer: "Does this outfit work on a body shaped like mine?" It should not try to answer: "Does this look exactly like me?"

## Visual Direction

Version 1 should use an abstract fitting form.

The mannequin should look like a smooth, solid-color digital dress form rather than a human character. It should be body-aware, but identity-free.

Accepted visual direction:

- Solid-color mannequin.
- Smooth matte material.
- No face.
- No hair.
- No skin texture.
- No muscles, veins, wrinkles, fingernails, toes, or detailed anatomy.
- No gendered body labels or gendered default styling.
- Abstract enough to avoid uncanny realism.
- Proportional enough to show the user's overall silhouette.

The visual mood should be calm, private, and utilitarian: a fitting tool, not a doll or game avatar.

## Product Principle

The mannequin should be a proportional stand-in, not a portrait.

It should preserve the body-shape information needed for outfit previewing:

- Height.
- Shoulder width.
- Torso length.
- Chest or upper torso volume.
- Waist shape.
- Hip volume.
- Leg length.
- Arm length.
- Foot length.
- Optional later limb volume such as thigh, calf, bicep, and forearm.

It should intentionally discard identity information:

- Face.
- Hair.
- Eye color.
- Skin tone.
- Age cues.
- Muscle definition.
- Posture personality.
- Gender presentation.

## Shape Language

The mannequin should be assembled from simple, rounded volumes that can be scaled predictably from body measurements.

Recommended primitive language:

- Head: smooth oval or sphere, only for scale.
- Neck: short cylinder or capsule.
- Shoulders: rounded horizontal bar or softened shoulder bridge.
- Torso: tapered rounded volume, controlled by upper torso, waist, hip, and torso length.
- Pelvis and hips: rounded simplified volume.
- Arms: tapered capsules.
- Legs: tapered capsules.
- Feet: simple rounded wedges or low blocks.
- Hands: omitted or represented as smooth mitten-like ends only if needed for sleeve length.

The mannequin should avoid hard anatomical transitions. Smooth interpolation matters more than anatomical precision.

## Material And Color

Version 1 should use one neutral material family by default.

Recommended materials:

- Matte porcelain.
- Warm gray clay.
- Soft bone.
- Muted graphite.

Recommended default:

- Body material: warm neutral light gray or soft bone.
- Joint/guide accents: low-contrast gray or muted amber.
- No skin-tone palette in version 1, because the mannequin is not an identity avatar.

Renderer requirements:

- The material should read clearly against the black environment.
- Lighting should reveal silhouette without making the figure look realistic.
- Garments should remain visually dominant when selected.
- The mannequin should not compete with clothing colors.

## Segmentation

The mannequin may use subtle segmentation if it improves readability.

Allowed:

- Soft breaks between torso, pelvis, arms, legs, and feet.
- Slight material value differences between body regions.
- Small landmark rings or guide lines in body-profile mode.

Avoid:

- Visible skeleton or bones.
- Mechanical robot joints.
- Muscle group segmentation.
- Realistic nipples, navel, collarbones, ribs, abs, or knees.

Segmentation should help users understand measurement effects and garment placement.

## Modes

The mannequin should support two visual modes.

### Outfit Mode

Outfit Mode is the default wardrobe and outfit builder state.

Requirements:

- Minimal visual guides.
- Smooth solid mannequin.
- Clothing shells are the focus.
- Neutral material.
- Camera presets for front, side, and back.

Outfit Mode should feel like viewing a styled form in a dark fitting room.

### Body Profile Mode

Body Profile Mode is used while entering or editing measurements.

Requirements:

- Same mannequin as Outfit Mode.
- Subtle measurement guides may appear.
- Guides may include height line, shoulder line, upper torso ring, waist ring, hip ring, inseam marker, and foot-length marker.
- Measurement changes should visibly update the relevant region when live preview is enabled.

Body Profile Mode should make measurement effects understandable without feeling clinical.

## Measurement Mapping Requirements

Each required measurement should have a visible effect:

- Height: full vertical scale.
- Shoulder width: shoulder bridge and upper torso width.
- Upper torso circumference: chest or upper torso volume.
- Waist circumference: waist volume and taper.
- Hip circumference: hip and pelvis volume.
- Torso length: vertical distance from shoulder line to hip line.
- Inseam: leg length.
- Arm length: arm capsule length.
- Foot length: foot wedge length.

Optional measurements should refine the same abstract form rather than add realistic anatomy.

Examples:

- Thigh circumference changes upper leg capsule radius.
- Calf circumference changes lower leg capsule radius.
- Bicep circumference changes upper arm capsule radius.
- Shoulder slope adjusts the shoulder bridge angle.
- Foot width changes foot wedge width.

## Silhouette Priority

Silhouette accuracy is more important than surface detail.

The mannequin should preserve:

- Overall height-to-width relationship.
- Shoulder-to-hip balance.
- Waist indentation or straightness.
- Torso-to-leg ratio.
- Arm length relative to torso.
- Foot scale relative to pants and shoes.

The mannequin does not need to preserve:

- Exact anatomical curves.
- Realistic body fat distribution.
- Muscle tone.
- Skin folds.
- Facial likeness.

## Clothing Relationship

The mannequin exists to support clothing visualization.

Rules:

- Clothing shells should sit slightly above the mannequin surface.
- The mannequin should remain visible enough to show proportion, but not distract from clothing.
- Garments should determine the outfit silhouette where garments are present.
- When clothing fully covers a body region, the mannequin can visually recede.
- The renderer should avoid overpromising fit by making shells look like exact cloth drape.

Initial clothing relationship:

- Tops and outerwear wrap the abstract torso volume.
- Pants wrap simplified hips and legs.
- Shoes align to simplified feet.
- Accessories use simple anchors or proxy shapes.

## Interaction Requirements

The visual design must work with:

- Rotate.
- Zoom.
- Front view.
- Side view.
- Back view.
- Reset view.
- Live measurement preview.

The mannequin should remain legible from every preset view. Side view is especially important because torso depth, hip depth, chest/upper torso depth, and garment length are hard to understand from the front alone.

## Privacy And Emotional Safety

The mannequin should avoid making the user feel judged.

Requirements:

- Do not label bodies by type, attractiveness, gender, or fitness.
- Do not show weight by default.
- Do not use language like "flaws", "problem areas", or "ideal".
- Do not exaggerate body regions for visual drama.
- Do not make the mannequin cute, sexualized, muscular, or hyperreal.

The visual goal is confidence and clarity.

## Version 1 Non-Goals

Version 1 will not include:

- Photorealistic avatars.
- Face customization.
- Hair customization.
- Skin-tone customization.
- Body scan reconstruction.
- Realistic hands, fingers, feet, or toes.
- Pose libraries.
- Cloth physics.
- Muscle or anatomy rendering.
- Gendered body templates.

## Implementation Guidance

The first renderer implementation may use procedural primitives while the final base mannequin asset is still undecided.

Recommended implementation sequence:

1. Procedural placeholder made from capsules, spheres, rounded boxes, and simple wedges.
2. Measurement-driven scaling for height, shoulder width, torso, waist, hips, arms, legs, and feet.
3. Body Profile Mode measurement guides.
4. Improved abstract base mesh or GLB asset with morph targets.
5. Garment shell fitting refinement.

The placeholder must follow the same visual rules as the intended final mannequin so the product does not drift toward a realistic avatar.

## Acceptance Criteria

The mannequin visual design is acceptable for version 1 when:

- It clearly reads as an abstract fitting form.
- It changes shape visibly when required measurements change.
- It avoids facial, skin, hair, muscle, and gendered details.
- It supports front, side, and back outfit preview.
- Clothing remains the focus in Outfit Mode.
- Measurement guides improve comprehension in Body Profile Mode.
- The mannequin feels private, neutral, and non-judgmental.

## Open Decisions

1. Should the default material be soft bone, warm gray clay, or muted graphite?
2. Should Body Profile Mode show measurement rings always, only on hover/focus, or behind a toggle?
3. Should hands be omitted entirely or represented as simple mitten-like ends for sleeve scale?
