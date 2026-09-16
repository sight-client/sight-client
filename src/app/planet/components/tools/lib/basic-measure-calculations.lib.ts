import * as Cesium from 'cesium';
import * as Humanify from '@/common/lib/humanify.lib';
import * as turf from '@turf/turf';

// --------------------------------------------------------------------------------------------------- //
export class degreesPosObj {
  lng: number; // longitude in degrees
  lat: number; // latitude in degrees
  alt: number; // height in meters
}
// Много где используется
export function transformCartesianArrayToWGS84Array(
  cartesianArr: Array<Cesium.Cartesian3 | undefined>,
): Array<degreesPosObj | undefined> {
  let wgsArr: Array<degreesPosObj>;
  wgsArr = cartesianArr?.length ? cartesianArr.map((item) => transformCartesianToWGS84(item)) : [];
  return wgsArr;
}
// --------------------------------------------------------------------------------------------------- //
// Блок связанных друг с другом функций.
// Используется в сервисах инструментов
// Получение длины суммы ОТРЕЗКОВ (с учетом высот - метод "calculatePosDistances" viewer.service.ts)
export function calculatePosDistances(positions: Array<Cesium.Cartesian3 | undefined>): string {
  if (!positions?.length) return Humanify.distanceM(0);
  const distance: number = calculatePosDistancesWhithoutHumanify(positions);
  return Humanify.distanceM(distance);
}

export function calculatePosDistancesWhithoutHumanify(
  positions: Array<Cesium.Cartesian3 | undefined>,
): number {
  let distance: number = 0;
  // let distanceTest: number = 0;
  if (!positions?.length) return 0;
  const WGS84Array = transformCartesianArrayToWGS84Array(positions);
  for (let i = 0; i < WGS84Array.length - 1; i++) {
    const p1Cartographic: Cesium.Cartographic = transformWGS84ToCartographic(WGS84Array[i]);
    const p2Cartographic: Cesium.Cartographic = transformWGS84ToCartographic(WGS84Array[i + 1]);
    const geodesic: Cesium.EllipsoidGeodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(p1Cartographic, p2Cartographic);
    let s: number = geodesic.surfaceDistance;
    s = Math.sqrt(s ** 2 + (p2Cartographic.height - p1Cartographic.height) ** 2);
    distance += s;
    // // Deprecated (for test now)
    // // Не учитывает эллипсоид (срезает дугу)
    // const p1Cartesian3: Cesium.Cartesian3 = Cesium.Cartographic.toCartesian(p1Cartographic);
    // const p2Cartesian3: Cesium.Cartesian3 = Cesium.Cartographic.toCartesian(p2Cartographic);
    // // Расстояние по гипотенузе.
    // distanceTest += Cesium.Cartesian3.distance(p1Cartesian3, p2Cartesian3);
  }
  // console.log('ellipse', distance);
  // console.log('line', distanceTest);
  return distance;
}

// Используется в main-сервисах инструментов
export function calculateAreaWithTurf(positions: Array<Cesium.Cartesian3>): string {
  let area = 0;
  if (positions?.length && positions.length > 2) {
    area = calculateAreaWithTurfWhithoutHumanify(positions);
  }
  return Humanify.areaKm(Math.abs(area));
}

// Расчет по эллипсоиду (не по рельефу)
export function calculateAreaWithTurfWhithoutHumanify(positions: Array<Cesium.Cartesian3>) {
  let area = 0;
  if (positions?.length && positions.length > 2) {
    // Перевод Cartesian3 в массив [Долгота, Широта] для Turf
    const coordinates = positions.map((position) => {
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      return [longitude, latitude];
    });
    // Замыкание контура полигона (первая и последняя точка должны совпадать)
    coordinates.push(coordinates[0]);
    // GeoJSON полигон для расчета площади с Turf
    const turfPolygon = turf.polygon([coordinates]);
    // Turf считает площадь на эллипсоиде WGS84 в квадратных метрах
    area = turf.area(turfPolygon);
  }
  return area || 0;
}

// Используется в сервисе
// Расчет по плоскости (без учета элипсоидности)
export function calculatePlaneArea(positions: Array<degreesPosObj | undefined>): string {
  if (positions?.length && positions.length > 2) {
    let h: number = 0;
    const ellipsoid: Cesium.Ellipsoid = Cesium.Ellipsoid.WGS84;
    positions.push(positions[0]);
    for (let i = 1; i < positions.length; i++) {
      const oel: Cesium.Cartesian3 = ellipsoid.cartographicToCartesian(
        transformWGS84ToCartographic(positions[i - 1]),
      );
      const el: Cesium.Cartesian3 = ellipsoid.cartographicToCartesian(
        transformWGS84ToCartographic(positions[i]),
      );
      h += oel.x * el.y - el.x * oel.y;
    }
    return Humanify.areaKm(Math.abs(h));
  } else return '';
}

