"""Build the first abstract display mannequin asset.

This starts from the same neutral MPFB basemesh as the source probe, then applies
a scripted abstraction pass so the result is closer to a featureless retail
display mannequin.
"""

from __future__ import annotations

import math
import shutil
import sys
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.append(str(SCRIPT_DIR))

from export_mpfb_neutral_mannequin import (  # noqa: E402
    add_measurement_shape_keys,
    assign_material,
    bounds_for,
    clear_scene,
    create_neutral_human,
    point_at,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "assets" / "mannequin" / "display"
TEMPLATE_OUTPUT_DIR = REPO_ROOT / "assets" / "mannequin" / "templates"
BLEND_PATH = OUTPUT_DIR / "display-mannequin-v1.blend"
GLB_PATH = OUTPUT_DIR / "display-mannequin-v1.glb"
PREVIEW_PATH = OUTPUT_DIR / "display-mannequin-v1-preview.png"

HEIGHT_SCALES = {
    "short": 165 / 178,
    "average": 1.0,
    "tall": 190 / 178,
}

BUILD_SCALES = {
    "slim": (0.9, 0.95),
    "average": (1.0, 1.0),
    "wide": (1.12, 1.08),
}

TEMPLATES = [
    {"id": f"{height}_{build}", "height": height, "build": build}
    for height in ["short", "average", "tall"]
    for build in ["slim", "average", "wide"]
]


def percentile(values: list[float], amount: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round((len(ordered) - 1) * amount)))
    return ordered[index]


def smoothstep(value: float) -> float:
    clamped = max(0.0, min(1.0, value))
    return clamped * clamped * (3.0 - 2.0 * clamped)


def mix(start: float, end: float, amount: float) -> float:
    return start + (end - start) * amount


def template_output_paths(template_id: str):
    return (
        TEMPLATE_OUTPUT_DIR / f"{template_id}.blend",
        TEMPLATE_OUTPUT_DIR / f"{template_id}.glb",
        TEMPLATE_OUTPUT_DIR / f"{template_id}-preview.png",
    )


def reset_scene() -> None:
    clear_scene()
    try:
        bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)
    except Exception:
        pass


def group_exists(obj, name: str) -> bool:
    return obj.vertex_groups.get(name) is not None


def smooth_detail_groups(obj) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    for group_name, iterations, strength in [
        ("lips", 18, 0.78),
        ("ears", 12, 0.84),
        ("nipple", 18, 0.84),
        ("nippleTip", 18, 0.9),
        ("genitals", 18, 0.86),
        ("fingernails", 10, 0.75),
        ("toenails", 10, 0.75),
    ]:
        if not group_exists(obj, group_name):
            continue

        modifier = obj.modifiers.new(f"cw_smooth_{group_name}", "LAPLACIANSMOOTH")
        modifier.vertex_group = group_name
        modifier.iterations = iterations
        modifier.lambda_factor = strength
        modifier.use_volume_preserve = True
        bpy.ops.object.modifier_apply(modifier=modifier.name)


def smooth_region(obj, name: str, predicate, iterations: int, strength: float) -> None:
    group = obj.vertex_groups.new(name=name)
    indices = [vertex.index for vertex in obj.data.vertices if predicate(vertex.co)]
    if not indices:
        obj.vertex_groups.remove(group)
        return

    group.add(indices, 1.0, "ADD")
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    modifier = obj.modifiers.new(f"cw_smooth_{name}", "LAPLACIANSMOOTH")
    modifier.vertex_group = name
    modifier.iterations = iterations
    modifier.lambda_factor = strength
    modifier.use_volume_preserve = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def smooth_display_regions(obj) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    max_abs_x = max(abs(min_x), abs(max_x))
    center_y = (min_y + max_y) * 0.5

    def z_norm(co):
        return (co.z - min_z) / height if height else 0.0

    smooth_region(
        obj,
        "cw_display_hands",
        lambda co: abs(co.x) > max_abs_x * 0.68 and 0.3 <= z_norm(co) <= 0.66,
        iterations=18,
        strength=0.68,
    )
    smooth_region(
        obj,
        "cw_display_feet",
        lambda co: z_norm(co) < 0.13,
        iterations=22,
        strength=0.82,
    )
    smooth_region(
        obj,
        "cw_display_shoulder_neck",
        lambda co: abs(co.x) < max_abs_x * 0.62 and 0.68 <= z_norm(co) <= 0.81,
        iterations=16,
        strength=0.52,
    )
    smooth_region(
        obj,
        "cw_display_front_torso",
        lambda co: abs(co.x) < max_abs_x * 0.54 and co.y < center_y and 0.38 <= z_norm(co) <= 0.72,
        iterations=18,
        strength=0.42,
    )


