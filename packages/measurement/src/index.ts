export interface BodyMeasurements {
  heightCm: number;
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm: number;
  hipCircumferenceCm: number;
  torsoLengthCm: number;
  inseamCm: number;
  armLengthCm: number;
  footLengthCm: number;
}

export interface MannequinParameters {
  heightMeters: number;
  shoulderWidthMeters: number;
  chestRadiusMeters: number;
  waistRadiusMeters: number;
  hipRadiusMeters: number;
  torsoLengthMeters: number;
  legLengthMeters: number;
  armLengthMeters: number;
}

export const sampleBodyMeasurements: BodyMeasurements = {
  heightCm: 178,
  shoulderWidthCm: 45,
  chestCircumferenceCm: 99,
  waistCircumferenceCm: 82,
  hipCircumferenceCm: 99,
  torsoLengthCm: 61,
  inseamCm: 81,
  armLengthCm: 62,
  footLengthCm: 27
};

export function createMannequinParameters(measurements: BodyMeasurements): MannequinParameters {
  return {
    heightMeters: cmToMeters(measurements.heightCm),
    shoulderWidthMeters: cmToMeters(measurements.shoulderWidthCm),
    chestRadiusMeters: circumferenceToRadiusMeters(measurements.chestCircumferenceCm),
    waistRadiusMeters: circumferenceToRadiusMeters(measurements.waistCircumferenceCm),
    hipRadiusMeters: circumferenceToRadiusMeters(measurements.hipCircumferenceCm),
    torsoLengthMeters: cmToMeters(measurements.torsoLengthCm),
    legLengthMeters: cmToMeters(measurements.inseamCm),
    armLengthMeters: cmToMeters(measurements.armLengthCm)
  };
}

function cmToMeters(value: number) {
  return value / 100;
}

function circumferenceToRadiusMeters(value: number) {
  return value / (100 * Math.PI * 2);
}
