import proj4 from 'proj4';
import * as Cesium from 'cesium';

export const crsLiterals = Object.freeze(['WGS-84', 'СК-42 м', 'СК-42 °', 'ПЗ-90.11'] as const);
export type CRS = (typeof crsLiterals)[number];

export function isCRS(name: string): name is CRS {
  return crsLiterals.some((crs) => crs === name);
}

export class CartographicLike {
  latitude: Cesium.Cartographic['latitude'];
  longitude: Cesium.Cartographic['longitude'];
  height: Cesium.Cartographic['height'];
}
export class Cartesian3Like {
  x: Cesium.Cartesian3['x'];
  y: Cesium.Cartesian3['y'];
  z: Cesium.Cartesian3['z'];
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function cartesianProjArgs(coord: Cartesian3Like): [number, number, number] | undefined {
  const x = finiteNumber(coord.x);
  const y = finiteNumber(coord.y);
  if (x === undefined || y === undefined) return undefined;
  return [x, y, finiteNumber(coord.z) ?? 0];
}

function cartographicProjArgs(coord: CartographicLike): [number, number, number] | undefined {
  const longitude = finiteNumber(coord.longitude);
  const latitude = finiteNumber(coord.latitude);
  if (longitude === undefined || latitude === undefined) return undefined;
  return [longitude, latitude, finiteNumber(coord.height) ?? 0];
}

function cartesianFromProjected(projected: number[], fallback: Cartesian3Like): Cartesian3Like {
  const x = projected[0];
  const y = projected[1];
  const z = projected[2];
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return { x: fallback.x, y: fallback.y, z: fallback.z };
  }
  return {
    x,
    y,
    z: typeof z === 'number' && Number.isFinite(z) ? z : fallback.z,
  };
}

function cartographicFromProjected(
  projected: number[],
  fallback: CartographicLike,
): CartographicLike {
  const longitude = projected[0];
  const latitude = projected[1];
  const height = projected[2];
  if (
    typeof longitude !== 'number' ||
    typeof latitude !== 'number' ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude)
  ) {
    return {
      longitude: fallback.longitude,
      latitude: fallback.latitude,
      height: fallback.height,
    };
  }
  return {
    longitude,
    latitude,
    height: typeof height === 'number' && Number.isFinite(height) ? height : fallback.height,
  };
}

function projectCartesian(
  coord: Cartesian3Like,
  project: (args: [number, number, number]) => number[],
): Cartesian3Like {
  const args = cartesianProjArgs(coord);
  if (!args) return { x: coord.x, y: coord.y, z: coord.z };
  return cartesianFromProjected(project(args), coord);
}

function projectCartographic(
  coord: CartographicLike,
  project: (args: [number, number, number]) => number[],
): CartographicLike {
  const args = cartographicProjArgs(coord);
  if (!args) {
    return {
      longitude: coord.longitude,
      latitude: coord.latitude,
      height: coord.height,
    };
  }
  return cartographicFromProjected(project(args), coord);
}

export class CoordSystems {
  // Перевод из указанной СК в WGS84 (EPSG:4326)
  static toWGS84Cartesian(nameCS: CRS, coord: Cartesian3Like, zone?: number | ''): Cartesian3Like {
    if (nameCS === 'WGS-84') {
      return {
        x: coord.x,
        y: coord.y,
        z: coord.z,
      };
    }
    return projectCartesian(coord, (args) =>
      proj4(
        this.DEFS[nameCS].SRS(coord, zone),
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
        args,
      ),
    );
  }

  // Перевод из указанной СК в WGS84 (EPSG:4326)
  static toWGS84Cartographic(
    nameCS: CRS,
    coord: CartographicLike,
    zone?: number | '',
  ): CartographicLike {
    if (nameCS === 'WGS-84') {
      return { longitude: coord.longitude, latitude: coord.latitude, height: coord.height };
    }
    return projectCartographic(coord, (args) =>
      proj4(
        this.DEFS[nameCS].SRS(coord, zone),
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
        args,
      ),
    );
  }

  // Пересчет в указанную СК из широты-долготы из WGS84 (используемой Cesium)
  static fromWGS84Cartographic(
    nameCS: CRS,
    cartographic: CartographicLike,
    zone?: number | '',
  ): CartographicLike {
    zone = zone === '' ? undefined : zone;
    return this.DEFS[nameCS].fromWGS84Cartographic(cartographic, zone);
  }

