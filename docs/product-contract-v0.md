# Clothing Wardrobe Product Contract v0

## Related Documents

- [Version 1 Mannequin Contract](mannequin-contract-v0.md)
- [Version 1 Garment Rendering and Measurement Contract](garment-rendering-contract-v0.md)

## Product Summary

This product is a private desktop-first wardrobe and outfit simulator for fashion hobbyists and everyday users who want help choosing outfits. Users can upload or import clothing items, organize their wardrobe, enter body measurements, and view selected outfits on a body-type-aware mannequin in a 3D black environment.

The long-term product vision includes outfit recommendations, new clothing discovery, personalized style feedback, and search across external clothing sources. Version 1 focuses on building a credible foundation for private wardrobe management and an accurate user-shaped mannequin.

## Product Principles

- Private by default: body measurements, wardrobe photos, saved outfits, and imported product links belong only to the user.
- Unisex by design: the product should use clothing categories, body measurements, and fit concepts without assuming gender.
- Body-aware, not body-judgmental: the mannequin exists to improve outfit visualization, not to rate or critique the user's body.
- Useful before it is perfect: version 1 should make wardrobe browsing and outfit assembly valuable even before cloth simulation becomes realistic.
- Measurement-transparent: imported or AI-estimated measurements should show source and confidence so users know what to trust.
- Low-friction for casual users: the app should support quick outfit decisions, not only deep catalogue management.

## Primary User

The first target user is a fashion hobbyist who wants to catalogue clothing, experiment with outfits, and understand how garments look together. The product should also be approachable for casual users who want low-effort outfit selection without needing to make many styling decisions.

The app must be unisex and should not assume gendered clothing categories, body types, fit goals, or styling preferences.

## Platform

Version 1 is desktop-first.

Mobile support is expected in a future version after the desktop experience is stable and complete.

## Core Version 1 Goal

The highest priority for version 1 is a mannequin that accurately follows the user's body type based on manually entered body measurements.

The 3D clothing view does not need photorealistic garment simulation in version 1. The important promise is that clothing previews are proportionally grounded against a mannequin that reflects the user's real measurements.

Version 1 should prove the core product thesis: a private wardrobe is more useful when clothing is shown against a body-aware mannequin instead of flat photos alone.

## Version 1 Experience

The main application screen is split into two primary sections:

- Left side: a searchable, filterable catalogue of the user's clothing items.
- Right side: a black 3D environment showing a mannequin and selected clothing pieces.

Users can rotate around the mannequin to inspect the outfit from the front, side, and back. Users can zoom in and out.

Users can manually choose clothing items for an outfit, receive outfit recommendations, and save outfits for later.

Primary application modes:

- Body Profile: enter and maintain body measurements that generate the mannequin.
- Wardrobe: add, edit, search, filter, and organize clothing items.
- Outfit Builder: manually assemble outfits and preview them on the mannequin.
- Recommendations: generate outfit ideas from the user's existing wardrobe.
- Saved Outfits: browse, reopen, and reuse previous outfits.

First-time onboarding should prioritize the Body Profile and a small starter wardrobe. The app should not require a fully complete wardrobe before the user can see value.

## Clothing Catalogue

Users can add clothing items in two ways:

- Upload their own clothing photos.
- Import from a product link when available.

Each clothing item should support:

- Photos or product images.
- Category.
- Optional brand.
- Optional product name.
- Optional product URL.
- Color or colors.
- Size label.
- Measurements needed for 3D proportional rendering.
- User notes.
- Tags.
- Privacy ownership.

Required clothing metadata for version 1:

- Category.
- At least one image.
- User ownership.

Recommended clothing metadata for version 1:

- Product name.
- Color or colors.
- Size label.
- Product URL when available.
- Garment measurements or measurement confidence.
- Tags.

Initial categories:

- Tops.
- Pants.
- Shoes.
- Outerwear.
- Accessories.

The data model should remain flexible enough to add more categories without redesigning the system.

## Measurements

Garment measurements are primarily needed to render clothing in the 3D environment at the correct proportions relative to the mannequin.

Measurement acquisition priority:

1. Scrape or extract measurements from product links when available.
2. Use AI estimation as a fallback when measurements are unavailable.
3. Allow manual correction by the user.

"Exact measurements" in this product means the measurements necessary to create a believable and proportionally accurate 3D outfit preview. These measurements are not primarily presented as user-facing shopping data in version 1, though they may support future search, recommendations, and fit logic.

Every garment measurement should keep source metadata:

- Manual user input.
- Product-page extraction.
- AI estimate.
- Unknown.

Every non-manual measurement should include confidence. Users should be able to override any imported or estimated measurement.

## Mannequin

The mannequin does not need facial features or detailed anatomy in version 1.

The mannequin must be generated from user-entered measurements. The measurement set should include the minimum viable inputs needed to represent the user's proportions accurately enough for outfit visualization.

Candidate body measurements:

- Height.
- Shoulder width.
- Chest or bust circumference.
- Waist circumference.
- Hip circumference.
- Inseam.
- Outseam or leg length.
- Torso length.
- Arm length.
- Neck circumference.
- Thigh circumference.
- Calf circumference.
- Foot length.

The product should distinguish between required and optional body measurements. Required measurements should be enough to generate a plausible mannequin. Optional measurements should improve accuracy.

