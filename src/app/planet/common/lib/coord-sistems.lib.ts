import proj4 from 'proj4';
import * as Cesium from 'cesium';

export const crsLiterals = Object.freeze(['WGS-84', 'СК-42 м', 'СК-42 °', 'ПЗ-90.11'] as const);
export type CRS = (typeof crsLiterals)[number];

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
    const projected: number[] = proj4(
      this.DEFS[nameCS].SRS(coord, zone), // проекция для исходной СК
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees', // проекция для WGS84 (EPSG:4326)
      [coord.x, coord.y, coord.z],
    );
    return {
      x: projected[0],
      y: projected[1],
      z: projected[2],
    };
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
    const projected: number[] = proj4(
      this.DEFS[nameCS].SRS(coord, zone), // проекция для исходной СК
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees', // проекция для WGS84 (EPSG:4326)
      [coord.longitude, coord.latitude, coord.height],
    );
    return {
      longitude: projected[0],
      latitude: projected[1],
      height: projected[2],
    };
  }

  // Пересчет в указанную СК из широты-долготы из WGS84 (используемой Cesium)
  static fromWGS84Cartographic(
    nameCS: CRS,
    cartographic: CartographicLike,
    zone?: number | '',
  ): CartographicLike {
    zone = zone === '' ? zone : undefined;
    return this.DEFS[nameCS].fromWGS84Cartographic(cartographic, zone);
  }

  // Определения систем координат
  static DEFS: {
    [key: string]: {
      units: string;
      output: string[];
      systemHeight: string;
      fromWGS84Cartographic(
        coordinates?: CartographicLike | Cartesian3Like,
        zone?: number | '',
      ): CartographicLike;
      SRS(coordinates?: CartographicLike | Cartesian3Like, zone?: number | ''): string;
    };
  } = {
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
        // Если указана только одна проекция, предполагается, что она проецируется из системы координат WGS84 (из спецификации proj4js)
        const projected = proj4(this.SRS(cartographic, zone), [
          cartographic.longitude,
          cartographic.latitude,
          cartographic.height,
        ]);
        return {
          longitude: projected[0],
          latitude: projected[1],
          height: projected[2],
        };
      },
      SRS(coordinates: CartographicLike | Cartesian3Like, zone?: number | ''): string {
        if (zone === undefined) {
          if (coordinates instanceof CartographicLike) {
            // if (coordinates?.longitude && coordinates?.latitude) {
            const sk42 = proj4(
              '+proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22', // this.CoordSystemsService.DEFS['СК-42 °'].SRS()
              [coordinates?.longitude, coordinates?.latitude, coordinates?.height],
            );
            const sk42longitude = sk42[0];
            zone = sk42longitude / 6;
            if (zone <= 0) zone += 60;
            zone = Math.ceil(zone);
          } else {
            if (coordinates?.x) zone = Math.floor(coordinates?.x / 1000000);
          }
        }
        const lon0 = (zone as number) * 6 - 3;
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
        const projected = proj4(this.SRS(), [
          cartographic.longitude,
          cartographic.latitude,
          cartographic.height,
        ]);
        return {
          longitude: projected[0],
          latitude: projected[1],
          height: projected[2],
        };
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
        const projected = proj4(this.SRS(), [
          cartographic.longitude,
          cartographic.latitude,
          cartographic.height,
        ]);
        return {
          longitude: projected[0],
          latitude: projected[1],
          height: projected[2],
        };
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
