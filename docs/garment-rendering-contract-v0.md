# Version 1 Garment Rendering and Measurement Contract v0

## Purpose

This contract defines how clothing items become measurable, searchable, and renderable objects in the version 1 outfit simulator.

The goal is not to perfectly recreate each garment. The goal is to transform each clothing item into enough structured data and simplified 3D geometry that the app can show believable outfit scale, length, layering, and silhouette on the user's body-aware mannequin.

## Product Promise

For each clothing item, the app should preserve the user's real visual reference, infer or collect the measurements needed for proportional rendering, and display the item in the 3D environment in a way that is useful for outfit planning.

Version 1 should answer:

"How does this clothing item roughly sit in relation to my body proportions and the rest of this outfit?"

Version 1 should not claim to answer:

"Exactly how will this fabric drape, wrinkle, stretch, or move in real life?"

## Recommended Version 1 Direction

Version 1 should use simplified category-specific 3D garment shells.

This means:

- Clothing is represented as simple 3D forms shaped by measurements.
- User-uploaded photos and product images remain attached to the clothing item as catalogue references.
- Some image or color information may be projected onto simplified garment forms when practical.
- The 3D view prioritizes silhouette, scale, length, layering, and color blocking.
- True cloth physics and photorealistic garment reconstruction are deferred.

This approach supports the main version 1 goal: prove that a wardrobe becomes more useful when clothing is shown against a body-aware mannequin.

## Accepted Decision: First Rendering Style

Version 1 product direction is 3D garment shells with image or texture hints. The first technical milestone should implement simple 3D shells only, then add image or texture hints after the shell system works reliably.

Rejected alternatives:

Option A: Simple 3D shells only.

- Useful as the first technical milestone.
- Not sufficient as the full product direction because it is weakly connected to the user's actual clothing photos.

Option B: 3D shells with image or texture hints.

- Accepted product direction.
- Preserves body-aware proportions while making items more recognizable.
- Adds complexity for image cleanup, projection, and texture handling, so it should follow the plain shell milestone.

Option C: Image-first overlays on the mannequin.

- Rejected for version 1.
- Visually closer to uploaded photos, but harder to rotate convincingly and weaker for side and back views.

## Clothing Item Data Model

Each clothing item should include:

- User owner ID.
- Item ID.
- Category.
- Subcategory, optional.
- Display name.
- Brand, optional.
- Size label, optional.
- Color or colors.
- Photos or product images.
- Product URL, optional.
- Source type: uploaded, imported, manually created, or mixed.
- Measurements.
- Measurement source metadata.
- Measurement confidence.
- Tags.
- Notes.
- Created date.
- Updated date.

The data model should allow category-specific measurements without forcing every garment into the same measurement schema.

## Clothing Categories

Version 1 categories:

- Tops.
- Pants.
- Shoes.
- Outerwear.
- Accessories.

Recommended subcategories:

- Tops: t-shirt, shirt, blouse, sweater, hoodie, tank, vest.
- Pants: jeans, trousers, shorts, skirt, leggings, joggers.
- Shoes: sneaker, boot, dress shoe, sandal, heel, flat.
- Outerwear: jacket, coat, blazer, overshirt.
- Accessories: bag, hat, belt, scarf, jewelry, eyewear, watch.

Subcategories should be expandable and not gendered.

## Measurement Source Priority

Garment measurements should be collected in this order:

1. User-entered measurements.
2. Product-page size guide or product details extraction.
3. Product-page text plus image-based AI estimation.
4. Image-only AI estimation.
5. Category defaults with low confidence.

Manual user edits always override scraped, extracted, estimated, or default measurements.

## Measurement Confidence

Every garment measurement should store:

- Value.
- Unit.
- Source.
- Confidence.
- Last updated date.
- Whether the user has confirmed it.

Confidence levels:

- Confirmed: user-entered or user-approved.
- High: extracted directly from a clear product measurement table.
- Medium: inferred from product text, brand size guide, or mixed sources.
- Low: estimated from images or category defaults.
- Unknown: missing or not yet attempted.

The app should expose confidence in the edit experience, but it does not need to clutter the main outfit builder with confidence details.

## Product Link Import

When a user provides a product link, the app should attempt to import:

