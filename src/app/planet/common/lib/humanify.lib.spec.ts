import {
  formatDec,
  formatNumber,
  distanceM,
  distanceKm,
  areaM,
  areaKm,
  latitude,
  longitude,
} from './humanify.lib';

describe('humanify.lib', () => {
  it('formatDec applies south as negative', () => {
    expect(formatDec(55, 45, 0, 'S')).toBeCloseTo(-55.75, 6);
  });

  it('formatNumber uses comma decimals and grouped thousands above 9999', () => {
    expect(formatNumber(12345.6, 1)).toBe('12 345,6');
  });

  it('distanceM uses meters below 2000 and km at 2000', () => {
    expect(distanceM(0)).toBe('0 м');
    expect(distanceM(1500)).toBe('1500 м');
    expect(distanceM(2000)).toBe('2,0 км');
  });

  it('distanceKm always uses km text', () => {
    expect(distanceKm(500)).toMatch(/км/);
  });

  it('areaM uses м² and areaKm switches to км² above 100000', () => {
    expect(areaM(1.5)).toBe('1,5 м²');
    expect(areaKm(50)).toMatch(/м²/);
    expect(areaKm(100001)).toMatch(/км²/);
  });

  it('latitude and longitude use Russian hemisphere suffixes', () => {
    expect(latitude(55.75, 0)).toMatch(/сш/);
    expect(latitude(-10, 0)).toMatch(/юш/);
    expect(longitude(37.6, 0)).toMatch(/вд/);
    expect(longitude(-10, 1)).toMatch(/зд/);
    expect(latitude(55.75, 1)).toMatch(/°/);
  });
});