Recommended version 1 direction: use a template-driven parametric mannequin. Start from a neutral unisex mannequin mesh, then adjust height, proportions, limb lengths, and circumference regions using user measurements. This is more practical than fully procedural mesh generation and more privacy-preserving than photo-based body scanning.

Detailed mannequin requirements live in the Version 1 Mannequin Contract.

## 3D Environment

The version 1 3D environment should prioritize clarity and usability over realism.

Requirements:

- Black or near-black environment.
- User-shaped mannequin.
- Selected outfit pieces rendered on or near the mannequin.
- Camera controls for rotate, pan if useful, and zoom.
- Preset views for front, side, and back.
- Stable proportions between mannequin and clothing.

Non-requirements for version 1:

- Physically accurate cloth simulation.
- Realistic fabric movement.
- Perfect draping.
- Photorealistic materials.
- Advanced lighting or cinematic rendering.

## Outfit Features

Users should be able to:

- Manually assemble outfits from their wardrobe.
- Receive outfit recommendations from their wardrobe.
- Save outfits.
- Reopen saved outfits.
- Search and filter clothing while building an outfit.

Recommendation logic can start simple in version 1, using available metadata such as category, color, season, tags, and prior saved outfits. More advanced style reasoning can come later.

Version 1 recommendations should be framed as "outfit ideas" rather than authoritative styling decisions. The user should be able to regenerate, edit, save, or ignore any recommendation.

## Privacy

The app is private to each user.

Body measurements, clothing photos, wardrobe data, outfits, product links, and any personally identifying information must not be accessible by other users.

The system should treat body measurements and photos as sensitive personal data.

For a cloud version, user accounts and authorization checks are required before any private data leaves a local-only prototype. A local prototype may use a single mock user, but the production product contract assumes real per-user privacy boundaries.

Sensitive data should not be used to train shared models unless the user gives explicit opt-in consent.

## Version 1 MVP Release Definition

Version 1 is considered successful when a user can:

- Create a private account or private local profile.
- Enter required body measurements.
- Generate a mannequin that visually reflects those measurements.
- Add clothing items through photo upload.
- Add clothing items through a product link when extraction succeeds.
- Manually correct item metadata and measurements.
- Search and filter the wardrobe.
- Select clothing items into an outfit.
- View the outfit on or against the mannequin in the 3D environment.
- Rotate between front, side, and back views.
- Zoom in and out.
- Save and reopen outfits.
- Receive basic outfit ideas from wardrobe metadata.

## Future Expansion

Future versions may include:

- Search for new clothing pieces across the web.
- Recommendations for new items that complement the user's wardrobe.
- More advanced outfit generation.
- User feedback loops for improving recommendations.
- Mobile app support.
- Improved garment simulation.
- Better measurement extraction from product pages.
- Optional social or sharing features, only if privacy controls are explicit.

## Version 1 Non-Goals

Version 1 will not attempt to deliver:

- A fully realistic cloth physics engine.
- Marketplace purchasing flows.
- Public profiles.
- Social sharing.
- Mobile-first UX.
- Guaranteed exact manufacturer measurements for every product URL.
- Fully automated body measurement extraction from photos.
- Gender-specific assumptions about clothes or body shapes.

## Major Product Risks

- Accurate mannequin generation may be difficult without many body measurements.
- Garment measurement scraping will be inconsistent across retailers.
- AI-estimated garment measurements may be wrong and need user correction.
- 3D clothing rendering can become expensive if the app tries to simulate real cloth too early.
- Recommendation quality may feel weak if wardrobe metadata is sparse.
- Privacy expectations are high because body measurements and clothing photos are sensitive.
- Body measurement onboarding may feel tedious unless the UI is guided and forgiving.
- Users may expect realistic cloth fit if the product language overpromises.

## Current Product Bets

- The mannequin is the differentiating feature for version 1.
- Manual body measurement input is acceptable for the first target user because fashion hobbyists are more likely to tolerate setup friction.
- Casual users will need recommendation and low-effort outfit flows later, but the first version can lean slightly more enthusiast.
- Clothing measurement extraction should be opportunistic, not a blocking dependency.
- Saved outfits are important because they turn one-off experimentation into a reusable wardrobe system.

## Accepted Version 1 Decisions

- Garment rendering style: 3D shells with image or texture hints are the product direction; plain 3D shells are the first technical milestone.
- Clothing editor: use a hybrid editor with simple fit descriptors by default and advanced measurements available.
- Fit feedback: include descriptive, non-judgmental fit notes only when measurement confidence is medium or high.
- Pattern and texture scope: support dominant colors plus simple pattern labels in version 1; defer image projection until core mannequin and garment shells are stable.
- Product link import scope: support public product pages only in version 1; logged-in retailer imports may be considered later.
- Body measurement onboarding: require the full useful measurement set in version 1 rather than a shorter quick-start profile.

## Remaining Open Decisions

1. Should version 1 ship with only manual body measurement input, or also include optional AI guidance for measuring yourself?
2. Should outfit recommendations be available in the first release or follow shortly after the catalogue and mannequin are stable?
3. Should the first version require user accounts, or can it begin as a local/private single-user app?

## Recommended Next Step

Before implementation, resolve the open product decisions in the mannequin and garment rendering contracts:

- Body measurement guidance scope.
- Recommendation scope.
- Account and privacy architecture.

These decisions should be settled before the app architecture is finalized, because they affect the data model, onboarding flow, 3D rendering approach, and measurement import pipeline.