def remove_source_shape_keys(obj) -> None:
    if not obj.data.shape_keys:
        return

    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shape_key_remove(all=True)


def apply_template_shape(obj, template) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5
    height = max_z - min_z
    height_scale = HEIGHT_SCALES[template["height"]]
    width_scale, depth_scale = BUILD_SCALES[template["build"]]

    for vertex in obj.data.vertices:
        co = vertex.co
        z_norm = (co.z - min_z) / height if height else 0.0
        body_weight = smoothstep((z_norm - 0.08) / 0.18) * (1.0 - smoothstep((z_norm - 0.78) / 0.08))
        shoulder_weight = smoothstep((z_norm - 0.62) / 0.12) * (1.0 - smoothstep((z_norm - 0.82) / 0.06))
        lower_body_weight = smoothstep((z_norm - 0.08) / 0.12) * (1.0 - smoothstep((z_norm - 0.55) / 0.08))
        build_weight = max(body_weight, shoulder_weight * 0.86, lower_body_weight * 0.78)

        co.z = min_z + (co.z - min_z) * height_scale
        co.x = center_x + (co.x - center_x) * mix(1.0, width_scale, build_weight)
        co.y = center_y + (co.y - center_y) * mix(1.0, depth_scale, build_weight)


def abstract_head(obj) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    head_base = min_z + height * 0.785
    neck_blend_base = min_z + height * 0.745
    head_vertices = [vertex.co.copy() for vertex in obj.data.vertices if vertex.co.z >= head_base]

    if not head_vertices:
        return

    center_x = sum(point.x for point in head_vertices) / len(head_vertices)
    center_y = sum(point.y for point in head_vertices) / len(head_vertices)
    center_z = (head_base + max_z) * 0.5
    radius_x = max(0.072, percentile([abs(point.x - center_x) for point in head_vertices], 0.68) * 0.98)
    radius_y = max(0.058, percentile([abs(point.y - center_y) for point in head_vertices], 0.68) * 0.98)
    radius_z = max(0.13, (max_z - head_base) * 0.52)

    for vertex in obj.data.vertices:
        co = vertex.co
        if co.z < neck_blend_base:
            continue

        blend = smoothstep((co.z - neck_blend_base) / max(0.001, head_base - neck_blend_base))
        local_z = max(-0.98, min(0.98, (co.z - center_z) / radius_z))
        ring_scale = math.sqrt(max(0.08, 1.0 - local_z * local_z))
        local_x = (co.x - center_x) / radius_x
        local_y = (co.y - center_y) / radius_y
        radial = math.sqrt(local_x * local_x + local_y * local_y)

        if radial < 0.001:
            target_x = co.x
            target_y = co.y
        else:
            target_x = center_x + (local_x / radial) * radius_x * ring_scale
            target_y = center_y + (local_y / radial) * radius_y * ring_scale

        co.x = mix(co.x, target_x, blend)
        co.y = mix(co.y, target_y, blend)


def simplify_arms_to_display_pose(obj) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    torso_half_width = (max_x - min_x) * 0.16

    for vertex in obj.data.vertices:
        co = vertex.co
        z_norm = (co.z - min_z) / height if height else 0.0
        if z_norm < 0.33 or z_norm > 0.78:
            continue

        distance_from_center = abs(co.x)
        if distance_from_center <= torso_half_width:
            continue

        side = -1.0 if co.x < 0 else 1.0
        outside = distance_from_center - torso_half_width
        closeness = smoothstep(min(1.0, outside / 0.28))
        target_x = side * (torso_half_width + outside * 0.28)
        co.x = mix(co.x, target_x, closeness * 0.84)