  // Определения систем координат
  static DEFS: Record<
    CRS,
    {
      units: string;
      output: string[];
      systemHeight: string;
      fromWGS84Cartographic(
        coordinates?: CartographicLike | Cartesian3Like,
        zone?: number | '',
      ): CartographicLike;
      SRS(coordinates?: CartographicLike | Cartesian3Like, zone?: number | ''): string;
    }
  > = {
    'WGS-84': {
      units: 'degrees',
      output: ['B', 'L'],
      systemHeight: 'высота над эллипсоидом WGS-84',
      fromWGS84Cartographic(cartographic: CartographicLike): CartographicLike {
        return cartographic;
      },
      SRS(): string {
        return ``;
      },
    },
    'СК-42 м': {
      // ГОСТ 51794-2008
      units: 'meters',
      output: ['X', 'Y'],
      systemHeight: 'средний уровень Мирового океана',
      fromWGS84Cartographic(cartographic: CartographicLike, zone?: number | ''): CartographicLike {
        return projectCartographic(cartographic, (args) =>
          proj4(this.SRS(cartographic, zone), args),
        );
      },
      SRS(coordinates: CartographicLike | Cartesian3Like, zone?: number | ''): string {
        if (zone === undefined || zone === '') {
          const lon =
            coordinates && 'longitude' in coordinates && typeof coordinates.longitude === 'number'
              ? coordinates.longitude
              : undefined;
          const lat =
            coordinates && 'latitude' in coordinates && typeof coordinates.latitude === 'number'
              ? coordinates.latitude
              : undefined;
          const height =
            coordinates && 'height' in coordinates && typeof coordinates.height === 'number'
              ? coordinates.height
              : undefined;
          const looksGeographic =
            lon !== undefined &&
            lat !== undefined &&
            Number.isFinite(lon) &&
            Number.isFinite(lat) &&
            Math.abs(lon) <= 180 &&
            Math.abs(lat) <= 90;
          if (looksGeographic) {
            const sk42 = proj4(
              '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22',
              [lon, lat, finiteNumber(height) ?? 0],
            );
            const sk42longitude = sk42[0];
            zone = sk42longitude / 6;
            if (zone <= 0) zone += 60;
            zone = Math.ceil(zone);
          } else {
            const easting =
              lon !== undefined && Number.isFinite(lon) && Math.abs(lon) > 180
                ? lon
                : coordinates && 'x' in coordinates && typeof coordinates.x === 'number'
                  ? coordinates.x
                  : undefined;
            if (typeof easting === 'number' && Number.isFinite(easting)) {
              zone = Math.floor(easting / 1000000);
            }
          }
        }
        if (typeof zone !== 'number' || !Number.isFinite(zone)) {
          return '';
        }
        const lon0 = zone * 6 - 3;
        return `+proj=tmerc +lat_0=0 +lon_0=${lon0} +k=1 +x_0=${zone}500000 +y_0=0 \
        +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs`;
      },
    },
    'СК-42 °': {
      // ГОСТ 51794-2008
      units: 'degrees',
      output: ['B', 'L'],
      systemHeight: 'средний уровень Мирового океана',
      fromWGS84Cartographic(cartographic: CartographicLike): CartographicLike {
        return projectCartographic(cartographic, (args) => proj4(this.SRS(), args));
      },
      SRS(): string {
        return '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22';
      },
    },
    // Справочный документ «ПАРАМЕТРЫ ЗЕМЛИ 1990 ГОДА» (ПЗ-90.11),
    // М.: ВОЕННО-ТОПОГРАФИЧЕСКОЕ УПРАВЛЕНИЕ ГЕНЕРАЛЬНОГО ШТАБА ВООРУЖЕННЫХ СИЛ
    // РОССИЙСКОЙ ФЕДЕРАЦИИ.— 2014.
    'ПЗ-90.11': {
      units: 'degrees',
      output: ['B', 'L'],
      systemHeight: 'высота над эллипсоидом ПЗ-90.11',
      fromWGS84Cartographic(cartographic: CartographicLike): CartographicLike {
        return projectCartographic(cartographic, (args) => proj4(this.SRS(), args));
      },
      SRS(): string {
        return `+proj=longlat +a=6378136 +b=6356751.361795687 \
        +towgs84=0.013,-0.106,-0.022,-0.0023,0.00354,-0.00421,0.008`;
      },
    },
  };
}
// Предыдущий вариант.
// /* eslint-disable quotes */
// /* eslint-disable no-param-reassign */
// import proj4 from 'proj4';

// // Преобразования систем координат

// export default class CoordSystems {
//   // Пересчет в широту-долготу WGS-84 из указанной СК
//   static toCartographic(nameCS, coord, zone) {
//     if (nameCS === 'WGS-84') {
//       return coord;
//     }
//     const lonlat = proj4(
//       this.DEFS[nameCS].SRS(coord, zone),
//       '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
//       [coord.x, coord.y, coord.z],
//     ); // -> EPSG:4326
//     return lonlat;
//   }

