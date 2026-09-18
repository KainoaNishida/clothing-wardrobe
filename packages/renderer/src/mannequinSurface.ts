import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import type { MannequinBodyModel, MannequinPoint } from "@cw/measurement";

export interface MannequinSurfaceGeometry {
  head: BufferGeometry;
  leftArm: BufferGeometry;
  leftFoot: BufferGeometry;
  leftHand: BufferGeometry;
  leftLeg: BufferGeometry;
  rightArm: BufferGeometry;
  rightFoot: BufferGeometry;
  rightHand: BufferGeometry;
  rightLeg: BufferGeometry;
  torso: BufferGeometry;
}

interface MannequinSurfaceRing {
  center: Vector3;
  radiusX: number;
  radiusZ: number;
}

interface OrientedRing {
  center: Vector3;
  radiusA: number;
  radiusB: number;
  tangent: Vector3;
}

interface LimbControlPoint {
  center: MannequinPoint;
  radius: number;
}

interface EllipsoidOptions {
  center: MannequinPoint;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
}

const BODY_SEGMENTS = 36;
const LIMB_SEGMENTS = 22;

export function buildMannequinSurfaceGeometry(body: MannequinBodyModel): MannequinSurfaceGeometry {
  return {
    head: buildEllipsoidGeometry({
      center: body.landmarks.headCenter,
      radiusX: body.dimensions.headRadius * 0.82,
      radiusY: body.dimensions.headHeight * 0.5,
      radiusZ: body.dimensions.headRadius * 0.74
    }),
    leftArm: buildLimbSurface(
      [
        { center: body.landmarks.leftShoulder, radius: body.dimensions.upperArmRadius * 1.1 },
        { center: body.landmarks.leftElbow, radius: body.dimensions.upperArmRadius * 0.86 },
        { center: body.landmarks.leftWrist, radius: body.dimensions.lowerArmRadius * 0.78 }
      ],
      0.78
    ),
    leftFoot: buildEllipsoidGeometry({
      center: offsetPoint(body.landmarks.leftFootCenter, 0, 0, body.dimensions.footLength * 0.04),
      radiusX: body.dimensions.footWidth * 0.9,
      radiusY: body.dimensions.footHeight * 0.76,
      radiusZ: body.dimensions.footLength * 0.52
    }),
    leftHand: buildHandGeometry(body.landmarks.leftWrist, -1, body),
    leftLeg: buildLimbSurface(
      [
        { center: body.landmarks.leftHip, radius: body.dimensions.thighRadius * 1.18 },
        { center: body.landmarks.leftKnee, radius: body.dimensions.thighRadius * 0.76 },
        { center: body.landmarks.leftAnkle, radius: body.dimensions.calfRadius * 0.72 }
      ],
      0.9
    ),
    rightArm: buildLimbSurface(
      [
        { center: body.landmarks.rightShoulder, radius: body.dimensions.upperArmRadius * 1.1 },
        { center: body.landmarks.rightElbow, radius: body.dimensions.upperArmRadius * 0.86 },
        { center: body.landmarks.rightWrist, radius: body.dimensions.lowerArmRadius * 0.78 }
      ],
      0.78
    ),
    rightFoot: buildEllipsoidGeometry({
      center: offsetPoint(body.landmarks.rightFootCenter, 0, 0, body.dimensions.footLength * 0.04),
      radiusX: body.dimensions.footWidth * 0.9,
      radiusY: body.dimensions.footHeight * 0.76,
      radiusZ: body.dimensions.footLength * 0.52
    }),
    rightHand: buildHandGeometry(body.landmarks.rightWrist, 1, body),
    rightLeg: buildLimbSurface(
      [
        { center: body.landmarks.rightHip, radius: body.dimensions.thighRadius * 1.18 },
        { center: body.landmarks.rightKnee, radius: body.dimensions.thighRadius * 0.76 },
        { center: body.landmarks.rightAnkle, radius: body.dimensions.calfRadius * 0.72 }
      ],
      0.9
    ),
    torso: buildTorsoSurface(body)
  };
}

