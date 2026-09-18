"""Generate a neutral MPFB source mannequin probe.

This script intentionally creates a source/probe asset, not the polished app
mannequin. It validates the Blender + MPFB + GLB pipeline and creates stable
shape-key names that the renderer can target in a later pass.
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "assets" / "mannequin" / "source"
BLEND_PATH = OUTPUT_DIR / "mpfb-neutral-source-v1.blend"
GLB_PATH = OUTPUT_DIR / "mpfb-neutral-source-v1.glb"
PREVIEW_PATH = OUTPUT_DIR / "mpfb-neutral-source-v1-preview.png"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def create_neutral_human():
    from bl_ext.blender_org.mpfb.services import HumanService, TargetService

    macro = TargetService.get_default_macro_info_dict()
    macro["race"] = {
        "african": 0.33,
        "asian": 0.33,
        "caucasian": 0.34,
    }
    macro["gender"] = 0.5
    macro["age"] = 0.5
    macro["muscle"] = 0.5
    macro["weight"] = 0.5
    macro["height"] = 0.5
    macro["proportions"] = 0.5
    macro["cupsize"] = 0.5
    macro["firmness"] = 0.5

    return HumanService.create_human(
        mask_helpers=True,
        detailed_helpers=False,
        extra_vertex_groups=True,
        feet_on_ground=True,
        scale=0.1,
        macro_detail_dict=macro,
    )


def assign_material(obj) -> None:
    material = bpy.data.materials.new("cw_matte_warm_bone")
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (0.86, 0.84, 0.77, 1.0)
        principled.inputs["Roughness"].default_value = 0.82
        principled.inputs["Metallic"].default_value = 0.0

    obj.data.materials.clear()
    obj.data.materials.append(material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def bounds_for(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    min_x = min(point.x for point in points)
    max_x = max(point.x for point in points)
    min_y = min(point.y for point in points)
    max_y = max(point.y for point in points)
    min_z = min(point.z for point in points)
    max_z = max(point.z for point in points)
    return min_x, max_x, min_y, max_y, min_z, max_z


def smooth_band(value: float, center: float, width: float) -> float:
    distance = abs(value - center)
    if distance >= width:
        return 0.0
    progress = 1.0 - distance / width
    return progress * progress * (3.0 - 2.0 * progress)


def add_shape_key(obj, name: str, transform) -> None:
    key = obj.shape_key_add(name=name, from_mix=False)
    key.value = 0.0
    basis = obj.data.shape_keys.key_blocks["Basis"]

    for index, point in enumerate(key.data):
        original = basis.data[index].co.copy()
        point.co = transform(original)


def add_measurement_shape_keys(obj) -> None:
    if not obj.data.shape_keys:
        obj.shape_key_add(name="Basis")
    else:
        for key in reversed(obj.data.shape_keys.key_blocks[1:]):
            obj.shape_key_remove(key)

    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5

    def z_norm(co):
        return (co.z - min_z) / height if height else 0.0

    def scale_horizontal(co, amount, x_weight=1.0, y_weight=1.0):
        next_co = co.copy()
        next_co.x = center_x + (co.x - center_x) * (1.0 + amount * x_weight)
        next_co.y = center_y + (co.y - center_y) * (1.0 + amount * y_weight)
        return next_co

    add_shape_key(
        obj,
        "shoulder_width",
        lambda co: scale_horizontal(co, 0.16 * smooth_band(z_norm(co), 0.76, 0.08), x_weight=1.15, y_weight=0.15),
    )
    add_shape_key(
        obj,
        "chest_volume",
        lambda co: scale_horizontal(co, 0.13 * smooth_band(z_norm(co), 0.66, 0.10), x_weight=0.9, y_weight=0.8),
    )
    add_shape_key(
        obj,
        "waist_taper",
        lambda co: scale_horizontal(co, -0.13 * smooth_band(z_norm(co), 0.54, 0.08), x_weight=1.0, y_weight=0.85),
    )
    add_shape_key(
        obj,
        "hip_volume",
        lambda co: scale_horizontal(co, 0.13 * smooth_band(z_norm(co), 0.45, 0.08), x_weight=1.0, y_weight=0.9),
    )
    add_shape_key(
        obj,
        "upper_arm_volume",
        lambda co: scale_horizontal(co, 0.08 * smooth_band(z_norm(co), 0.61, 0.17), x_weight=0.35, y_weight=0.35),
    )
    add_shape_key(
        obj,
        "forearm_volume",
        lambda co: scale_horizontal(co, 0.06 * smooth_band(z_norm(co), 0.46, 0.16), x_weight=0.26, y_weight=0.26),
    )
    add_shape_key(
        obj,
        "thigh_volume",
        lambda co: scale_horizontal(co, 0.1 * smooth_band(z_norm(co), 0.32, 0.13), x_weight=0.8, y_weight=0.7),
    )
    add_shape_key(
        obj,
        "calf_volume",
        lambda co: scale_horizontal(co, 0.08 * smooth_band(z_norm(co), 0.17, 0.10), x_weight=0.65, y_weight=0.55),
    )
    add_shape_key(
        obj,
        "foot_width",
        lambda co: scale_horizontal(co, 0.1 * smooth_band(z_norm(co), 0.02, 0.055), x_weight=0.8, y_weight=0.1),
    )
    add_shape_key(
        obj,
        "headless_neck_cap",
        lambda co: headless_neck_cap_transform(co, min_z, height, center_x, center_y),
    )


def headless_neck_cap_transform(co, min_z: float, height: float, center_x: float, center_y: float):
    next_co = co.copy()
    normalized_z = (co.z - min_z) / height if height else 0.0
    if normalized_z < 0.84:
        return next_co

    neck_top = min_z + height * 0.84
    flatten = min(1.0, (normalized_z - 0.84) / 0.08)
    next_co.z = neck_top + math.cos(flatten * math.pi * 0.5) * (co.z - neck_top)
    radial_scale = 0.72 + 0.28 * (1.0 - flatten)
    next_co.x = center_x + (co.x - center_x) * radial_scale
    next_co.y = center_y + (co.y - center_y) * radial_scale
    return next_co


def add_scene_context(obj) -> None:
    obj.name = "CW_MPFBNeutralSource_Body"
    obj.data.name = "CW_MPFBNeutralSource_Mesh"
    obj["cw_asset_stage"] = "source_probe"
    obj["cw_source"] = "MPFB 20260722 via Blender 5.2.1"
    obj["cw_license_note"] = "Generated from MPFB/MakeHuman core CC0 assets; see docs/reference/mannequin-asset-provenance-v1.md"

    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5
    center_z = (min_z + max_z) * 0.5
    height = max_z - min_z

    camera_data = bpy.data.cameras.new("CW_SourcePreviewCamera")
    camera = bpy.data.objects.new("CW_SourcePreviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (center_x, min_y - max(2.4, height * 2.2), center_z)
    point_at(camera, (center_x, center_y, center_z))
    camera_data.lens = 70
    bpy.context.scene.camera = camera

    light_data = bpy.data.lights.new("CW_SourceKeyLight", "AREA")
    light = bpy.data.objects.new("CW_SourceKeyLight", light_data)
    bpy.context.collection.objects.link(light)
    light.location = (center_x + 1.6, min_y - 1.4, max_z + 1.2)
    light_data.energy = 450
    light_data.size = 4


def point_at(obj, target) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def save_outputs(obj) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=True,
        export_animations=False,
    )

    bpy.context.scene.render.filepath = str(PREVIEW_PATH)
    bpy.context.scene.render.resolution_x = 768
    bpy.context.scene.render.resolution_y = 1024
    bpy.context.scene.render.film_transparent = False
    bpy.context.scene.world.color = (1.0, 1.0, 1.0)
    if "BLENDER_EEVEE_NEXT" in [item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]:
        bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.ops.render.render(write_still=True)


def main() -> None:
    clear_scene()
    obj = create_neutral_human()
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    assign_material(obj)
    add_measurement_shape_keys(obj)
    add_scene_context(obj)
    save_outputs(obj)
    print(f"CW_MANNEQUIN_SOURCE_BLEND={BLEND_PATH}")
    print(f"CW_MANNEQUIN_SOURCE_GLB={GLB_PATH}")
    print(f"CW_MANNEQUIN_SOURCE_PREVIEW={PREVIEW_PATH}")


if __name__ == "__main__":
    main()