- Product name.
- Brand.
- Product images.
- Category.
- Color.
- Size options.
- Size guide or measurements.
- Product description.
- Materials, optional.
- Price and availability, optional for future use.

The app should not depend on product link import always succeeding. Many retailers will hide or structure data differently.

If product extraction fails, the app should still let the user create the item from the URL, product image upload, and manual fields.

## Product Link Boundaries

The product should use product link extraction where technically and legally appropriate.

Version 1 should not require:

- Bypassing paywalls.
- Circumventing anti-bot systems.
- Logging into retailer accounts.
- Scraping private user accounts.
- Guaranteeing support for every retailer.

Future implementation should evaluate retailer terms, robots rules, and the best data source for each integration.

## AI Estimation

AI estimation should be treated as a helpful fallback, not as truth.

AI can assist with:

- Category detection.
- Color detection.
- Product-name cleanup.
- Estimating garment dimensions from images when no measurements exist.
- Extracting measurements from unstructured product descriptions.
- Suggesting missing metadata.

AI-estimated measurements must remain editable and should carry low or medium confidence unless validated by the user.

## Manual Editing

Users should be able to edit:

- Category.
- Subcategory.
- Name.
- Brand.
- Size label.
- Color.
- Measurements.
- Tags.
- Notes.
- Photos.

Measurement editing should support both precise fields and simpler fit descriptors.

Examples:

- Precise: chest width is 22 inches.
- Simple: this shirt is oversized.
- Precise: inseam is 30 inches.
- Simple: these pants are cropped.

Simple descriptors can influence rendering when precise measurements are missing.

## Accepted Decision: Measurement Editing UX

Version 1 should use a hybrid clothing measurement editor.

The default clothing editor should expose simple fit descriptors first, while advanced measurement fields remain available for users who want precision.

Rejected alternatives:

Option A: Measurement fields only.

- Rejected as the default experience because it creates too much friction for casual users.
- Still supported through advanced measurement editing.

Option B: Fit descriptors first, advanced measurements optional.

- Partially accepted as the default surface.
- Not sufficient alone because fashion hobbyists need precise control.

Option C: Hybrid editor.

- Accepted direction.
- Shows simple fit controls by default.
- Allows advanced measurement editing when the user wants precision.
- Requires more design and engineering work, but best serves both fashion hobbyists and casual users.

## Category Measurement Schemas

Tops:

- Shoulder width.
- Chest width or chest circumference.
- Body length.
- Sleeve length.
- Hem width.
- Neck opening, optional.
- Fit descriptor: slim, regular, relaxed, oversized.

Pants:

- Waist circumference.
- Hip circumference.
- Rise.
- Inseam.
- Outseam, optional.
- Thigh width.
- Knee width, optional.
- Leg opening.
- Fit descriptor: skinny, slim, straight, relaxed, wide, cropped.

Shoes:

- Size label.
- Footbed length or internal length.
- Footbed width, optional.
- Sole height, optional.
- Shaft height for boots, optional.
- Fit descriptor: narrow, regular, wide.

Outerwear:

- Shoulder width.
- Chest width or chest circumference.
- Body length.
- Sleeve length.
- Hem width.
- Layering ease.
- Fit descriptor: fitted, regular, relaxed, oversized.

Accessories:

- Anchor point on body.
- Approximate width.
- Approximate height.
- Approximate depth, optional.
- Strap length or circumference when relevant.

## Rendering Behavior By Category

Tops:

- Render around torso and upper arms.
- Use shoulder width, chest, body length, sleeve length, and hem width.
- Sleeve shapes can start as simple cylinders or tapered tubes.
- Neck opening can remain simplified in version 1.

Pants:

- Render around waist, hips, and legs.
- Use rise, inseam, thigh width, and leg opening to establish silhouette.
- Support shorts, full-length pants, cropped pants, and skirts as subcategory variants.

Shoes:

- Render as simplified shoe forms aligned to mannequin feet.
- Use size label and foot length when precise shoe measurements are unavailable.
- Prioritize length, sole height, and broad visual category.

Outerwear:

- Render as an outer torso shell layered above tops.
- Use additional ease so outerwear does not visibly collapse into inner layers.
- Support open or closed state as a future enhancement.

Accessories:

- Render as simple anchored forms or image-backed placeholders.
- Accessories do not need full 3D accuracy in version 1 unless they affect outfit silhouette.

