# Version 1 Mannequin Contract v0

## Purpose

The mannequin is the core version 1 differentiator. It should give users a private, body-aware way to preview outfits from their wardrobe without requiring photorealistic avatars, body scans, or physically accurate cloth simulation.

The mannequin should answer this question: "How will this outfit look on a body shaped roughly like mine?"

It should not claim to answer this question in version 1: "Exactly how will this garment drape, stretch, wrinkle, and fit in real life?"

## Product Promise

Given a user's manually entered body measurements, the app will generate a neutral unisex mannequin whose visible proportions correspond to those measurements closely enough to support outfit visualization.

The mannequin should feel like a proportional stand-in for the user, not a generic display dummy.

## Recommended Technical Direction

Version 1 should use a template-driven parametric mannequin.

This means:

- Start with a neutral unisex base mesh.
- Use a skeleton or rig for body segment proportions.
- Use morph targets or procedural scaling for circumference regions.
- Keep the surface smooth and featureless.
- Avoid face details, skin textures, hair, and anatomical realism.
- Treat the mannequin as a private body visualization tool, not a photorealistic avatar.

This approach is preferable for version 1 because it is practical, privacy-preserving, and compatible with a desktop 3D environment.

Detailed mannequin appearance requirements live in the Mannequin Visual Design Contract.

## Required Body Measurements

Accepted version 1 decision: require the full useful measurement set during body profile setup.

The first version should require the smallest complete measurement set that can produce a credible mannequin:

- Height.
- Shoulder width.
- Upper torso circumference, using chest or bust depending on how the user measures.
- Waist circumference.
- Hip circumference.
- Torso length.
- Inseam.
- Arm length.
- Foot length.

These measurements should be enough to scale the overall body, torso, shoulders, waist, hips, legs, arms, and feet.

This creates more onboarding friction than a quick-start profile, but it better serves the first target user: a fashion hobbyist who is likely to value precision and tolerate a careful setup process. The UI should make this process guided, calm, and resumable.

## Optional Body Measurements

Optional measurements should improve accuracy without blocking onboarding:

- Neck circumference.
- Shoulder slope.
- Bicep circumference.
- Forearm circumference.
- Wrist circumference.
- Thigh circumference.
- Calf circumference.
- Ankle circumference.
- Rise.
- Outseam.
- Foot width.
- Weight.
- Posture notes.

Weight should not be required. Circumference measurements are more directly useful for mannequin shape and avoid making the product feel judgmental.

## Measurement UX

Body measurement onboarding should be guided and calm.

Requirements:

- Support inches and centimeters.
- Explain how to take each measurement with diagrams or short helper text.
- Mark required and optional fields clearly.
- Allow users to save partial progress.
- Validate impossible or extreme entries without shaming language.
- Let users update measurements later.
- Show a "mannequin confidence" or "body profile completeness" indicator.

The app should avoid language that rates the user's body. It should describe measurement completeness and visualization accuracy instead.

## Measurement To Mannequin Mapping

Each body measurement should affect a visible part of the mannequin:

- Height: overall vertical scale.
- Shoulder width: distance between shoulder joints and upper torso width.
- Upper torso circumference: chest or bust region depth and width.
- Waist circumference: waist region depth and width.
- Hip circumference: pelvis and hip region depth and width.
- Torso length: vertical distance between shoulder line and hip line.
- Inseam: leg segment length.
- Arm length: shoulder-to-wrist length.
- Foot length: foot scale.
- Neck circumference: neck width.
- Thigh circumference: upper leg width and depth.
- Calf circumference: lower leg width and depth.
- Foot width: foot width.

When optional measurements are missing, the mannequin should estimate them from required measurements and default body proportion tables. Estimated regions should not be presented as exact.

## Accuracy Standard

Version 1 should aim for proportional accuracy, not medical or tailoring accuracy.

Acceptance standard:

- Required measurement landmarks should visually correspond to user inputs.
- Changing a measurement should visibly change the relevant body region.
- The mannequin should preserve plausible human proportions.
- The mannequin should not collapse, distort, or produce uncanny shapes for normal measurement ranges.
- Missing optional measurements should produce reasonable defaults.

The product should not claim body-scan-level precision.

## Clothing Relationship

Clothing in version 1 should be rendered as simplified category-specific garment representations fitted around the mannequin.

Recommended approach:

- Tops: simplified torso shell using garment length, chest width, shoulder width, and sleeve length.
- Pants: simplified lower-body shell using waist, hip, rise, thigh, inseam, and leg opening.
- Shoes: simplified shoe forms using foot length, foot width, and shoe size.
- Outerwear: simplified torso shell with additional ease layered over tops.
- Accessories: category-specific proxy models or anchored image cards when 3D shape is not useful.

Version 1 should not promise true cloth simulation. Instead, it should show clothing scale, length, coverage, layering order, and approximate silhouette.

## Garment Measurement Inputs By Category

Tops:

- Shoulder width.
- Chest width or circumference.
- Body length.
- Sleeve length.
- Hem width.
- Collar or neck opening, optional.

Pants:

- Waist circumference.
- Hip circumference.
- Rise.
- Inseam.
- Outseam, optional.
- Thigh width.
- Knee width, optional.
- Leg opening.

Shoes:

- Size label.
- Footbed length or internal length.
- Width, optional.
- Sole height, optional.

Outerwear:

- Shoulder width.
- Chest width or circumference.
- Body length.
- Sleeve length.
- Hem width.
- Intended layering ease.

Accessories:

- Category.
- Anchor point on body.
- Approximate dimensions.
- Image or simplified proxy model.

## Fit And Ease

The app should track "ease", meaning the difference between garment measurements and body measurements.

Version 1 can use ease to:

- Place garments around the mannequin without intersecting as badly.
- Approximate tight, regular, relaxed, or oversized silhouettes.
- Support future recommendations and fit warnings.

Fit warnings are optional for version 1. If included, they should be descriptive rather than judgmental, such as "likely close-fitting at the waist" instead of "too tight."

## 3D Interaction Requirements

The mannequin environment must support:

- Rotate around the mannequin.
- Zoom in and out.
- Front, side, and back view presets.
- Stable black or near-black environment.
- Clear silhouette visibility.
- Layered outfit display.
- Reset view.

The user should be able to understand the outfit silhouette quickly without navigating a complex 3D tool.

## Privacy Requirements

Body measurements are sensitive personal data.

Requirements:

- Measurements are private to the user.
- Measurements are never visible to other users.
- Measurements are not used for shared model training without explicit opt-in consent.
- Product analytics should avoid storing raw body measurements unless strictly necessary.
- Any future sharing feature must exclude body data by default.

## Version 1 Non-Goals

Version 1 will not include:

- Body scanning from photos.
- Photorealistic avatars.
- Detailed face, hair, or skin customization.
- Physics-based cloth simulation.
- Tailoring-grade fit guarantees.
- Medical or health interpretation of body measurements.
- Gendered body-type labels.

## Open Decisions

1. Should users see the mannequin update live as they enter measurements?
2. Should weight be supported as optional input, hidden in advanced settings, or excluded entirely?
3. Should the mannequin have adjustable pose options in version 1, or only a neutral standing pose?
