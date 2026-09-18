# Plan Tracking

This folder stores implementation plans that are specific enough for another agent to review, continue, or audit.

## Conventions

- Use one numbered file per feature or milestone: `0001-body-profile-v0.md`.
- Keep each plan aligned with the latest accepted product and architecture contracts.
- Record the intended behavior, implementation checklist, acceptance criteria, and verification commands.
- When a plan is implemented, update the corresponding checklist and add the resulting commit to `docs/commits/commit-log.md`.

## Plan Index

- `0001-body-profile-v0.md` - local body measurement editor and body-profile persistence.
- `0002-mannequin-geometry-v1.md` - research-backed mannequin body solver and improved abstract human geometry.
- `0003-smooth-display-mannequin-v1.md` - smooth featureless mannequin surface inspired by retail display forms.
- `0004-reference-guided-mannequin-base-mesh-v1.md` - stronger base-mesh direction guided by retail mannequin references.
- `0005-mannequin-asset-pipeline-v1.md` - asset-backed GLB mannequin pipeline using offline Blender/MPFB authoring.
- `0006-hybrid-template-mannequin-v1.md` - template-first 3x3 mannequin system with measurement fine tuning.

## Review Workflow

1. Read the latest product and architecture contracts in `docs/`.
2. Read the relevant plan in this folder.
3. Check `docs/commits/commit-log.md` to see which changes have landed.
4. Compare the current app behavior against the plan acceptance criteria.