function buildTorsoSurface(body: MannequinBodyModel) {
  const { dimensions, landmarks } = body;
  const shoulderY = landmarks.shoulderCenter.y;
  const lowerChestY = lerp(landmarks.waist.y, landmarks.chest.y, 0.55);
  const abdomenY = lerp(landmarks.pelvis.y, landmarks.waist.y, 0.58);
  const upperChestY = lerp(landmarks.chest.y, shoulderY, 0.58);
  const neckBaseY = landmarks.neckBase.y;
  const neckTopY = landmarks.neckTop.y;
  const rings: MannequinSurfaceRing[] = [
    {
      center: vector(0, landmarks.crotch.y - dimensions.torsoLength * 0.03, 0),
      radiusX: dimensions.hipRadiusX * 0.34,
      radiusZ: dimensions.hipRadiusZ * 0.62
    },
    {
      center: vector(0, landmarks.pelvis.y, 0),
      radiusX: dimensions.hipRadiusX * 1.05,
      radiusZ: dimensions.hipRadiusZ * 1.02
    },
    {
      center: vector(0, abdomenY, 0.002),
      radiusX: lerp(dimensions.hipRadiusX, dimensions.waistRadiusX, 0.56),
      radiusZ: lerp(dimensions.hipRadiusZ, dimensions.waistRadiusZ, 0.5)
    },
    {
      center: vector(0, landmarks.waist.y, 0),
      radiusX: dimensions.waistRadiusX * 0.96,
      radiusZ: dimensions.waistRadiusZ * 0.96
    },
    {
      center: vector(0, lowerChestY, 0.004),
      radiusX: lerp(dimensions.waistRadiusX, dimensions.chestRadiusX, 0.68),
      radiusZ: lerp(dimensions.waistRadiusZ, dimensions.chestRadiusZ, 0.62)
    },
    {
      center: vector(0, landmarks.chest.y, 0.006),
      radiusX: dimensions.chestRadiusX * 1.02,
      radiusZ: dimensions.chestRadiusZ
    },
    {
      center: vector(0, upperChestY, 0.004),
      radiusX: Math.max(dimensions.chestRadiusX * 1.03, dimensions.shoulderWidth * 0.35),
      radiusZ: dimensions.chestRadiusZ * 0.9
    },
    {
      center: vector(0, shoulderY, 0),
      radiusX: dimensions.shoulderWidth * 0.53,
      radiusZ: dimensions.chestRadiusZ * 0.66
    },
    {
      center: vector(0, lerp(shoulderY, neckBaseY, 0.44), 0),
      radiusX: dimensions.shoulderWidth * 0.32,
      radiusZ: dimensions.chestRadiusZ * 0.5
    },
    {
      center: vector(0, neckBaseY, 0),
      radiusX: dimensions.neckRadius * 1.34,
      radiusZ: dimensions.neckRadius * 1.12
    },
    {
      center: vector(0, lerp(neckBaseY, neckTopY, 0.52), 0),
      radiusX: dimensions.neckRadius * 1.08,
      radiusZ: dimensions.neckRadius * 0.98
    },
    {
      center: vector(0, neckTopY, 0),
      radiusX: dimensions.neckRadius * 0.94,
      radiusZ: dimensions.neckRadius * 0.88
    }
  ];

  return buildHorizontalRingSurface(rings, BODY_SEGMENTS);
}

function buildHandGeometry(wrist: MannequinPoint, side: -1 | 1, body: MannequinBodyModel) {
  const radius = body.dimensions.lowerArmRadius;

  return buildEllipsoidGeometry({
    center: offsetPoint(wrist, side * radius * 0.28, -body.heightMeters * 0.033, body.heightMeters * 0.014),
    radiusX: radius * 0.82,
    radiusY: body.heightMeters * 0.036,
    radiusZ: radius * 0.62
  });
}

function buildLimbSurface(points: LimbControlPoint[], depthScale: number) {
  const orientedRings = points.map((point, index): OrientedRing => {
    const previous = points[Math.max(0, index - 1)].center;
    const next = points[Math.min(points.length - 1, index + 1)].center;
    const tangent = toVector(next).sub(toVector(previous)).normalize();

    return {
      center: toVector(point.center),
      radiusA: point.radius,
      radiusB: point.radius * depthScale,
      tangent
    };
  });

  return buildOrientedRingSurface(orientedRings, LIMB_SEGMENTS);
}

