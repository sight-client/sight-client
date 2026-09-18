import { CoordSystems } from './coord-sistems.lib';

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

    expect(Number.isFinite(sk42.longitude)).toBeTrue();
    expect(sk42.longitude).toBeGreaterThan(7_000_000);
    expect(sk42.longitude).toBeLessThan(8_000_000);
    expect(sk42.latitude).toBeGreaterThan(6_000_000);
    expect(sk42.latitude).toBeLessThan(6_500_000);
  });

  it('keeps an explicit GK zone instead of dropping it', () => {
    const zone7 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, 7);
    const zone8 = CoordSystems.fromWGS84Cartographic('СК-42 м', MOSCOW_WGS84, 8);

    expect(Number.isFinite(zone7.longitude)).toBeTrue();
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

    expect(Number.isFinite(wgs.longitude)).toBeTrue();
    expect(Number.isFinite(wgs.latitude)).toBeTrue();
    expect(wgs.longitude).toBeCloseTo(MOSCOW_WGS84.longitude, 4);
    expect(wgs.latitude).toBeCloseTo(MOSCOW_WGS84.latitude, 4);
  });
});