def simplify_hands_to_paddles(obj) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    max_abs_x = max(abs(min_x), abs(max_x))

    for side in [-1.0, 1.0]:
        vertices = [
            vertex
            for vertex in obj.data.vertices
            if vertex.co.x * side > max_abs_x * 0.64
            and min_z + height * 0.24 <= vertex.co.z <= min_z + height * 0.55
        ]
        if not vertices:
            continue

        center_x = sum(vertex.co.x for vertex in vertices) / len(vertices)
        center_y = sum(vertex.co.y for vertex in vertices) / len(vertices)
        center_z = sum(vertex.co.z for vertex in vertices) / len(vertices)
        radius_x = max(0.024, percentile([abs(vertex.co.x - center_x) for vertex in vertices], 0.82) * 0.58)
        radius_y = max(0.018, percentile([abs(vertex.co.y - center_y) for vertex in vertices], 0.8) * 0.5)
        radius_z = max(0.052, percentile([abs(vertex.co.z - center_z) for vertex in vertices], 0.88) * 0.66)

        for vertex in vertices:
            co = vertex.co
            co.x = mix(co.x, center_x + max(-radius_x, min(radius_x, co.x - center_x)), 0.72)
            co.y = mix(co.y, center_y + max(-radius_y, min(radius_y, co.y - center_y)), 0.82)
            co.z = mix(co.z, center_z + max(-radius_z, min(radius_z, co.z - center_z)), 0.72)


def round_feet(obj) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    foot_top = min_z + height * 0.095

    for side in [-1.0, 1.0]:
        side_vertices = [vertex for vertex in obj.data.vertices if vertex.co.z < foot_top and vertex.co.x * side > 0.0]
        if not side_vertices:
            continue

        center_x = sum(vertex.co.x for vertex in side_vertices) / len(side_vertices)
        center_y = sum(vertex.co.y for vertex in side_vertices) / len(side_vertices)
        radius_x = max(0.035, percentile([abs(vertex.co.x - center_x) for vertex in side_vertices], 0.86))
        radius_y = max(0.07, percentile([abs(vertex.co.y - center_y) for vertex in side_vertices], 0.9))

        for vertex in side_vertices:
            co = vertex.co
            local_x = (co.x - center_x) / radius_x
            local_y = (co.y - center_y) / radius_y
            radial = math.sqrt(local_x * local_x + local_y * local_y)
            if radial <= 1.0:
                continue
            co.x = mix(co.x, center_x + (local_x / radial) * radius_x, 0.9)
            co.y = mix(co.y, center_y + (local_y / radial) * radius_y, 0.9)


def abstract_display_surface(obj) -> None:
    smooth_detail_groups(obj)
    smooth_display_regions(obj)
    simplify_hands_to_paddles(obj)
    simplify_arms_to_display_pose(obj)
    round_feet(obj)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    return replace_head_with_display_form(obj)


def create_material_like(source_obj, name: str):
    if source_obj.data.materials:
        material = source_obj.data.materials[0].copy()
        material.name = name
        return material
    material = bpy.data.materials.new(name)
    return material


def add_display_ellipsoid(name: str, material, location, scale):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=16, location=location)
    mesh_obj = bpy.context.object
    mesh_obj.name = name
    mesh_obj.data.name = f"{name}Mesh"
    mesh_obj.scale = scale
    mesh_obj.data.materials.append(material)
    for polygon in mesh_obj.data.polygons:
        polygon.use_smooth = True
    return mesh_obj


def replace_hands_with_display_forms(obj):
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    max_abs_x = max(abs(min_x), abs(max_x))
    material = create_material_like(obj, "cw_display_hand_bone")
    hands = []

    for side, label in [(-1.0, "Left"), (1.0, "Right")]:
        vertices = [
            vertex
            for vertex in obj.data.vertices
            if vertex.co.x * side > max_abs_x * 0.66
            and min_z + height * 0.31 <= vertex.co.z <= min_z + height * 0.61
        ]
        if not vertices:
            continue

        center_x = sum(vertex.co.x for vertex in vertices) / len(vertices)
        center_y = sum(vertex.co.y for vertex in vertices) / len(vertices)
        center_z = sum(vertex.co.z for vertex in vertices) / len(vertices)
        radius_x = max(0.026, percentile([abs(vertex.co.x - center_x) for vertex in vertices], 0.88) * 0.9)
        radius_y = max(0.021, percentile([abs(vertex.co.y - center_y) for vertex in vertices], 0.86) * 0.88)
        radius_z = max(0.052, percentile([abs(vertex.co.z - center_z) for vertex in vertices], 0.92) * 0.84)

        for vertex in vertices:
            vertex.co.x = center_x + (vertex.co.x - center_x) * 0.42
            vertex.co.y = center_y + (vertex.co.y - center_y) * 0.42
            vertex.co.z = center_z + (vertex.co.z - center_z) * 0.48

        hands.append(
            add_display_ellipsoid(
                f"CW_DisplayMannequinV1_{label}Hand",
                material,
                (center_x, center_y, center_z),
                (radius_x, radius_y, radius_z),
            )
        )

    return hands