//   // Пересчет в указанную СК из широты-долготы
//   static fromWGS84Cartographic(nameCS, cartographic, zone) {
//     zone = zone === '' ? zone : undefined;
//     return this.DEFS[nameCS].fromWGS84Cartographic(cartographic, zone);
//   }

//   // Определения систем координат
//   /* eslint-disable */
//   static DEFS = {
//     /* eslint-enaable */
//     'WGS-84': {
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'высота над эллипсоидом WGS-84',
//       fromWGS84Cartographic: function fromWGS84Cartographic(cartographic) {
//         return cartographic;
//       },
//     },
//     'СК-42 м': {
//       // ГОСТ 51794-2008
//       units: 'meters',
//       output: ['X', 'Y'],
//       systemHeight: 'средний уровень Мирового океана',
//       fromWGS84Cartographic: function fromWGS84Cartographic(cartographic, zone) {
//         const projected = proj4(this.SRS(cartographic, zone), [
//           cartographic.longitude,
//           cartographic.latitude,
//           cartographic.height,
//         ]);
//         return {
//           longitude: projected[0],
//           latitude: projected[1],
//           height: projected[2],
//         };
//       },
//       SRS: function SRS(coordinates, zone) {
//         if (zone === undefined) {
//           if (typeof coordinates.longitude !== 'undefined') {
//             const sk42 = proj4(CoordSystems.DEFS['СК-42 °'].SRS(), [
//               coordinates.longitude,
//               coordinates.latitude,
//               coordinates.height,
//             ]);
//             const sk42longitude = sk42[0];
//             zone = sk42longitude / 6; // coordinates.longitude
//             if (zone <= 0) zone += 60;
//             zone = Math.ceil(zone);
//           } else {
//             zone = Math.floor(coordinates.x / 1000000);
//           }
//         }
//         const lon0 = zone * 6 - 3;
//         return `+proj=tmerc +lat_0=0 +lon_0=${lon0} +k=1 +x_0=${zone}500000 +y_0=0 \
//         +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs`;
//       },
//     },
//     'СК-42 °': {
//       // ГОСТ 51794-2008
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'средний уровень Мирового океана',
//       fromWGS84Cartographic: function fromWGS84Cartographic(cartographic) {
//         const projected = proj4(this.SRS(), [
//           cartographic.longitude,
//           cartographic.latitude,
//           cartographic.height,
//         ]);
//         return {
//           longitude: projected[0],
//           latitude: projected[1],
//           height: projected[2],
//         };
//       },
//       SRS: function SRS() {
//         return '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22';
//       },
//     },
//     // Справочный документ «ПАРАМЕТРЫ ЗЕМЛИ 1990 ГОДА» (ПЗ-90.11),
//     // М.: ВОЕННО-ТОПОГРАФИЧЕСКОЕ УПРАВЛЕНИЕ ГЕНЕРАЛЬНОГО ШТАБА ВООРУЖЕННЫХ СИЛ
//     // РОССИЙСКОЙ ФЕДЕРАЦИИ.— 2014.
//     'ПЗ-90.11': {
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'высота над эллипсоидом ПЗ-90.11',
//       fromWGS84Cartographic: function fromWGS84Cartographic(cartographic) {
//         const projected = proj4(this.SRS(), [
//           cartographic.longitude,
//           cartographic.latitude,
//           cartographic.height,
//         ]);
//         return {
//           longitude: projected[0],
//           latitude: projected[1],
//           height: projected[2],
//         };
//       },
//       SRS: function SRS() {
//         return `+proj=longlat +a=6378136 +b=6356751.361795687 \
//         +towgs84=0.013,-0.106,-0.022,-0.0023,0.00354,-0.00421,0.008`;
//       },
//     },
//   };
// }

// Вариант в виде сервиса
// import { Injectable } from '@angular/core';
// import proj4 from 'proj4';
// import * as Cesium from 'cesium';

// export type CRS = 'WGS-84' | 'СК-42 м' | 'СК-42 °' | 'ПЗ-90.11';
// export class CartographicLike {
//   latitude: Cesium.Cartographic['latitude'];
//   longitude: Cesium.Cartographic['longitude'];
//   height: Cesium.Cartographic['height'];
// }
// export class Cartesian3Like {
//   x: Cesium.Cartesian3['x'];
//   y: Cesium.Cartesian3['y'];
//   z: Cesium.Cartesian3['z'];
// }
// // Применение сервиса ограничено глобальным модулем planet
// // @Injectable({
// //   providedIn: 'root',
// // })
// @Injectable()
// // Преобразования систем координат
// export class CoordSystemsService {
//   // Пересчет в широту-долготу WGS-84 из указанной СК
//   public toCartographic(
//     nameCS: CRS,
//     coord: Cartesian3Like,
//     zone?: number | '',
//   ): Cartesian3Like | number[] {
//     if (nameCS === 'WGS-84') {
//       return coord;
//     }
//     const lonlat: number[] = proj4(
//       this.DEFS[nameCS].SRS(coord, zone),
//       '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
//       [coord.x, coord.y, coord.z],
//     ); // -> EPSG:4326
//     return lonlat;
//   }

