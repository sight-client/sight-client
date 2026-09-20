import * as Cesium from 'cesium';
import {
  calculatePosDistancesWhithoutHumanify,
  calculatePosDistances,
  calculateAreaWithTurfWhithoutHumanify,
  transformCartesianArrayToWGS84Array,
} from './basic-measure-calculations.lib';

const moscow = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 0);
const spb = Cesium.Cartesian3.fromDegrees(30.3351, 59.9343, 0);

describe('basic-measure-calculations.lib', () => {
  it('returns 0 for empty or single-point distance', () => {
    expect(calculatePosDistancesWhithoutHumanify([])).toBe(0);
    expect(calculatePosDistancesWhithoutHumanify([moscow])).toBe(0);
  });

  it('geodesic Moscow to Saint Petersburg is hundreds of kilometers', () => {
    const m = calculatePosDistancesWhithoutHumanify([moscow, spb]);
    expect(m).toBeGreaterThan(600_000);
    expect(m).toBeLessThan(750_000);
  });

  it('adds height hypotenuse on top of surface distance', () => {
    const a = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 0);
    const b = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 300);
    const m = calculatePosDistancesWhithoutHumanify([a, b]);
    expect(m).toBeCloseTo(300, 0);
  });

  it('Turf area is 0 for fewer than 3 positions', () => {
    expect(calculateAreaWithTurfWhithoutHumanify([moscow, spb])).toBe(0);
  });

  it('Turf area of a small closed triangle is positive', () => {
    const p0 = Cesium.Cartesian3.fromDegrees(37.6, 55.75, 0);
    const p1 = Cesium.Cartesian3.fromDegrees(37.61, 55.75, 0);
    const p2 = Cesium.Cartesian3.fromDegrees(37.61, 55.76, 0);
    const area = calculateAreaWithTurfWhithoutHumanify([p0, p1, p2]);
    expect(area).toBeGreaterThan(0);
  });

  it('transformCartesianArrayToWGS84Array returns empty array for empty input', () => {
    expect(transformCartesianArrayToWGS84Array([])).toEqual([]);
  });

  it('transformCartesianArrayToWGS84Array converts one point to WGS84 degrees', () => {
    const point = Cesium.Cartesian3.fromDegrees(37.62, 55.76, 100);
    const [wgs] = transformCartesianArrayToWGS84Array([point]);
    expect(wgs!.lng).toBeCloseTo(37.62, 2);
    expect(wgs!.lat).toBeCloseTo(55.76, 2);
  });

  it('calculatePosDistances humanifies zero for empty positions', () => {
    const formatted = calculatePosDistances([]);
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).toMatch(/0/);
  });
});
