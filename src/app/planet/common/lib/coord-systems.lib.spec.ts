import { CoordSystems } from './coord-systems.lib';

// Москва: 6° зона Гаусса–Крюгера №7 (lon_0 = 39°, x_0 = 7500000).
// Независимые границы: Y (восточное смещение) в зоне 7, X (северное) около 55.8°N.
const MOSCOW_WGS84 = {
  longitude: 37.6173,
  latitude: 55.7558,
  height: 0,
};

describe('CoordSystems SK-42 m zone', () => {
  it('treats empty zone as auto-detect so Moscow easting stays in GK zone 7', () => {
    const sk42 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, '');

    expect(Number.isFinite(sk42.longitude)).toBe(true);
    expect(sk42.longitude).toBeGreaterThan(7_000_000);
    expect(sk42.longitude).toBeLessThan(8_000_000);
    expect(sk42.latitude).toBeGreaterThan(6_000_000);
    expect(sk42.latitude).toBeLessThan(6_500_000);
  });

  it('keeps an explicit GK zone instead of dropping it', () => {
    const zone7 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, 7);
    const zone8 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, 8);

    expect(Number.isFinite(zone7.longitude)).toBe(true);
    expect(zone7.longitude).toBeGreaterThan(7_000_000);
    expect(zone7.longitude).toBeLessThan(8_000_000);
    expect(zone8.longitude).toBeGreaterThan(8_000_000);
    expect(zone8.longitude).toBeLessThan(9_000_000);
  });

  it('round-trips Moscow through SK-42 m meters when zone is auto', () => {
    const sk42 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, '');
    const wgs = CoordSystems.toWGS84Cartesian(
      'СК-42 м',
      { x: sk42.longitude, y: sk42.latitude, z: sk42.height },
      '',
    );

    expect(wgs.x).toBeCloseTo(MOSCOW_WGS84.longitude, 4);
    expect(wgs.y).toBeCloseTo(MOSCOW_WGS84.latitude, 4);
  });

  it('round-trips SK-42 m meters stored in CartographicLike when zone is auto', () => {
    const sk42 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, '');
    const wgs = CoordSystems.toWGS84Cartographic('СК-42 м', sk42, '');

    expect(Number.isFinite(wgs.longitude)).toBe(true);
    expect(Number.isFinite(wgs.latitude)).toBe(true);
    expect(wgs.longitude).toBeCloseTo(MOSCOW_WGS84.longitude, 4);
    expect(wgs.latitude).toBeCloseTo(MOSCOW_WGS84.latitude, 4);
  });

  it('round-trips WGS-84 cartographic through from and to', () => {
    const from = CoordSystems.fromWGS84Cartographic('WGS-84', MOSCOW_WGS84);
    const back = CoordSystems.toWGS84Cartographic('WGS-84', from);
    expect(back.longitude).toBeCloseTo(MOSCOW_WGS84.longitude, 6);
    expect(back.latitude).toBeCloseTo(MOSCOW_WGS84.latitude, 6);
  });

  it('СК-42 ° forward and back stays in degrees not GK meters', () => {
    const sk42deg = CoordSystems.fromWGS84Cartographic('СК-42 °', MOSCOW_WGS84);
    expect(sk42deg.longitude).toBeLessThan(180);
    expect(Math.abs(sk42deg.longitude)).toBeGreaterThan(1);
    const back = CoordSystems.toWGS84Cartographic('СК-42 °', sk42deg);
    expect(back.longitude).toBeCloseTo(MOSCOW_WGS84.longitude, 4);
    expect(back.latitude).toBeCloseTo(MOSCOW_WGS84.latitude, 4);
  });

  it('ПЗ-90.11 forward and back is close to Moscow', () => {
    const pz = CoordSystems.fromWGS84Cartographic('ПЗ-90.11', MOSCOW_WGS84);
    const back = CoordSystems.toWGS84Cartographic('ПЗ-90.11', pz);
    expect(back.longitude).toBeCloseTo(MOSCOW_WGS84.longitude, 4);
    expect(back.latitude).toBeCloseTo(MOSCOW_WGS84.latitude, 4);
  });

  it('toWGS84Cartographic SK-42 m meters with empty zone yields finite WGS degrees', () => {
    const wgs = CoordSystems.toWGS84Cartographic(
      'СК-42 м',
      { longitude: 7376173, latitude: 6180000, height: 0 },
      '',
    );
    expect(Number.isFinite(wgs.longitude)).toBe(true);
    expect(Number.isFinite(wgs.latitude)).toBe(true);
    expect(Math.abs(wgs.longitude)).toBeLessThan(180);
    expect(Math.abs(wgs.latitude)).toBeLessThan(90);
  });

  it('fromWGS84Cartographic keeps source when lon/lat are not finite', () => {
    const source = { longitude: Number.POSITIVE_INFINITY, latitude: 55.7558, height: 0 };
    const out = CoordSystems.fromWGS84Cartographic('СК-42 °', source);
    expect(out.longitude).toBe(source.longitude);
    expect(out.latitude).toBe(source.latitude);
  });
});
