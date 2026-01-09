import proj4 from 'proj4';
import * as Cesium from 'cesium';

export type CRS = 'WGS-84' | 'СК-42 м' | 'СК-42 °' | 'ПЗ-90.11';

export class CartographicVals {
  latitude: Cesium.Cartographic['latitude'];
  longitude: Cesium.Cartographic['longitude'];
  height: Cesium.Cartographic['height'];
}
export class Cartesian3Vals {
  x: Cesium.Cartesian3['x'];
  y: Cesium.Cartesian3['y'];
  z: Cesium.Cartesian3['z'];
}

export class CoordSystems {
  static toCartographic(
    nameCS: CRS,
    coord: Cartesian3Vals,
    zone?: number | '',
  ): Cartesian3Vals | number[] {
    if (nameCS === 'WGS-84') {
      return coord;
    }
    const lonlat: number[] = proj4(
      this.DEFS[nameCS].SRS(coord, zone),
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      [coord.x, coord.y, coord.z],
    ); // -> EPSG:4326
    return lonlat;
  }

  // Пересчет в указанную СК из широты-долготы
  static fromCartographic(
    nameCS: CRS,
    cartographic: CartographicVals,
    zone?: number | '',
  ): CartographicVals {
    zone = zone === '' ? zone : undefined;
    return this.DEFS[nameCS].fromCartographic(cartographic, zone);
  }

  // Определения систем координат
  static DEFS: {
    [key: string]: {
      units: string;
      output: string[];
      systemHeight: string;
      fromCartographic(
        coordinates?: CartographicVals | Cartesian3Vals,
        zone?: number | '',
      ): CartographicVals;
      SRS(coordinates?: CartographicVals | Cartesian3Vals, zone?: number | ''): string;
    };
  } = {
    'WGS-84': {
      units: 'degrees',
      output: ['B', 'L'],
      systemHeight: 'высота над эллипсоидом WGS-84',
      fromCartographic(cartographic: CartographicVals): CartographicVals {
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
      fromCartographic(cartographic: CartographicVals, zone?: number | ''): CartographicVals {
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
      SRS(coordinates: CartographicVals | Cartesian3Vals, zone?: number | ''): string {
        if (zone === undefined) {
          if (coordinates instanceof CartographicVals) {
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
      fromCartographic(cartographic: CartographicVals): CartographicVals {
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
      fromCartographic(cartographic: CartographicVals): CartographicVals {
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
//   static fromCartographic(nameCS, cartographic, zone) {
//     zone = zone === '' ? zone : undefined;
//     return this.DEFS[nameCS].fromCartographic(cartographic, zone);
//   }

//   // Определения систем координат
//   /* eslint-disable */
//   static DEFS = {
//     /* eslint-enaable */
//     'WGS-84': {
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'высота над эллипсоидом WGS-84',
//       fromCartographic: function fromCartographic(cartographic) {
//         return cartographic;
//       },
//     },
//     'СК-42 м': {
//       // ГОСТ 51794-2008
//       units: 'meters',
//       output: ['X', 'Y'],
//       systemHeight: 'средний уровень Мирового океана',
//       fromCartographic: function fromCartographic(cartographic, zone) {
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
//       fromCartographic: function fromCartographic(cartographic) {
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
//       fromCartographic: function fromCartographic(cartographic) {
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
// export class CartographicVals {
//   latitude: Cesium.Cartographic['latitude'];
//   longitude: Cesium.Cartographic['longitude'];
//   height: Cesium.Cartographic['height'];
// }
// export class Cartesian3Vals {
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
//     coord: Cartesian3Vals,
//     zone?: number | '',
//   ): Cartesian3Vals | number[] {
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
//   public fromCartographic(
//     nameCS: CRS,
//     cartographic: CartographicVals,
//     zone?: number | '',
//   ): CartographicVals {
//     zone = zone === '' ? zone : undefined;
//     return this.DEFS[nameCS].fromCartographic(cartographic, zone);
//   }

//   // Определения систем координат
//   private DEFS: {
//     [key: string]: {
//       units: string;
//       output: string[];
//       systemHeight: string;
//       fromCartographic(
//         coordinates?: CartographicVals | Cartesian3Vals,
//         zone?: number | '',
//       ): CartographicVals;
//       SRS(coordinates?: CartographicVals | Cartesian3Vals, zone?: number | ''): string;
//     };
//   } = {
//     'WGS-84': {
//       units: 'degrees',
//       output: ['B', 'L'],
//       systemHeight: 'высота над эллипсоидом WGS-84',
//       fromCartographic(cartographic: CartographicVals): CartographicVals {
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
//       fromCartographic(cartographic: CartographicVals, zone?: number | ''): CartographicVals {
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
//       SRS(coordinates: CartographicVals | Cartesian3Vals, zone?: number | ''): string {
//         if (zone === undefined) {
//           if (coordinates instanceof CartographicVals) {
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
//       fromCartographic(cartographic: CartographicVals): CartographicVals {
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
//       fromCartographic(cartographic: CartographicVals): CartographicVals {
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
