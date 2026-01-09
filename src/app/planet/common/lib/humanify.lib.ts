export function formatDec(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string,
): number {
  let dd: number = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    dd *= -1;
  }
  return dd;
}

export function formatNumber(number: number, decimals: number = -1): string {
  let whole: string[];
  let integer: string;
  if (decimals === -1) {
    whole = number.toString().split('.');
  } else {
    whole = number.toFixed(decimals).split('.');
  }
  if (Number(whole[0]) < -9999 || Number(whole[0]) > 9999) {
    integer = whole[0]
      .split('')
      .reverse()
      .reduce((acc, num, i) => num + (i && !(i % 3) ? ' ' : '') + acc, '')
      .replace('- ', '-');
  } else {
    [integer] = whole;
  }
  if (whole.length > 1) integer += `,${whole[1]}`;
  return integer;
}

export function formatDms(degrees: number, decimals: number): string {
  let nullSign: string;
  let d: number;
  let m: number;
  let s: number;
  if (degrees > -1 && degrees < 0) {
    // при значениях градусов от -1 до 0 необходимо присваивать строковое значение "-0"
    nullSign = '-';
  } else {
    nullSign = '';
  }
  d = 0 | degrees;
  degrees = Math.abs(degrees);
  m = 0 | ((degrees % 1) * 60);
  if (decimals === 0) {
    s = Math.round(((degrees * 60) % 1) * 60);
  } else {
    s = (degrees - Math.abs(d)) * 3600 - m * 60;
    if (decimals >= 0) {
      s = parseFloat(s.toFixed(decimals));
    }
  }
  // Если после округления получилось 60 секунд,
  // а также если после этого получилось 60 минут
  if (s === 60) {
    m++;
    s = 0;
    if (m === 60) {
      if (d >= 0) {
        d++;
      } else {
        d--;
      }
      m = 0;
    }
  }
  return [nullSign, d, '° ', twoString(m), "' ", twoString(s), '"'].join('');

  function twoString(value: number): string {
    const newValue = value < 10 ? `0${value.toString()}` : value.toString();
    return newValue.replace('.', ',');
  }
}

export function cartesian(value: number): string {
  return `${formatNumber(value, 1)} м`;
}

export function longitude(value: number, dms: number): string {
  const suffix: string = value > 0 ? 'вд' : 'зд';
  value = Math.abs(value);
  if (dms) {
    return `${formatDms(value, 2)} ${suffix}`;
  }
  return `${formatNumber(value, 6)}° ${suffix}`;
}

export function latitude(value: number, dms: number): string {
  const suffix: string = value > 0 ? 'сш' : 'юш';
  value = Math.abs(value);

  if (dms) {
    return `${formatDms(value, 2)} ${suffix}`;
  }
  return `${formatNumber(value, 6)}° ${suffix}`;
}

export function angle(value: number): string {
  return `${formatNumber(value, 0)}°`;
}

export function distance(value: number): string {
  const absValue: number = Math.abs(value);

  if (absValue >= 20000) {
    return `${formatNumber(value / 1000, 0)} км`;
  }
  if (absValue >= 2000) {
    return `${formatNumber(value / 1000, 1)} км`;
  }
  if (absValue >= 200) {
    return `${formatNumber(value, 0)} м`;
  }
  return `${formatNumber(value, 1)} м`;
}

export function distanceM(value: number): string {
  const absValue: number = Math.abs(value);
  if (absValue >= 20000) {
    return `${formatNumber(value / 1000, 0)} км`;
  }
  if (absValue >= 2000) {
    return `${formatNumber(value / 1000, 1)} км`;
  }
  return `${formatNumber(value, 0)} м`;
}

export function distanceKm(value: number): string {
  const absValue: number = Math.abs(value);
  if (absValue >= 10000) {
    return `${formatNumber(value / 1000, 0)} км`;
  }
  return `${formatNumber(value / 1000, 1)} км`;
}

export function areaKm(value: number): string {
  if (value > 100000) {
    return `${formatNumber(value / 1000000, 1)} км²`;
  }
  return `${formatNumber(value, 1)} м²`;
}

export function areaKmOnly(value: number): string {
  return `${formatNumber(value / 1000000, 3)} км²`;
}

export function areaM(value: number): string {
  return `${formatNumber(value, 1)} м²`;
}

export function areaGa(value: number): string {
  if (value > 1000) {
    return `${formatNumber(value / 10000, 1)} га`;
  }
  return `${formatNumber(value / 100, 3)} а`; // = ар, сотка
}

export function azimuth(value: number): string {
  if (value < 0) {
    value += 360;
  }
  if (value >= 359.5) {
    value = 0;
  }
  return `${formatNumber(value, 0)}°`;
}