def replace_feet_with_display_forms(obj):
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    material = create_material_like(obj, "cw_display_foot_bone")
    feet = []

    for side, label in [(-1.0, "Left"), (1.0, "Right")]:
        vertices = [
            vertex
            for vertex in obj.data.vertices
            if vertex.co.x * side > 0.0 and vertex.co.z <= min_z + height * 0.12
        ]
        if not vertices:
            continue

        center_x = sum(vertex.co.x for vertex in vertices) / len(vertices)
        center_y = sum(vertex.co.y for vertex in vertices) / len(vertices)
        center_z = sum(vertex.co.z for vertex in vertices) / len(vertices)
        radius_x = max(0.038, percentile([abs(vertex.co.x - center_x) for vertex in vertices], 0.9) * 0.96)
        radius_y = max(0.078, percentile([abs(vertex.co.y - center_y) for vertex in vertices], 0.92) * 1.02)
        radius_z = max(0.026, percentile([abs(vertex.co.z - center_z) for vertex in vertices], 0.86) * 0.82)

        for vertex in vertices:
            vertex.co.x = center_x + (vertex.co.x - center_x) * 0.38
            vertex.co.y = center_y + (vertex.co.y - center_y) * 0.38
            vertex.co.z = center_z + (vertex.co.z - center_z) * 0.54

        feet.append(
            add_display_ellipsoid(
                f"CW_DisplayMannequinV1_{label}Foot",
                material,
                (center_x, center_y, center_z),
                (radius_x, radius_y, radius_z),
            )
        )

    return feet


def replace_head_with_display_form(obj):
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
    height = max_z - min_z
    head_cut = min_z + height * 0.792
    head_vertices = [vertex.co.copy() for vertex in obj.data.vertices if vertex.co.z >= min_z + height * 0.72]
    center_x = sum(point.x for point in head_vertices) / len(head_vertices)
    center_y = sum(point.y for point in head_vertices) / len(head_vertices)
    head_radius_x = height * 0.039
    head_radius_y = height * 0.032
    head_radius_z = height * 0.064
    head_center_z = max_z - head_radius_z * 0.98

    head_delete_radius_x = head_radius_x * 1.75
    head_delete_radius_y = head_radius_y * 2.15

    for vertex in obj.data.vertices:
        co = vertex.co
        if (
            co.z > head_cut
            and abs(co.x - center_x) < head_delete_radius_x
            and abs(co.y - center_y) < head_delete_radius_y
        ):
            co.x = center_x + (co.x - center_x) * 0.24
            co.y = center_y + (co.y - center_y) * 0.24

    material = create_material_like(obj, "cw_display_matte_warm_bone")

    bpy.ops.mesh.primitive_uv_sphere_add(segments=56, ring_count=28, location=(center_x, center_y, head_center_z))
    head = bpy.context.object
    head.name = "CW_TemplateMannequin_Head"
    head.data.name = "CW_TemplateMannequin_HeadMesh"
    head.scale = (head_radius_x, head_radius_y, head_radius_z)
    head.data.materials.append(material)
    for polygon in head.data.polygons:
        polygon.use_smooth = True

    neck_height = max(0.13, height * 0.088)
    neck_bottom_z = min_z + height * 0.69
    neck_top_z = head_center_z - head_radius_z * 0.72
    neck_height = max(0.12, neck_top_z - neck_bottom_z)
    neck_center_z = (neck_bottom_z + neck_top_z) * 0.5
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=20, location=(center_x, center_y, neck_center_z))
    neck = bpy.context.object
    neck.name = "CW_TemplateMannequin_Neck"
    neck.data.name = "CW_TemplateMannequin_NeckMesh"
    neck.scale = (head_radius_x * 0.54, head_radius_y * 0.58, neck_height * 0.56)
    neck.data.materials.append(material)
    for polygon in neck.data.polygons:
        polygon.use_smooth = True

    neck_base = add_display_ellipsoid(
        "CW_TemplateMannequin_NeckBase",
        material,
        (center_x, center_y, neck_bottom_z + height * 0.018),
        (head_radius_x * 0.82, head_radius_y * 0.86, height * 0.034),
    )

    return [head, neck, neck_base]


