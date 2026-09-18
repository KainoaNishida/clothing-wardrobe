# Mannequin Base Mesh Research v1

## Purpose

This note captures the research behind the next mannequin improvement path. The current procedural mannequin proves the body-profile pipeline, but the visual target now needs a stronger base mesh that resembles a smooth retail display mannequin.

## Sources Reviewed

- MakeHuman Community license notes state that MakeHuman and MPFB use split licensing, with core graphical assets released under CC0.
- MakeHuman's asset/output FAQ states that core assets and exported models can be used, modified, and redistributed without attribution requirements.
- MPFB is an active Blender add-on for generating and editing humanoid meshes, with parametric body controls and compatibility with MakeHuman assets.
- Blender shape keys are the native authoring model for mesh deformation, also known as morph targets or blend shapes.
- glTF 2.0 supports skinned meshes and morph targets, which makes it a practical runtime format for a mannequin whose proportions change.
- Three.js supports BufferGeometry morph attributes and GLTFLoader loading of glTF/GLB assets, fitting the current React Three Fiber renderer.

## Options Considered

### Continue Procedural Surface Work

Pros:

- No asset pipeline.
- Fully deterministic in TypeScript.
- Easy to inspect and version.

Cons:

- Hard to make shoulders, pelvis, hands, feet, and torso transitions look intentionally human.
- Every improvement becomes another local geometry trick.
- Clothing fitting would be built on a surface that is already visually fragile.

Decision: keep as fallback/prototype code, not the main visual path.

### Use A Marketplace Or Random Free Mannequin GLB

Pros:

- Fastest path to a better-looking mannequin.
- May already resemble the retail references.

Cons:

- Licensing and redistribution are often unclear.
- Topology may not support measurement-driven deformation.
- Morph target names, rig quality, and material setup are unpredictable.

Decision: avoid unless a future asset has an explicit license and a clean deformation contract.

### Use VRoid, Ready Player Me, MetaHuman, Or Similar Avatar Systems

Pros:

- Mature avatar tooling.
- Existing rigging, character generation, and export ecosystems.

Cons:

- Oriented around identity-bearing avatars rather than anonymous retail display forms.
- Hosted-service or EULA constraints may complicate a private local-first prototype.
- Often adds face, hair, skin, and style assumptions we are intentionally avoiding.

Decision: useful prior art, but not the right foundation for v1.

### Use MakeHuman/MPFB As An Offline Authoring Pipeline

Pros:

- Official sources indicate core graphical assets and outputs are CC0.
- MPFB is active, Blender-native, and supports parametric human body creation.
- Blender can author shape keys, armatures, simplification, smoothing, and GLB export.
- The app can commit only the generated mannequin GLB and provenance notes, not MakeHuman/MPFB source code.
- glTF/GLB gives us morph targets and skins that Three.js can drive at runtime.

Cons:

- Requires an asset-authoring step outside the app.
- The default human mesh must be de-identified and simplified into a retail mannequin.
- We need disciplined provenance notes so future agents know which assets are safe to commit.

Decision: recommended path.

## Recommended Path

Create a project-owned mannequin GLB through an offline Blender authoring pipeline:

1. Install or discover Blender 4.2+ and MPFB.
2. Generate a neutral humanoid mesh using only MPFB/MakeHuman core CC0 assets.
3. Remove identity detail: no eyes, skin texture, hair, face details, individual toes, or fingernails.
4. Sculpt/smooth the model into an abstract retail display form matching the reference notes.
5. Add a small mannequin rig for height, torso length, arm length, inseam/leg length, and foot placement.
6. Add shape keys for girth and silhouette changes: shoulder width, chest volume, waist taper, hip volume, arm mass, leg mass, and foot scale.
7. Export a GLB with stable node, bone, and morph target names.
8. Load the GLB in the renderer and drive it from `MannequinBodyModel`.
9. Keep the current procedural mannequin as fallback if the GLB is missing or fails to load.

## Why Rig Plus Morphs

Body measurements affect different kinds of geometry:

- Height, torso, inseam, and arm length are structural proportion changes. A lightweight rig is better for these because it changes landmarks without simply stretching the head or distorting one mesh region.
- Chest, waist, hips, shoulders, arm mass, and leg mass are silhouette or circumference changes. Morph targets are better for these because they can preserve a smooth continuous surface.

This hybrid model is the best fit for the current requirement: a mannequin that follows the user's overall body shape without becoming a realistic anatomical model.

## Runtime Implications

- `solveMannequinBody()` remains the source of truth.
- `WardrobeScene` can keep accepting `body: MannequinBodyModel`.
- The renderer adds a model adapter that maps solved measurements into bone transforms and morph target influences.
- The app does not need a network service for mannequin rendering.
- Body data remains local and private.

## Notes

`blender` is not currently discoverable from the project terminal. The next implementation plan should start with a setup checkpoint before attempting scripted asset export.