## Layering Rules

The 3D outfit renderer should support a predictable layering order:

1. Mannequin.
2. Base tops and bottoms.
3. Shoes.
4. Outerwear.
5. Accessories.

Garments should include a layer index or category-derived layer order.

The renderer should prevent obvious visual conflicts where possible, but version 1 may still have limitations around garment intersection.

## Ease And Fit Approximation

The renderer should use garment measurements compared with mannequin measurements to approximate ease.

Ease can affect:

- Garment shell distance from the mannequin.
- Whether the item looks slim, regular, relaxed, or oversized.
- Layering space between garments.
- Basic fit notes.

Version 1 should avoid strong fit claims. If the app shows fit language, it should be descriptive:

- "Close at waist."
- "Relaxed through chest."
- "Long sleeve length."
- "Cropped length."

Avoid judgmental language:

- "Bad fit."
- "Too big."
- "Too tight."
- "Unflattering."

## Accepted Decision: Fit Feedback In Version 1

Version 1 should include descriptive fit notes only when the underlying confidence is medium or high. Fit notes must remain non-judgmental and should describe what the system can infer rather than making authoritative claims.

Rejected alternatives:

Option A: Visualization only.

- Rejected as the full version 1 direction because it leaves useful measurement information unused.
- Still acceptable as a fallback when confidence is low or unknown.

Option B: Descriptive fit notes.

- Accepted with confidence limits.
- More useful for outfit planning.
- Supports future recommendation logic.
- Requires careful language and confidence handling.

## Visual Identity In 3D

The 3D garment does not need perfect textures in version 1, but it should preserve enough identity for users to recognize the item.

Useful identity signals:

- Dominant color.
- Secondary colors.
- Pattern category: solid, striped, checked, graphic, floral, textured, denim, leather, knit.
- Product image thumbnail visible in the catalogue.
- Optional image projection later.

If texture projection is not ready, the 3D view can use color and pattern approximations while the selected item card shows the real uploaded image.

## Accepted Decision: Pattern And Texture Scope

Version 1 should support dominant colors plus simple pattern labels. Image projection should be deferred until the core mannequin and garment shells are stable.

Rejected alternatives:

Option A: Solid colors only.

- Rejected as the full version 1 direction because it is too weak for patterned or graphic clothing.
- Acceptable as an early technical milestone.

Option B: Color plus simple pattern labels.

- Accepted direction.
- Improves recognizability while remaining buildable.
- Patterns are approximate rather than exact.

Option C: Attempt image projection early.

- Rejected for early version 1.
- Most recognizable, but higher risk because it requires image segmentation and projection logic.

## Acceptance Criteria

Version 1 garment rendering is acceptable when:

- A user can add clothing by photo upload.
- A user can add clothing by product link when extraction succeeds.
- The app stores measurements with source and confidence.
- The user can manually correct all important measurements.
- Each supported category has a simplified renderable representation.
- Selected clothing appears at plausible scale on the mannequin.
- The outfit view supports basic layering.
- Front, side, and back views remain understandable.
- Garments do not need physically accurate drape to be useful.

## Version 1 Non-Goals

Version 1 will not include:

- Full cloth simulation.
- Guaranteed retailer scraping.
- Perfect image-to-3D reconstruction.
- Automatic support for every clothing category.
- Tailoring-grade fit prediction.
- Public marketplace integrations.
- Real-time fabric movement.
- Complex material shaders.

## Accepted Decision: Product Link Import Scope

Version 1 should support public product pages only.

The app should not require logged-in retailer imports in version 1. Future logged-in retailer imports may be considered later if they become valuable enough to justify the privacy, security, and integration complexity.

## Resolved Decisions

- First rendering style: 3D shells with image or texture hints as product direction; plain shells as first technical milestone.
- Measurement editing UX: hybrid editor with simple fit descriptors by default and advanced measurements available.
- Fit feedback: descriptive fit notes only when measurement confidence is medium or high.
- Pattern and texture scope: dominant colors plus simple pattern labels for version 1; defer image projection.
- Product link import scope: public product pages only for version 1.

## Remaining Open Decisions

No open decisions remain in this contract at this stage. New open decisions may appear when technical architecture, data storage, or renderer implementation begins.