def add_display_context(obj, template) -> None:
    obj.name = "CW_TemplateMannequin_Body"
    obj.data.name = "CW_TemplateMannequin_BodyMesh"
    obj["cw_asset_stage"] = "display_mannequin_v1"
    obj["cw_template_id"] = template["id"]
    obj["cw_source"] = "MPFB 20260722 via Blender 5.2.1, abstracted by tools/blender/build_display_mannequin_v1.py"
    obj["cw_license_note"] = "Derived from MPFB/MakeHuman core CC0 assets; see docs/reference/mannequin-asset-provenance-v1.md"


def bounds_for_objects(objects):
    mins_x: list[float] = []
    maxes_x: list[float] = []
    mins_y: list[float] = []
    maxes_y: list[float] = []
    mins_z: list[float] = []
    maxes_z: list[float] = []

    for obj in objects:
        min_x, max_x, min_y, max_y, min_z, max_z = bounds_for(obj)
        mins_x.append(min_x)
        maxes_x.append(max_x)
        mins_y.append(min_y)
        maxes_y.append(max_y)
        mins_z.append(min_z)
        maxes_z.append(max_z)

    return min(mins_x), max(maxes_x), min(mins_y), max(maxes_y), min(mins_z), max(maxes_z)


def add_preview_scene(objects) -> None:
    min_x, max_x, min_y, max_y, min_z, max_z = bounds_for_objects(objects)
    center_x = (min_x + max_x) * 0.5
    center_y = (min_y + max_y) * 0.5
    center_z = (min_z + max_z) * 0.5
    height = max_z - min_z

    camera_data = bpy.data.cameras.new("CW_DisplayPreviewCamera")
    camera = bpy.data.objects.new("CW_DisplayPreviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (center_x, min_y - max(2.08, height * 1.86), center_z)
    point_at(camera, (center_x, center_y, center_z))
    camera_data.lens = 70
    bpy.context.scene.camera = camera

    light_data = bpy.data.lights.new("CW_DisplayKeyLight", "AREA")
    light = bpy.data.objects.new("CW_DisplayKeyLight", light_data)
    bpy.context.collection.objects.link(light)
    light.location = (center_x + 1.6, min_y - 1.4, max_z + 1.2)
    light_data.energy = 470
    light_data.size = 4


def save_outputs(objects, blend_path, glb_path, preview_path) -> None:
    blend_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    backup_path = Path(f"{blend_path}1")
    if backup_path.exists():
        backup_path.unlink()

    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_animations=False,
    )

    bpy.context.scene.render.filepath = str(preview_path)
    bpy.context.scene.render.resolution_x = 768
    bpy.context.scene.render.resolution_y = 1024
    bpy.context.scene.render.film_transparent = False
    bpy.context.scene.world.color = (1.0, 1.0, 1.0)
    bpy.ops.render.render(write_still=True)


def build_template(template):
    reset_scene()
    obj = create_neutral_human()
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    remove_source_shape_keys(obj)
    assign_material(obj)
    apply_template_shape(obj, template)
    extra_objects = abstract_display_surface(obj)
    add_measurement_shape_keys(obj)
    add_display_context(obj, template)
    display_objects = [obj, *extra_objects]
    add_preview_scene(display_objects)
    return display_objects


def main() -> None:
    generated_default = None

    for template in TEMPLATES:
        display_objects = build_template(template)
        blend_path, glb_path, preview_path = template_output_paths(template["id"])
        save_outputs(display_objects, blend_path, glb_path, preview_path)

        if template["id"] == "average_average":
            generated_default = (blend_path, glb_path, preview_path)

        print(f"CW_TEMPLATE_MANNEQUIN={template['id']}:{glb_path}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if generated_default:
        shutil.copyfile(generated_default[0], BLEND_PATH)
        shutil.copyfile(generated_default[1], GLB_PATH)
        shutil.copyfile(generated_default[2], PREVIEW_PATH)

    print(f"CW_DISPLAY_MANNEQUIN_BLEND={BLEND_PATH}")
    print(f"CW_DISPLAY_MANNEQUIN_GLB={GLB_PATH}")
    print(f"CW_DISPLAY_MANNEQUIN_PREVIEW={PREVIEW_PATH}")


if __name__ == "__main__":
    main()