export function transformWGS84ToCartographic(
  wgsPosition: degreesPosObj | undefined,
): Cesium.Cartographic {
  const cartoPos: Cesium.Cartographic = wgsPosition
    ? Cesium.Cartographic.fromDegrees(wgsPosition.lng, wgsPosition.lat, wgsPosition.alt)
    : Cesium.Cartographic.ZERO;
  return cartoPos;
}
// --------------------------------------------------------------------------------------------------- //
// Блок связанных друг с другом функций.
// Функции данного блока больше нигде не используются (даже в предшествующем проекте), перенесены, как legacy.

// Нигде не используется.
// Для определения координат курсора используется отдельный инструмент, отслеживающий mousmove на эллипсоиде.
// export function getCartesian3FromPX(
//   px: Cesium.Cartesian2,
//   _viewer: CustomViewer,
// ): Cesium.Cartesian3 | false | null {
//   if (_viewer && px) {
//     const picks: any[] = _viewer.scene.drillPick(px);
//     let cartesian: Cesium.Cartesian3 | undefined;
//     let isOn3dtiles: boolean = false;
//     let isOnTerrain: boolean = false;
//     // drillPick
//     picks.forEach((pick) => {
//       if (
//         pick?.primitive instanceof Cesium.Cesium3DTileFeature ||
//         pick?.primitive instanceof Cesium.Cesium3DTileset ||
//         pick?.primitive instanceof Cesium.Model
//       ) {
//         isOn3dtiles = true;
//       }
//       // 3dtilset
//       if (isOn3dtiles) {
//         _viewer.scene.pick(px); // (?) зачем? (?)
//         cartesian = _viewer.scene.pickPosition(px);
//         if (cartesian) {
//           const cartographic: Cesium.Cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//           if (cartographic.height < 0) cartographic.height = 0;
//           const lng = Cesium.Math.toDegrees(cartographic.longitude);
//           const lat = Cesium.Math.toDegrees(cartographic.latitude);
//           const { height } = cartographic;
//           const degreesPos: degreesPosObj = {
//             lng: lng,
//             lat: lat,
//             alt: height,
//           };
//           cartesian = transformWGS84ToCartesian(degreesPos);
//         }
//       }
//     });
//     const boolTerrain = _viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
//     // Terrain
//     if (!isOn3dtiles && !boolTerrain) {
//       const ray: Cesium.Ray | undefined = _viewer.scene.camera.getPickRay(px);
//       if (!ray) {
//         return null;
//       }
//       cartesian = _viewer.scene.globe.pick(ray, _viewer.scene);
//       isOnTerrain = true;
//     }
//     if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
//       cartesian = _viewer.scene.camera.pickEllipsoid(px, _viewer.scene.globe.ellipsoid);
//     }
//     if (cartesian) {
//       const position = transformCartesianToWGS84(cartesian);
//       if (!position) return false;
//       if (position.alt < 0) {
//         cartesian = transformWGS84ToCartesian(position, 0.1);
//       }
//       return cartesian;
//     }
//   }
//   return false;
// }

// Нигде не используется
// function transformWGS84ArrayToCartesianArray(
//   WSG84Arr: Array<degreesPosObj>,
//   alt?: number,
// ): Array<Cesium.Cartesian3 | undefined> {
//   let cartArr: Array<Cesium.Cartesian3 | undefined>;
//   cartArr = WSG84Arr ? WSG84Arr.map((item) => transformWGS84ToCartesian(item, alt)) : [];
//   return cartArr;
// }

// Используется только в данном блоке функций
// function transformWGS84ToCartesian(
//   position: degreesPosObj,
//   alt?: number | undefined,
// ): Cesium.Cartesian3 {
//   let pos: Cesium.Cartesian3;
//   if (position) {
//     pos = Cesium.Cartesian3.fromDegrees(
//       position.lng,,
//       position.lat,
//       (position.alt = alt || position.alt || 0),
//       Cesium.Ellipsoid.WGS84,
//     );
//   } else {
//     pos = Cesium.Cartesian3.ZERO; // уже готовый new Cesium.Cartesian3(0, 0, 0) - центр эллипсоида
//   }
//   //   pos = Cesium.Cartesian3.ZERO; // (?) раньше было без "else" - за фигурными скобками (?)
//   return pos;
// }

// Используется только в данном блоке функций и в transformCartesianArrayToWGS84Array(), которая вынесена отдельно (выше), так как многократно применяется вне блока
function transformCartesianToWGS84(position: Cesium.Cartesian3 | undefined): degreesPosObj {
  let wgsPoint: degreesPosObj;
  if (position) {
    const ellipsoid = Cesium.Ellipsoid.WGS84;
    if (position === undefined)
      throw new Error('Error whith position in transformCartesianToWGS84 fn');
    const cartographic: Cesium.Cartographic = ellipsoid.cartesianToCartographic(position);
    wgsPoint = {
      lng: Cesium.Math.toDegrees(cartographic.longitude),
      lat: Cesium.Math.toDegrees(cartographic.latitude),
      alt: cartographic.height,
    };
    return wgsPoint;
  } else throw new Error('Error whith geting position argument in transformCartesianToWGS84 fn!');
}
// --------------------------------------------------------------------------------------------------- //
