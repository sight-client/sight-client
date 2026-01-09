import * as Cesium from 'cesium';
import * as Humanify from '@/common/lib/humanify.lib';

export class degreesPosObj {
  lng: number; // longitude in degrees
  lat: number; // latitude in degrees
  alt: number; // height in meters
}

export function transformCartesianArrayToWGS84Array(
  cartesianArr: Array<Cesium.Cartesian3 | undefined>,
): Array<degreesPosObj | undefined> {
  let wgsArr: Array<degreesPosObj>;
  wgsArr = cartesianArr?.length ? cartesianArr.map((item) => transformCartesianToWGS84(item)) : [];
  return wgsArr;
}

export function getPosDistances(positions: Array<degreesPosObj | undefined>): string {
  let distance: number = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    const point1cartographic: Cesium.Cartographic = transformWGS84ToCartographic(positions[i]);
    const point2cartographic: Cesium.Cartographic = transformWGS84ToCartographic(positions[i + 1]);
    const geodesic: Cesium.EllipsoidGeodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s: number = geodesic.surfaceDistance;
    s = Math.sqrt(s ** 2 + (point2cartographic.height - point1cartographic.height) ** 2);
    distance += s;
  }
  return Humanify.distanceM(distance);
}

export function getPositionsArea(positions: Array<degreesPosObj | undefined>): string {
  if (positions?.length) {
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

function transformWGS84ToCartographic(wgsPosition: degreesPosObj | undefined): Cesium.Cartographic {
  const cartoPos: Cesium.Cartographic = wgsPosition
    ? Cesium.Cartographic.fromDegrees(wgsPosition.lng, wgsPosition.lat, wgsPosition.alt)
    : Cesium.Cartographic.ZERO;
  return cartoPos;
}

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