function buildHorizontalRingSurface(rings: MannequinSurfaceRing[], radialSegments: number) {
  const positions: number[] = [];
  const indices: number[] = [];

  for (const ring of rings) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const angle = (segment / radialSegments) * Math.PI * 2;
      const point = new Vector3(
        ring.center.x + Math.cos(angle) * ring.radiusX,
        ring.center.y,
        ring.center.z + Math.sin(angle) * ring.radiusZ
      );
      positions.push(point.x, point.y, point.z);
    }
  }

  addRingIndices(indices, rings.length, radialSegments);
  addCap(indices, 0, radialSegments, positions, rings[0].center, "start");
  addCap(indices, rings.length - 1, radialSegments, positions, rings[rings.length - 1].center, "end");

  return createGeometry(positions, indices);
}

function buildOrientedRingSurface(rings: OrientedRing[], radialSegments: number) {
  const positions: number[] = [];
  const indices: number[] = [];

  for (const ring of rings) {
    const { basisA, basisB } = getRingBasis(ring.tangent);

    for (let segment = 0; segment < radialSegments; segment += 1) {
      const angle = (segment / radialSegments) * Math.PI * 2;
      const point = ring.center
        .clone()
        .addScaledVector(basisA, Math.cos(angle) * ring.radiusA)
        .addScaledVector(basisB, Math.sin(angle) * ring.radiusB);
      positions.push(point.x, point.y, point.z);
    }
  }

  addRingIndices(indices, rings.length, radialSegments);
  addCap(indices, 0, radialSegments, positions, rings[0].center, "start");
  addCap(indices, rings.length - 1, radialSegments, positions, rings[rings.length - 1].center, "end");

  return createGeometry(positions, indices);
}

function buildEllipsoidGeometry({ center, radiusX, radiusY, radiusZ }: EllipsoidOptions) {
  const positions: number[] = [];
  const indices: number[] = [];
  const verticalSegments = 18;
  const radialSegments = 28;
  const centerVector = toVector(center);

  for (let latitude = 0; latitude <= verticalSegments; latitude += 1) {
    const v = latitude / verticalSegments;
    const phi = -Math.PI / 2 + v * Math.PI;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let segment = 0; segment < radialSegments; segment += 1) {
      const angle = (segment / radialSegments) * Math.PI * 2;
      const point = new Vector3(
        centerVector.x + Math.cos(angle) * cosPhi * radiusX,
        centerVector.y + sinPhi * radiusY,
        centerVector.z + Math.sin(angle) * cosPhi * radiusZ
      );
      positions.push(point.x, point.y, point.z);
    }
  }

  addRingIndices(indices, verticalSegments + 1, radialSegments);

  return createGeometry(positions, indices);
}

function addRingIndices(indices: number[], ringCount: number, radialSegments: number) {
  for (let ring = 0; ring < ringCount - 1; ring += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const nextSegment = (segment + 1) % radialSegments;
      const a = ring * radialSegments + segment;
      const b = ring * radialSegments + nextSegment;
      const c = (ring + 1) * radialSegments + segment;
      const d = (ring + 1) * radialSegments + nextSegment;
      indices.push(a, c, b, b, c, d);
    }
  }
}

function addCap(
  indices: number[],
  ringIndex: number,
  radialSegments: number,
  positions: number[],
  center: Vector3,
  side: "start" | "end"
) {
  const centerIndex = positions.length / 3;
  positions.push(center.x, center.y, center.z);

  for (let segment = 0; segment < radialSegments; segment += 1) {
    const nextSegment = (segment + 1) % radialSegments;
    const a = ringIndex * radialSegments + segment;
    const b = ringIndex * radialSegments + nextSegment;

    if (side === "start") {
      indices.push(centerIndex, b, a);
    } else {
      indices.push(centerIndex, a, b);
    }
  }
}

function createGeometry(positions: number[], indices: number[]) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function getRingBasis(tangent: Vector3) {
  const normalizedTangent = tangent.clone().normalize();
  const reference = Math.abs(normalizedTangent.dot(new Vector3(0, 1, 0))) > 0.92 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const basisA = reference.clone().cross(normalizedTangent).normalize();
  const basisB = normalizedTangent.clone().cross(basisA).normalize();
  return { basisA, basisB };
}

function offsetPoint(point: MannequinPoint, x: number, y: number, z: number): MannequinPoint {
  return {
    x: point.x + x,
    y: point.y + y,
    z: point.z + z
  };
}

function vector(x: number, y: number, z: number) {
  return new Vector3(x, y, z);
}

function toVector(point: MannequinPoint) {
  return new Vector3(point.x, point.y, point.z);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}