//   // Пересчет в указанную СК из широты-долготы
//   public fromWGS84Cartographic(
//     nameCS: CRS,
//     cartographic: CartographicLike,
//     zone?: number | '',
//   ): CartographicLike {
//     zone = zone === '' ? zone : undefined;
//     return this.DEFS[nameCS].fromWGS84Cartographic(cartographic, zone);
//   }

//   // Определения систем координат
//   private DEFS: {
//     [key: string]: {
//       units: string;
//       output: string[];
//       systemHeight: string;
//       fromWGS84Cartographic(
//         coordinates?: CartographicLike | Cartesian3Like,
//         zone?: number | '',
//       ): CartographicLike;
//       SRS(coordinates?: CartographicLike | Cartesian3Like, zone?: number | ''): string;
//     };
//   } = {
//     'WGS-84': {
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'высота над эллипсоидом WGS-84',
//       fromWGS84Cartographic(cartographic: CartographicLike): CartographicLike {
//         return cartographic;
//       },
//       SRS(): string {
//         return ``;
//       },
//     },
//     'СК-42 м': {
//       // ГОСТ 51794-2008
//       units: 'meters',
//       output: ['X', 'Y'],
//       systemHeight: 'средний уровень Мирового океана',
//       fromWGS84Cartographic(cartographic: CartographicLike, zone?: number | ''): CartographicLike {
//         const projected = proj4(this.SRS(cartographic, zone), [
//           cartographic.longitude,
//           cartographic.latitude,
//           cartographic.height,
//         ]);
//         return {
//           longitude: projected[0],
//           latitude: projected[1],
//           height: projected[2],
//         };
//       },
//       SRS(coordinates: CartographicLike | Cartesian3Like, zone?: number | ''): string {
//         if (zone === undefined) {
//           if (coordinates instanceof CartographicLike) {
//             // if (coordinates?.longitude && coordinates?.latitude) {
//             const sk42 = proj4(
//               '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22', // this.CoordSystemsService.DEFS['СК-42 °'].SRS()
//               [coordinates?.longitude, coordinates?.latitude, coordinates?.height],
//             );
//             const sk42longitude = sk42[0];
//             zone = sk42longitude / 6;
//             if (zone <= 0) zone += 60;
//             zone = Math.ceil(zone);
//           } else {
//             if (coordinates?.x) zone = Math.floor(coordinates?.x / 1000000);
//           }
//         }
//         const lon0 = (zone as number) * 6 - 3;
//         return `+proj=tmerc +lat_0=0 +lon_0=${lon0} +k=1 +x_0=${zone}500000 +y_0=0 \
//         +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs`;
//       },
//     },
//     'СК-42 °': {
//       // ГОСТ 51794-2008
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'средний уровень Мирового океана',
//       fromWGS84Cartographic(cartographic: CartographicLike): CartographicLike {
//         const projected = proj4(this.SRS(), [
//           cartographic.longitude,
//           cartographic.latitude,
//           cartographic.height,
//         ]);
//         return {
//           longitude: projected[0],
//           latitude: projected[1],
//           height: projected[2],
//         };
//       },
//       SRS(): string {
//         return '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22';
//       },
//     },
//     // Справочный документ «ПАРАМЕТРЫ ЗЕМЛИ 1990 ГОДА» (ПЗ-90.11),
//     // М.: ВОЕННО-ТОПОГРАФИЧЕСКОЕ УПРАВЛЕНИЕ ГЕНЕРАЛЬНОГО ШТАБА ВООРУЖЕННЫХ СИЛ
//     // РОССИЙСКОЙ ФЕДЕРАЦИИ.— 2014.
//     'ПЗ-90.11': {
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'высота над эллипсоидом ПЗ-90.11',
//       fromWGS84Cartographic(cartographic: CartographicLike): CartographicLike {
//         const projected = proj4(this.SRS(), [
//           cartographic.longitude,
//           cartographic.latitude,
//           cartographic.height,
//         ]);
//         return {
//           longitude: projected[0],
//           latitude: projected[1],
//           height: projected[2],
//         };
//       },
//       SRS(): string {
//         return `+proj=longlat +a=6378136 +b=6356751.361795687 \
//         +towgs84=0.013,-0.106,-0.022,-0.0023,0.00354,-0.00421,0.008`;
//       },
//     },
//   };
// }
