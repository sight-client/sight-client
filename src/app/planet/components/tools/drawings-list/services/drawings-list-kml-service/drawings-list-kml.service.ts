import { reportError } from '@global/lib/report-error.lib';
import { Injectable } from '@angular/core';
import * as Cesium from 'cesium';
import { cloneDeep } from 'lodash';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  booleanFromProperty as readBoolean,
  numberFromProperty as readNumber,
  stringFromProperty as readString,
  cartesian3ListFromProperty as readCartesian3List,
  cartesianFromProperty as readCartesian3,
  colorFromProperty as readColor,
  colorMaterialFromProperty as readColorMaterial,
  recordFromProperty as readRecord,
  cartesian2FromProperty as readCartesian2,
  nearFarFromProperty as readNearFar,
} from '@/components/tools/services/tools-service/tools.service';
import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  drawingToolsNames,
  isDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { isMeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { isCameraToolName } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
import { getMomentName, downloadBlob, uploadBlob } from '@global/lib/common-global.lib';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';

import { undefinedToJsonNull, jsonNullToUndefined } from '@global/lib/common-global.lib';
import DOMPurify from 'dompurify';

export class CustomPropsFromKml {
  // использовать только валидные для JSON-преобразований типы данных
  toolName: string;
  id: string;
  name: string | undefined;
  position: Cesium.Cartesian3 | undefined;
  show: boolean;
  properties?: { [key: string]: unknown };
  label?: {
    show?: boolean;
    text?: string;
    showBackground?: boolean;
    backgroundColor?: Cesium.Color;
    font?: string;
    translucencyByDistance?: Cesium.NearFarScalar;
    style?: number;
    pixelOffset?: Cesium.Cartesian2;
    eyeOffset?: Cesium.Cartesian3;
    horizontalOrigin?: number;
    verticalOrigin?: number;
    disableDepthTestDistance?: undefined | number | 'Infinity';
    heightReference?: number;
  };
  billboard?: {
    show?: boolean;
    image?: string;
    height?: number;
    width?: number;
    color?: Cesium.Color;
    scaleByDistance?: Cesium.NearFarScalar;
    pixelOffset?: Cesium.Cartesian2;
    eyeOffset?: Cesium.Cartesian3;
    horizontalOrigin?: number;
    verticalOrigin?: number;
    disableDepthTestDistance?: undefined | number | 'Infinity';
    heightReference?: number;
  };
  point?: {
    show?: boolean;
    pixelSize?: number;
    color?: Cesium.Color;
    outlineWidth?: number;
    outlineColor?: Cesium.Color;
    disableDepthTestDistance?: undefined | number | 'Infinity';
    heightReference?: number;
  };
  polyline?: {
    show?: boolean;
    positions: Array<Cesium.Cartesian3>;
    width?: number;
    material?: { color?: Cesium.Color }; // иные типы material присваивать в пособработке (для конкретных инструментов)
    clampToGround?: boolean;
  };
  polygon?: {
    show?: boolean;
    material?: { color?: Cesium.Color };
    hierarchy?: Cesium.PolygonHierarchy;
    perPositionHeight?: boolean;
  };
  ellipse?: {
    show?: boolean;
    semiMinorAxis?: number;
    semiMajorAxis?: number;
    rotation?: number;
    material?: { color?: Cesium.Color };
    outline?: boolean;
    outlineWidth?: number;
    outlineColor?: Cesium.Color;
    height?: number;
    heightReference?: number;
  };
  ellipsoid?: {
    show?: boolean;
    radii?: Cesium.Cartesian3;
    minimumCone?: number;
    maximumCone?: number;
    material?: { color?: Cesium.Color };
    outline?: boolean;
    outlineWidth?: number;
    outlineColor?: Cesium.Color;
    heightReference?: number;
  };
}

function colorFromParts(value: unknown, alphaDefault = 1): Cesium.Color | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('red' in value) || !('green' in value) || !('blue' in value)) return undefined;
  const { red, green, blue } = value;
  if (typeof red !== 'number' || typeof green !== 'number' || typeof blue !== 'number') {
    return undefined;
  }
  const alpha = 'alpha' in value && typeof value.alpha === 'number' ? value.alpha : alphaDefault;
  return new Cesium.Color(red, green, blue, alpha);
}

function cartesian2FromParts(value: unknown): Cesium.Cartesian2 | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('x' in value) || !('y' in value)) return undefined;
  const { x, y } = value;
  if (typeof x !== 'number' || typeof y !== 'number') return undefined;
  return new Cesium.Cartesian2(x, y);
}

function cartesian3FromParts(value: unknown): Cesium.Cartesian3 | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('x' in value) || !('y' in value) || !('z' in value)) return undefined;
  const { x, y, z } = value;
  if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') return undefined;
  return new Cesium.Cartesian3(x, y, z);
}

function nearFarFromParts(value: unknown): Cesium.NearFarScalar | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('near' in value) || !('nearValue' in value) || !('far' in value) || !('farValue' in value)) {
    return undefined;
  }
  const { near, nearValue, far, farValue } = value;
  if (
    typeof near !== 'number' ||
    typeof nearValue !== 'number' ||
    typeof far !== 'number' ||
    typeof farValue !== 'number'
  ) {
    return undefined;
  }
  return new Cesium.NearFarScalar(near, nearValue, far, farValue);
}

function readPolygonHierarchy(value: unknown): Cesium.PolygonHierarchy | undefined {
  return value instanceof Cesium.PolygonHierarchy ? value : undefined;
}

function readDepth(value: unknown): number | 'Infinity' | undefined {
  if (value === Infinity) return 'Infinity';
  return typeof value === 'number' ? value : undefined;
}

function customPropsFromParsed(value: unknown): CustomPropsFromKml | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('toolName' in value) || !('id' in value)) return undefined;
  if (typeof value.toolName !== 'string' || typeof value.id !== 'string') return undefined;
  return Object.assign(new CustomPropsFromKml(), value);
}

function kmlExportToBlob(
  result: Cesium.exportKmlResultKml | Cesium.exportKmlResultKmz,
  kmz: boolean,
  fnName: string,
): Blob {
  if (kmz) {
    if (!('kmz' in result) || !result.kmz) {
      throw new Error(`Invalid .kmz data in ${fnName} fn`);
    }
    return new Blob([result.kmz], { type: 'plain/text;charset=utf8' });
  }
  if (!('kml' in result) || !result.kml) {
    throw new Error(`Invalid .kml data in ${fnName} fn`);
  }
  return new Blob([result.kml], { type: 'plain/text;charset=utf8' });
}

// Запровайден в drawings-list.ts
@Injectable()
export class DrawingsListKmlService {
  declare private drawLayer: Cesium.DataSource;
  constructor(
    private $viewerService: ViewerService,
    private $toolsService: ToolsService,
    private $drawingService: DrawingService,
    private $drawingsListService: DrawingsListService,
  ) {
    const dataSource: Cesium.DataSource | undefined =
      this?.$viewerService.viewer.dataSources?.getByName(
        this.$drawingService.drawingToolsLayerName,
      )?.[0];
    if (dataSource) {
      this.drawLayer = dataSource;
    } else {
      console.info("Data source hasn't found in DrawingsListService");
    }
  }

  public async exportAllToKml(
    kmz: boolean = false,
    layer: Cesium.CustomDataSource | undefined = this?.drawLayer ||
      this?.$viewerService.viewer.dataSources?.getByName(
        this?.$drawingService?.drawingToolsLayerName,
      )?.[0],
  ): Promise<boolean> {
    if (layer === undefined || !(layer instanceof Cesium.CustomDataSource)) {
      console.info('Layer is not valid or undefined in exportAllToKml fn');
      return false;
    }

    let exportedCollection: Cesium.EntityCollection | Cesium.CompositeEntityCollection | undefined =
      undefined; // ссылка
    let validDrawingCollection: Cesium.EntityCollection | undefined = undefined; // создаваемая коллекция
    let compositeCollection: Cesium.CompositeEntityCollection | undefined = undefined; // создаваемая коллекция
    let modifiedExportedCollection:
      Cesium.EntityCollection | Cesium.CompositeEntityCollection | undefined = undefined; // создаваемая коллекция

    try {
      // Определение состава коллекции на экспорт
      if (layer?.entities?.values?.length) {
        validDrawingCollection = new Cesium.EntityCollection();
        for (const entity of layer.entities.values) {
          // Пропуск неготовых к экспорту / импорту сущностей инструментов
          // Сокращать список по обеспечению адекватного сохранения / восстановления таких типов сущностей
          validDrawingCollection.add(entity);
        }
      }
      const routeDataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(
          this.$drawingService.drawRouteLayerName,
        )?.[0];
      if (routeDataSource && routeDataSource?.entities?.values?.length) {
        const routeCollection = routeDataSource.entities;
        // При наличии и "Маршрута", и других
        if (validDrawingCollection?.values?.length && routeCollection?.values?.length) {
          compositeCollection = new Cesium.CompositeEntityCollection([
            validDrawingCollection,
            routeCollection,
          ]);
          exportedCollection = compositeCollection;
        }
        // В случае наличия только сущностей "Маршрута"
        if (!validDrawingCollection?.values?.length && routeCollection?.values?.length) {
          exportedCollection = routeCollection;
        }
        // Для всех сущностей, кроме "Маршрута"
      } else {
        if (validDrawingCollection?.values?.length) {
          exportedCollection = validDrawingCollection;
        }
      }
      if (!exportedCollection?.values?.length) {
        alert('Сущностей для экспорта не обнаружено');
        console.info('Nothing to export');
        return false;
      }

      // Резервная проверка на "мусорные" сущности (обязательная очистка - в импорте), не выявленные при возможном предварительном импорте из .kml (для сценария пересохранения).
      // Применяется только в отношение сущностей инструментов "Ока" (имеющих entity.toolName). Сторонние kml-сущности экспортируются, как есть.
      let trashEntities: Array<Cesium.Entity> = [];
      const trashIds: Array<string> = [];
      for (const entity of exportedCollection.values) {
        const toolBaseProps = this.getGroupIdAndToolName(entity?.id);
        if (!toolBaseProps || !entity?.toolName) {
          if (entity?._children?.length) {
            trashEntities = trashEntities.concat(entity._children);
            entity._children = []; // entity._children = undefined даст ошибку при Cesium.exportKml()
          }
        }
      }
      if (trashEntities.length) {
        for (const entity of trashEntities) {
          trashIds.push(entity?.id);
        }
      }

      // Запись в entity.description необходимых для будущего импорта параметров
      modifiedExportedCollection = new Cesium.EntityCollection();
      for (const entity of exportedCollection.values) {
        const toolBaseProps = this.getGroupIdAndToolName(entity?.id);
        if (!toolBaseProps || !entity?.toolName) {
          // Добавление в экспорт без подготовки entity.description
          modifiedExportedCollection.add(entity);
          continue;
        } else {
          // Пропуск "мусорных" сущностей (наличие toolName характеризует предшествующий импорт, как сущностей "Ока")
          if (trashIds.includes(entity?.id)) continue;
          const updatedEntity = this.setEntityDescriptionForExport(entity, toolBaseProps.toolName);
          if (!updatedEntity) {
            modifiedExportedCollection.add(entity);
          } else {
            modifiedExportedCollection.add(updatedEntity);
          }
        }
      }

      // Экспорт в файл
      const newExport: Cesium.exportKmlResultKml | Cesium.exportKmlResultKmz =
        await Cesium.exportKml({
          entities: modifiedExportedCollection,
          kmz: kmz,
        });
      let blobData: Blob;
      let momentName: string;
      blobData = kmlExportToBlob(newExport, kmz, 'exportAllToKml');
      momentName = getMomentName('sight-export-all-layers', kmz ? 'kmz' : 'kml');
      downloadBlob(momentName, blobData);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  public async exportToolToKml(
    toolName: DrawingToolName,
    kmz: boolean = false,
    layer: Cesium.CustomDataSource | undefined = this?.drawLayer ||
      this?.$viewerService.viewer.dataSources?.getByName(
        this?.$drawingService?.drawingToolsLayerName,
      )?.[0],
  ): Promise<boolean> {
    try {
      if (!toolName) throw new Error('Tool name is undefined in exportToolToKml fn');
      // Сокращать список по обеспечению адекватного сохранения / восстановления таких типов сущностей
      if (layer === undefined || !(layer instanceof Cesium.CustomDataSource)) {
        throw new Error('Layer is not valid or undefined in exportToolToKml fn');
      }
      if (!isDrawingToolName(toolName)) {
        alert(
          'Имя инструмента не определено. Сущности, будут экспортированы без привязки к функциональности ГИП "Око"',
        );
        return this.exportOversToKml(kmz); // без к/л преобразований
      }
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
    let exportedCollection: Cesium.EntityCollection = new Cesium.EntityCollection();
    try {
      const allEntitiesOnLayer: Array<Cesium.Entity | undefined> = layer?.entities?.values;
      if (!allEntitiesOnLayer?.length) {
        alert('Сущностей для экспорта не обнаружено');
        console.info('Nothing to export');
        return false;
      }

      // Резервная проверка на "мусорные" сущности (обязательная очистка - в импорте), не выявленные при возможном предварительном импорте из .kml (для сценария пересохранения).
      // Применяется только в отношение сущностей инструментов "Ока" (имеющих entity.toolName). Сторонние kml-сущности экспортируются, как есть (в this.exportOversToKml() или this.exportAllToKml()).
      let trashEntities: Array<Cesium.Entity> = [];
      const trashIds: Array<string> = [];
      for (const entity of allEntitiesOnLayer) {
        if (entity?._children?.length) {
          trashEntities = trashEntities.concat(entity._children);
          entity._children = [];
        }
      }
      if (trashEntities.length) {
        for (const entity of trashEntities) {
          trashIds.push(entity?.id);
        }
        // console.log(trashEntities, trashIds);
      }

      for (const entity of allEntitiesOnLayer) {
        if (!entity || !(entity instanceof Cesium.Entity) || trashIds.includes(entity?.id)) {
          continue;
        }
        if (
          entity?.toolName === toolName &&
          entity?.id.includes(toolName) &&
          entity.toolName !== undefined &&
          isDrawingToolName(entity.toolName)
        ) {
          const updatedEntity = this.setEntityDescriptionForExport(entity, entity.toolName);
          if (!updatedEntity) {
            exportedCollection.add(entity);
          } else {
            exportedCollection.add(updatedEntity);
          }
        }
      }
      if (!exportedCollection?.values?.length) {
        throw new Error('Empty exportedCollection in exportToolToKml fn');
      }
      /*
      Notice: Cesium будет записывать в .kml-файл только те сущности, у которых имеется хотя бы одна из составляющих: Point, Billboard, Model, Path, Polygon, Polyline.
      Для остальных составляющих можно использовать хук c "this.setEntityDescriptionForExport" и "this.prepareKmlEntities", 
      но в других ГИСах он бесполезен, так как не формат, а кастомная надстройка.
      Из спецификации:
      "Exports an EntityCollection as a KML document. Only Point, Billboard, Model, Path, Polygon, Polyline geometries 
      will be exported. Note that there is not a 1 to 1 mapping of Entity properties to KML Feature properties. 
      For example, entity properties that are time"
       */
      const newExport: Cesium.exportKmlResultKml | Cesium.exportKmlResultKmz =
        await Cesium.exportKml({
          entities: exportedCollection,
          kmz: kmz,
        });
      let blobData: Blob;
      let momentName: string;
      blobData = kmlExportToBlob(newExport, kmz, 'exportToolToKml');
      momentName = getMomentName(`sight-export-${toolName}-layer`, kmz ? 'kmz' : 'kml');
      downloadBlob(momentName, blobData);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // Сохранение в entity.description необходимых для возможного последующего импорта параметров, которые могут "потеряться" при экспорте
  private setEntityDescriptionForExport(
    entity: Cesium.Entity,
    toolName: DrawingToolName,
  ): Cesium.Entity | undefined {
    try {
      if (!entity || !(entity instanceof Cesium.Entity)) {
        throw new Error('Invalid entity in setEntityDescriptionForExport fn');
      }
      if (entity?.description) {
        console.info(
          "Entity's description already exists and will be rewrite (by setEntityDescriptionForExport fn)",
        );
        // return undefined;
      }
      if (!toolName || !drawingToolsNames.includes(toolName)) {
        console.info("Ivalid entity's toolName in setEntityDescriptionForExport fn");
        return undefined;
      }
      // Общие для всех сущностей параметры
      const customProps: CustomPropsFromKml = {
        toolName: toolName,
        id: entity.id,
        name: entity.name,
        position: readCartesian3(entity.position?.getValue()),
        show: entity.show,
      };
      if (entity.properties) customProps.properties = readRecord(entity.properties.getValue());
      if (entity.label) {
        customProps.label = {
          show: readBoolean(entity.label.show?.getValue()),
          text: readString(entity.label.text?.getValue()),
          showBackground: readBoolean(entity.label.showBackground?.getValue()),
          backgroundColor: readColor(entity.label.backgroundColor?.getValue()),
          font: readString(entity.label.font?.getValue()),
          translucencyByDistance: readNearFar(entity.label.translucencyByDistance?.getValue()),
          style: readNumber(entity.label.style?.getValue()),
          pixelOffset: readCartesian2(entity.label.pixelOffset?.getValue()),
          eyeOffset: readCartesian3(entity.label.eyeOffset?.getValue()),
          horizontalOrigin: readNumber(entity.label.horizontalOrigin?.getValue()),
          verticalOrigin: readNumber(entity.label.verticalOrigin?.getValue()),
          // JSON.stringify(Infinity) === null
          disableDepthTestDistance: readDepth(entity.label.disableDepthTestDistance?.getValue()),
          heightReference: readNumber(entity.label.heightReference?.getValue()),
        };
      }
      if (entity.billboard) {
        customProps.billboard = {
          show: readBoolean(entity.billboard.show?.getValue()),
          image: readString(entity.billboard.image?.getValue()),
          height: readNumber(entity.billboard.height?.getValue()),
          width: readNumber(entity.billboard.width?.getValue()),
          color: readColor(entity.billboard.color?.getValue()),
          pixelOffset: readCartesian2(entity.billboard.pixelOffset?.getValue()),
          eyeOffset: readCartesian3(entity.billboard.eyeOffset?.getValue()),
          scaleByDistance: readNearFar(entity.billboard.scaleByDistance?.getValue()),
          horizontalOrigin: readNumber(entity.billboard.horizontalOrigin?.getValue()),
          verticalOrigin: readNumber(entity.billboard.verticalOrigin?.getValue()),
          disableDepthTestDistance: readDepth(
            entity.billboard.disableDepthTestDistance?.getValue(),
          ),
          heightReference: readNumber(entity.billboard.heightReference?.getValue()),
        };
      }
      if (entity.point) {
        customProps.point = {
          show: readBoolean(entity.point.show?.getValue()),
          pixelSize: readNumber(entity.point.pixelSize?.getValue()),
          color: readColor(entity.point.color?.getValue()),
          outlineWidth: readNumber(entity.point.outlineWidth?.getValue()),
          outlineColor: readColor(entity.point.outlineColor?.getValue()),
          disableDepthTestDistance: readDepth(entity.point.disableDepthTestDistance?.getValue()),
          heightReference: readNumber(entity.point.heightReference?.getValue()),
        };
      }
      if (entity.polyline) {
        customProps.polyline = {
          show: readBoolean(entity.polyline.show?.getValue()),
          positions: readCartesian3List(entity.polyline.positions?.getValue()),
          width: readNumber(entity.polyline.width?.getValue()),
          material: readColorMaterial(entity.polyline.material?.getValue()),
          clampToGround: readBoolean(entity.polyline.clampToGround?.getValue()),
        };
      }
      if (entity.polygon) {
        const hierarchy = readPolygonHierarchy(entity.polygon.hierarchy?.getValue());
        customProps.polygon = {
          show: readBoolean(entity.polygon.show?.getValue()),
          material: readColorMaterial(entity.polygon.material?.getValue()),
          hierarchy,
          perPositionHeight: readBoolean(entity.polygon.perPositionHeight?.getValue()),
        };
      }
      if (entity.ellipse) {
        customProps.ellipse = {
          show: readBoolean(entity.ellipse.show?.getValue()),
          semiMinorAxis: readNumber(entity.ellipse.semiMinorAxis?.getValue()),
          semiMajorAxis: readNumber(entity.ellipse.semiMajorAxis?.getValue()),
          rotation: readNumber(entity.ellipse.rotation?.getValue()),
          material: readColorMaterial(entity.ellipse.material?.getValue()),
          outline: readBoolean(entity.ellipse.outline?.getValue()),
          outlineWidth: readNumber(entity.ellipse.outlineWidth?.getValue()),
          outlineColor: readColor(entity.ellipse.outlineColor?.getValue()),
          height: readNumber(entity.ellipse.height?.getValue()),
          heightReference: readNumber(entity.ellipse.heightReference?.getValue()),
        };
      }
      if (entity.ellipsoid) {
        customProps.ellipsoid = {
          show: readBoolean(entity.ellipsoid.show?.getValue()),
          radii: readCartesian3(entity.ellipsoid.radii?.getValue()),
          minimumCone: readNumber(entity.ellipsoid.minimumCone?.getValue()),
          maximumCone: readNumber(entity.ellipsoid.maximumCone?.getValue()),
          material: readColorMaterial(entity.ellipsoid.material?.getValue()),
          outline: readBoolean(entity.ellipsoid.outline?.getValue()),
          outlineWidth: readNumber(entity.ellipsoid.outlineWidth?.getValue()),
          outlineColor: readColor(entity.ellipsoid.outlineColor?.getValue()),
          heightReference: readNumber(entity.ellipsoid.heightReference?.getValue()),
        };
      }

      // Правки для конкретных типов инструментов
      // if (toolName === 'drawMark') {
      // } else if (toolName === 'drawLine') {
      // } else if (toolName === 'drawRectangle') {
      // } else if (toolName === 'drawCircle') {
      // } else if (toolName === 'drawPolygon') {
      // }
      // else if (toolName === YOUR_TOOL) {}

      // console.log(customProps);
      const customPropsCopy = cloneDeep(customProps);
      const nullInsteadUndefinedProps = undefinedToJsonNull(customPropsCopy);
      // console.log(nullInsteadUndefinedProps);
      const stringifiedProps = JSON.stringify(nullInsteadUndefinedProps);
      entity.description = new Cesium.ConstantProperty(stringifiedProps);
      // console.log(entity.description.getValue());
      return entity;
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  public async exportOversToKml(
    kmz: boolean = false,
    layer: Cesium.CustomDataSource | undefined = this?.drawLayer ||
      this?.$viewerService.viewer.dataSources?.getByName(
        this?.$drawingService?.drawingToolsLayerName,
      )?.[0],
  ): Promise<boolean> {
    try {
      if (layer === undefined || !(layer instanceof Cesium.CustomDataSource)) {
        throw new Error('Layer is not valid or undefined in exportOversToKml fn');
      }
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
    let exportedCollection: Cesium.EntityCollection = new Cesium.EntityCollection();
    try {
      const allEntitiesOnLayer: Array<Cesium.Entity | undefined> = layer?.entities?.values;
      if (!allEntitiesOnLayer?.length) {
        alert('Сущностей для экспорта не обнаружено');
        return false;
      }
      for (const entity of allEntitiesOnLayer) {
        // Пропуск сущностей "Ока" (они экспортируются адресно в собственном меню, либо в this.exportToKml())
        if (entity?.toolName) {
          continue;
        } else {
          let isToolEntity: boolean = false;
          for (const toolName of drawingToolsNames) {
            if (entity?.id?.includes(toolName)) {
              isToolEntity = true;
              break;
            }
          }
          if (isToolEntity === true) {
            continue;
          } else {
            if (entity) exportedCollection.add(entity);
          }
        }
      }
      if (!exportedCollection?.values?.length) {
        throw new Error("Entities haven't found in exportOversToKml fn");
      }
      const newExport: Cesium.exportKmlResultKml | Cesium.exportKmlResultKmz =
        await Cesium.exportKml({
          entities: exportedCollection,
          kmz: kmz,
        });
      let blobData: Blob;
      let momentName: string;
      blobData = kmlExportToBlob(newExport, kmz, 'exportOversToKml');
      momentName = getMomentName('sight-export-overs-layer', kmz ? 'kmz' : 'kml');
      downloadBlob(momentName, blobData);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  public async importAllFromKmlOrKmz(event: Event): Promise<boolean> {
    try {
      if (
        !this.drawLayer ||
        !this?.$viewerService.viewer.dataSources?.getByName(
          this?.$drawingService?.drawingToolsLayerName,
        )?.[0]
      ) {
        throw new Error('DrawLayer is not defined in importAllFromKml fn');
      }
      if (
        !this?.$viewerService.viewer.dataSources?.getByName(
          this?.$drawingService?.drawRouteLayerName,
        )?.[0]
      ) {
        throw new Error('RouteLayer is not defined in importAllFromKml fn');
      }
      const inputEl = event.target;
      if (!(inputEl instanceof HTMLInputElement)) {
        throw new Error('Import input is not an HTMLInputElement in importAllFromKml fn');
      }
      const file = uploadBlob(event);
      const reader = new FileReader();
      reader.onload = async () => {
        let newDataSource: Cesium.KmlDataSource | undefined;
        try {
          const content = reader.result; // DataURL (после reader.readAsDataURL(file))
          if (!content || typeof content !== 'string') {
            throw new Error('No imported .kml (string XML data) in importAllFromKml fn');
          }
          newDataSource = await Cesium.KmlDataSource.load(content, {
            // sourceUri: `https://${location.hostname}:${location.port}`,
            camera: this.$viewerService.viewer.scene.camera,
            canvas: this.$viewerService.viewer.scene.canvas,
            clampToGround: false,
          });
          if (newDataSource?.entities?.values) {
            const clearedEntities = this.removeKmlChildren(newDataSource);
            if (clearedEntities) {
              const parsedEntities = this.prepareKmlEntities(clearedEntities);
              if (parsedEntities) {
                this.sortAndDrawKmlEntities(parsedEntities);
              } else {
                console.info('Error on parsing entities in importAllFromKml fn');
                // Уже может быть частично мутирован (при к/л положительных результатах перебора)
                this.sortAndDrawKmlEntities(clearedEntities);
              }
            } else {
              console.info('Error on clearing entities in importAllFromKml fn');
              this.sortAndDrawKmlEntities(newDataSource.entities.values);
            }
          } else {
            alert('В импорте сущностей к отображению не обнаружено');
            throw new Error(
              'No entities in newDataSource in sortAndDrimportAllFromKmlawKmlEntities fn',
            );
          }
          // console.log(this.$drawingService.drawLineEntitiesList());
        } catch (error: unknown) {
          reportError(error);
        } finally {
          inputEl.value = '';
          if (newDataSource && newDataSource instanceof Cesium.KmlDataSource) {
            newDataSource.destroy();
          }
        }
      };
      reader.readAsDataURL(file);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // При импорте из .kml автоматически образуются сущности, пытающиеся воспроизвести к/л геометрию.
  // В нашем случае, при "восстановлении" сценария работы инструмента их требуется удалить, как лишние
  private removeKmlChildren(newDataSource: Cesium.KmlDataSource): Array<Cesium.Entity> | undefined {
    try {
      const entities = newDataSource?.entities?.values;
      if (!entities?.length) {
        throw new Error('No entities for parsing in removeKmlChildren fn');
      }
      let entitiesToRemove: Array<Cesium.Entity> = [];
      for (const entity of entities) {
        if (entity?._children?.length) {
          entitiesToRemove = entitiesToRemove.concat(entity._children);
          entity._children = [];
        }
      }
      if (entitiesToRemove.length) {
        for (const entity of entitiesToRemove) {
          // const id = entity.id;
          const isRemoved = newDataSource.entities.removeById(entity.id);
          // console.log('Removed: ', id);
        }
      }
      return entities;
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  private readonly htmlParser = new DOMParser();

  private sanitizeImportedKmlString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const clean = DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (/javascript:/i.test(clean) || /^\s*data:text\/html/i.test(clean)) return '';
    return clean;
  }

  private prepareKmlEntities(entities: Array<Cesium.Entity>): Array<Cesium.Entity> | undefined {
    try {
      if (!entities?.length) {
        throw new Error('No entities for parsing in prepareKmlEntities fn');
      }
      for (const entity of entities) {
        // Проверка на принадлежность к "Око"
        const toolBaseProps = this.getGroupIdAndToolName(entity?.id);
        if (!toolBaseProps) continue;

        // При экспорте в .kml свойство entity.description "зашивается" в html-строку (для стандартного Cesium Infobox)
        const htmlString = readString(entity?.description?.getValue());
        if (!htmlString) {
          console.info('Entity without description');
          continue;
        }
        const doc = this.htmlParser?.parseFromString(htmlString, 'text/html');
        if (!doc) {
          console.info(
            `Invalid value of .kml-entity's description tag in prepareKmlEntities fn: ${htmlString}`,
          );
          continue;
        }
        const description: unknown = doc?.querySelector(
          '.cesium-infoBox-description-lighter',
        )?.textContent;
        if (!description) {
          console.info(`Invalid JSON to parse in prepareKmlEntities fn: ${description}`);
          continue;
        } else if (typeof description === 'string') {
          let parsedProps: unknown;
          try {
            parsedProps = JSON.parse(description);
          } catch (error: unknown) {
            reportError(error);
            continue;
          }
          const customProps = customPropsFromParsed(jsonNullToUndefined(parsedProps));
          if (!customProps) {
            console.info(`Invalid parsed customProps in prepareKmlEntities fn: ${customProps}`);
            continue;
          }
          // console.log('New parsed props: ', customProps);
          // ------------------------------------------------------------------------ //
          const restoredToolName = customProps.toolName;
          if (
            restoredToolName &&
            (isDrawingToolName(restoredToolName) ||
              isMeasuringToolName(restoredToolName) ||
              isCameraToolName(restoredToolName))
          ) {
            entity.toolName = restoredToolName;
          }
          if (!entity.id) entity.id = customProps.id;
          entity.name = this.sanitizeImportedKmlString(customProps.name);
          const position = cartesian3FromParts(customProps.position);
          if (position) entity.position = new Cesium.ConstantPositionProperty(position);
          if (typeof customProps.show === 'boolean') entity.show = customProps.show;
          // ------------------------------------------------------------------------ //
          if (customProps.properties !== undefined)
            entity.properties = new Cesium.PropertyBag(customProps.properties);
          // ------------------------------------------------------------------------ //
          if (customProps.label) {
            const label = entity.label ?? new Cesium.LabelGraphics();
            entity.label = label;
            if (typeof customProps.label.show === 'boolean')
              label.show = new Cesium.ConstantProperty(customProps.label.show);
            if (typeof customProps.label.text === 'string')
              label.text = new Cesium.ConstantProperty(customProps.label.text);
            if (typeof customProps.label.showBackground === 'boolean')
              label.showBackground = new Cesium.ConstantProperty(
                customProps.label.showBackground,
              );
            const labelBackground = colorFromParts(customProps.label.backgroundColor);
            if (labelBackground) {
              label.backgroundColor = new Cesium.ConstantProperty(labelBackground);
            }
            if (typeof customProps.label.font === 'string')
              label.font = new Cesium.ConstantProperty(customProps.label.font);
            const labelDistance = nearFarFromParts(customProps.label.translucencyByDistance);
            if (labelDistance) {
              label.translucencyByDistance = new Cesium.ConstantProperty(labelDistance);
            }
            const labelPixelOffset = cartesian2FromParts(customProps.label.pixelOffset);
            if (labelPixelOffset) {
              label.pixelOffset = new Cesium.ConstantProperty(labelPixelOffset);
            }
            const labelEyeOffset = cartesian3FromParts(customProps.label.eyeOffset);
            if (labelEyeOffset) {
              label.eyeOffset = new Cesium.ConstantProperty(labelEyeOffset);
            }
            if (typeof customProps.label.style === 'number')
              label.style = new Cesium.ConstantProperty(customProps.label.style);
            if (typeof customProps.label.horizontalOrigin === 'number') {
              label.horizontalOrigin = new Cesium.ConstantProperty(
                customProps.label.horizontalOrigin,
              );
            }
            if (typeof customProps.label.verticalOrigin === 'number')
              label.verticalOrigin = new Cesium.ConstantProperty(
                customProps.label.verticalOrigin,
              );
            if (
              customProps.label.disableDepthTestDistance === 'Infinity' ||
              customProps.label.disableDepthTestDistance === undefined ||
              typeof customProps.label.disableDepthTestDistance === 'number'
            ) {
              if (customProps.label.disableDepthTestDistance === 'Infinity') {
                label.disableDepthTestDistance = new Cesium.ConstantProperty(
                  Number.POSITIVE_INFINITY,
                );
              } else {
                label.disableDepthTestDistance = new Cesium.ConstantProperty(
                  customProps.label.disableDepthTestDistance,
                );
              }
            }
            if (typeof customProps.label.heightReference === 'number')
              label.heightReference = new Cesium.ConstantProperty(
                customProps.label.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.billboard) {
            const billboard = entity.billboard ?? new Cesium.BillboardGraphics();
            entity.billboard = billboard;
            if (typeof customProps.billboard.show === 'boolean')
              billboard.show = new Cesium.ConstantProperty(customProps.billboard.show);
            if (customProps.billboard.image !== undefined) {
              const image = this.sanitizeImportedKmlString(customProps.billboard.image);
              if (image)
                billboard.image = new Cesium.ConstantProperty(image);
            }
            if (typeof customProps.billboard.height === 'number')
              billboard.height = new Cesium.ConstantProperty(customProps.billboard.height);
            if (typeof customProps.billboard.width === 'number')
              billboard.width = new Cesium.ConstantProperty(customProps.billboard.width);
            const billboardColor = colorFromParts(customProps.billboard.color);
            if (billboardColor) {
              billboard.color = new Cesium.ConstantProperty(billboardColor);
            }
            const billboardDistance = nearFarFromParts(customProps.billboard.scaleByDistance);
            if (billboardDistance) {
              billboard.scaleByDistance = new Cesium.ConstantProperty(billboardDistance);
            }
            const billboardPixelOffset = cartesian2FromParts(customProps.billboard.pixelOffset);
            if (billboardPixelOffset) {
              billboard.pixelOffset = new Cesium.ConstantProperty(billboardPixelOffset);
            }
            const billboardEyeOffset = cartesian3FromParts(customProps.billboard.eyeOffset);
            if (billboardEyeOffset) {
              billboard.eyeOffset = new Cesium.ConstantProperty(billboardEyeOffset);
            }
            if (typeof customProps.billboard.horizontalOrigin === 'number')
              billboard.horizontalOrigin = new Cesium.ConstantProperty(
                customProps.billboard.horizontalOrigin,
              );
            if (typeof customProps.billboard.verticalOrigin === 'number')
              billboard.verticalOrigin = new Cesium.ConstantProperty(
                customProps.billboard.verticalOrigin,
              );
            if (
              customProps.billboard.disableDepthTestDistance === 'Infinity' ||
              customProps.billboard.disableDepthTestDistance === undefined ||
              typeof customProps.billboard.disableDepthTestDistance === 'number'
            ) {
              if (customProps.billboard.disableDepthTestDistance === 'Infinity') {
                billboard.disableDepthTestDistance = new Cesium.ConstantProperty(
                  Number.POSITIVE_INFINITY,
                );
              } else {
                billboard.disableDepthTestDistance = new Cesium.ConstantProperty(
                  customProps.billboard.disableDepthTestDistance,
                );
              }
            }
            if (typeof customProps.billboard.heightReference === 'number')
              billboard.heightReference = new Cesium.ConstantProperty(
                customProps.billboard.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.point) {
            const point = entity.point ?? new Cesium.PointGraphics();
            entity.point = point;
            if (typeof customProps.point.show === 'boolean')
              point.show = new Cesium.ConstantProperty(customProps.point.show);
            if (typeof customProps.point.pixelSize === 'number')
              point.pixelSize = new Cesium.ConstantProperty(customProps.point.pixelSize);
            const pointColor = colorFromParts(customProps.point.color);
            if (pointColor) point.color = new Cesium.ConstantProperty(pointColor);
            if (typeof customProps.point.outlineWidth === 'number')
              point.outlineWidth = new Cesium.ConstantProperty(
                customProps.point.outlineWidth,
              );
            const pointOutline = colorFromParts(customProps.point.outlineColor);
            if (pointOutline) point.outlineColor = new Cesium.ConstantProperty(pointOutline);
            if (
              customProps.point.disableDepthTestDistance === 'Infinity' ||
              customProps.point.disableDepthTestDistance === undefined ||
              typeof customProps.point.disableDepthTestDistance === 'number'
            ) {
              if (customProps.point.disableDepthTestDistance === 'Infinity') {
                point.disableDepthTestDistance = new Cesium.ConstantProperty(
                  Number.POSITIVE_INFINITY,
                );
              } else {
                point.disableDepthTestDistance = new Cesium.ConstantProperty(
                  customProps.point.disableDepthTestDistance,
                );
              }
            }
            if (typeof customProps.point.heightReference === 'number')
              point.heightReference = new Cesium.ConstantProperty(
                customProps.point.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.polyline) {
            const polyline = entity.polyline ?? new Cesium.PolylineGraphics();
            entity.polyline = polyline;
            if (typeof customProps.polyline.show === 'boolean')
              polyline.show = new Cesium.ConstantProperty(customProps.polyline.show);
            if (
              customProps.polyline.positions !== undefined &&
              customProps.polyline.positions?.length
            ) {
              const cartesianArr: Array<Cesium.Cartesian3> = [];
              for (const item of customProps.polyline.positions) {
                const point = cartesian3FromParts(item);
                if (point) cartesianArr.push(point);
              }
              if (cartesianArr.length)
                polyline.positions = new Cesium.ConstantProperty(cartesianArr);
            }
            if (typeof customProps.polyline.width === 'number')
              polyline.width = new Cesium.ConstantProperty(customProps.polyline.width);
            if (customProps.polyline.material !== undefined) {
              const polylineColor = colorFromParts(customProps.polyline.material.color);
              if (polylineColor) {
                // просто цвет (иначе внести правки, характерные для конкретного инструмента, ниже, после определения стандартных свойств)
                polyline.material = new Cesium.ColorMaterialProperty(polylineColor);
              }
            }
            if (typeof customProps.polyline.clampToGround === 'boolean')
              polyline.clampToGround = new Cesium.ConstantProperty(
                customProps.polyline.clampToGround,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.polygon) {
            const polygon = entity.polygon ?? new Cesium.PolygonGraphics();
            entity.polygon = polygon;
            if (typeof customProps.polygon.show === 'boolean')
              polygon.show = new Cesium.ConstantProperty(customProps.polygon.show);
            if (customProps.polygon.material !== undefined) {
              const polygonColor = colorFromParts(customProps.polygon.material.color, 0.1);
              if (polygonColor) {
                polygon.material = new Cesium.ColorMaterialProperty(polygonColor);
              }
            }
            if (
              customProps.polygon.hierarchy?.positions !== undefined &&
              customProps.polygon.hierarchy.positions?.length
            ) {
              const cartesianArr: Array<Cesium.Cartesian3> = [];
              for (const item of customProps.polygon.hierarchy.positions) {
                const point = cartesian3FromParts(item);
                if (point) cartesianArr.push(point);
              }
              if (cartesianArr.length)
                polygon.hierarchy = new Cesium.ConstantProperty(
                  new Cesium.PolygonHierarchy(cartesianArr),
                );
            }
            if (typeof customProps.polygon.perPositionHeight === 'boolean')
              polygon.perPositionHeight = new Cesium.ConstantProperty(
                customProps.polygon.perPositionHeight,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.ellipse) {
            const ellipse = entity.ellipse ?? new Cesium.EllipseGraphics();
            entity.ellipse = ellipse;
            if (typeof customProps.ellipse.show === 'boolean')
              ellipse.show = new Cesium.ConstantProperty(customProps.ellipse.show);
            if (typeof customProps.ellipse.semiMinorAxis === 'number')
              ellipse.semiMinorAxis = new Cesium.ConstantProperty(
                customProps.ellipse.semiMinorAxis,
              );
            if (typeof customProps.ellipse.semiMajorAxis === 'number')
              ellipse.semiMajorAxis = new Cesium.ConstantProperty(
                customProps.ellipse.semiMajorAxis,
              );
            if (typeof customProps.ellipse.rotation === 'number')
              ellipse.rotation = new Cesium.ConstantProperty(customProps.ellipse.rotation);
            const ellipseColor = colorFromParts(customProps.ellipse.material?.color);
            if (ellipseColor) {
              ellipse.material = new Cesium.ColorMaterialProperty(ellipseColor);
            }
            if (typeof customProps.ellipse.outline === 'boolean')
              ellipse.outline = new Cesium.ConstantProperty(customProps.ellipse.outline);
            if (typeof customProps.ellipse.outlineWidth === 'number')
              ellipse.outlineWidth = new Cesium.ConstantProperty(
                customProps.ellipse.outlineWidth,
              );
            const ellipseOutline = colorFromParts(customProps.ellipse.outlineColor);
            if (ellipseOutline) {
              ellipse.outlineColor = new Cesium.ConstantProperty(ellipseOutline);
            }
            if (typeof customProps.ellipse.height === 'number')
              ellipse.height = new Cesium.ConstantProperty(customProps.ellipse.height);
            if (typeof customProps.ellipse.heightReference === 'number')
              ellipse.heightReference = new Cesium.ConstantProperty(
                customProps.ellipse.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.ellipsoid) {
            const ellipsoid = entity.ellipsoid ?? new Cesium.EllipsoidGraphics();
            entity.ellipsoid = ellipsoid;
            if (typeof customProps.ellipsoid.show === 'boolean')
              ellipsoid.show = new Cesium.ConstantProperty(customProps.ellipsoid.show);
            const radii = cartesian3FromParts(customProps.ellipsoid.radii);
            if (radii) ellipsoid.radii = new Cesium.ConstantProperty(radii);
            if (typeof customProps.ellipsoid.minimumCone === 'number')
              ellipsoid.minimumCone = new Cesium.ConstantProperty(
                customProps.ellipsoid.minimumCone,
              );
            if (typeof customProps.ellipsoid.maximumCone === 'number')
              ellipsoid.maximumCone = new Cesium.ConstantProperty(
                customProps.ellipsoid.maximumCone,
              );
            const ellipsoidColor = colorFromParts(customProps.ellipsoid.material?.color);
            if (ellipsoidColor) {
              // просто цвет (иначе внести правки, характерные для конкретного инструмента, ниже, после определения стандартных свойств)
              ellipsoid.material = new Cesium.ColorMaterialProperty(ellipsoidColor);
            }
            if (typeof customProps.ellipsoid.outline === 'boolean')
              ellipsoid.outline = new Cesium.ConstantProperty(
                customProps.ellipsoid.outline,
              );
            if (typeof customProps.ellipsoid.outlineWidth === 'number')
              ellipsoid.outlineWidth = new Cesium.ConstantProperty(
                customProps.ellipsoid.outlineWidth,
              );
            const ellipsoidOutline = colorFromParts(customProps.ellipsoid.outlineColor);
            if (ellipsoidOutline) {
              ellipsoid.outlineColor = new Cesium.ConstantProperty(ellipsoidOutline);
            }
            if (typeof customProps.ellipsoid.heightReference === 'number')
              ellipsoid.heightReference = new Cesium.ConstantProperty(
                customProps.ellipsoid.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //

          // Правки для конкретных типов инструментов
          if (
            entity.toolName !== undefined &&
            isDrawingToolName(entity.toolName) &&
            entity.toolName !== 'drawMark' &&
            entity.point !== undefined
          ) {
            // Принудительно назначается конструктором из Cesium.KmlDataSource.load при наличии свойства entity.point
            if (entity.billboard) {
              // console.log(entity.billboard);
              entity.billboard = undefined;
            }
          }
          // // @ts-ignore (конфликт - кастомное свойство toolName)
          // if (entity.toolName === 'drawMark') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'drawLine') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'drawRectangle') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'drawCircle') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'drawPolygon') {
          // }
          // else if (toolName === YOUR_TOOL) {}

          // Если оставить, возможный последующий экспорт пропустит такую сущность. Или просто удаляем за ненадобностью.
          // if (entity.description) entity.description = undefined;
          // Прикрепление к рельефу (принудительно) в зависимости от режима отображения карты
          this.$toolsService.setClampingToGroudForEntity(entity);
        }
      }
      return entities;
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  private sortAndDrawKmlEntities(entities: Array<Cesium.Entity>): boolean {
    try {
      if (!entities?.length) {
        throw new Error('No entities for sorting in sortAndDrawKmlEntities fn');
      }

      // Сортировка
      const newStoresList: Array<
        | {
            toolName: DrawingToolName;
            collection: Array<EntitiesGroup>;
          }
        | undefined
      > = [];
      const newOversList: Array<EntitiesGroup | undefined> = [];

      for (const entity of entities) {
        const toolBaseProps = this.getGroupIdAndToolName(entity?.id);
        // Отбраковка в over-список
        if (!toolBaseProps) {
          newOversList.push({ groupId: entity.id, entitiesList: [entity] }); // без объединений в группы
          continue;
        }

        const groupId = toolBaseProps.groupId;
        const toolName = toolBaseProps.toolName;
        entity.toolName = toolName; // возврат удаленного при экспорте свойства
        const collectionIndex = newStoresList.findIndex((store) => store?.toolName === toolName);
        if (collectionIndex === -1) {
          // вновь созданный временный стор
          newStoresList.push({
            toolName: toolName,
            collection: [{ groupId: groupId, entitiesList: [entity] }],
          });
        } else {
          if (!newStoresList[collectionIndex]?.collection) {
            console.info(
              `None collection property in "${newStoresList[collectionIndex]?.toolName}" store in sortAndDrawKmlEntities fn`,
            );
            continue;
          }
          const groupIdIndex = newStoresList[collectionIndex].collection.findIndex(
            (item) => item.groupId === groupId,
          );
          if (groupIdIndex === -1) {
            // вновь созданная группа в соответствующем уже существующем временном сторе
            newStoresList[collectionIndex]?.collection.push({
              groupId: groupId,
              entitiesList: [entity],
            });
          } else {
            // добавление в уже существующую группу соответствующего временного стора
            newStoresList[collectionIndex]?.collection[groupIdIndex].entitiesList.push(entity);
          }
        }
      }

      const isActiveObjsInStores: Partial<Record<DrawingToolName, boolean>> = {}; // обеспечивает требуемый автовыбор в списке при импорте (!!! синхронизировано с плавающими окнами инструментов!!! - в свойстве _validPickedEntity)
      // Добавление в существующие сторы и отрисовка
      if (newStoresList.length) {
        for (const store of newStoresList) {
          if (!store?.collection || !store?.toolName) {
            console.info("Invalid newStoresList item's forming in sortAndDrawKmlEntities fn");
            continue;
          }
          const storeName = store.toolName;
          const collection = store.collection;

          // Проверка, есть ли уже выбранная сущность (группа составных сущностей) в списке данного типа инструментов
          // Проверка необходима, т.к. на данный момент параметр лист-стора "activeObjInStore" не очищается при опустошении стора инструмента (управляется посредством структурной диррективы "@for" в шаблоне, относящейся к DrawingStoreItem.collection)
          const thisStoreIndexInListsStores = this.$drawingsListService.drawingStores.findIndex(
            (store) => store.storeName === storeName,
          );
          if (thisStoreIndexInListsStores !== -1) {
            if (
              this.$drawingsListService.drawingStores[
                thisStoreIndexInListsStores
              ]?.activeObjInStore?.()
            ) {
              const oldGroupIndexInToolStore = this.$drawingService.allEntitiesListsLinks[
                storeName
              ]?.().findIndex(
                (oldGroupInToolStore) =>
                  oldGroupInToolStore?.groupId ===
                  this.$drawingsListService.drawingStores[
                    thisStoreIndexInListsStores
                  ].activeObjInStore()?.groupId,
              );
              // Подтверждение актуальности "activeObjInStores"
              if (oldGroupIndexInToolStore !== -1) {
                isActiveObjsInStores[storeName] = true;
              }
            }
          }

          for (const group of collection) {
            if (!group) continue;
            group.defaultEntity = this.setEntitiesGroupDefaultEntity(group, storeName);
            const pushedInStore = this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              group.entitiesList,
              group.groupId,
              storeName,
              group.defaultEntity,
            );
            if (!pushedInStore) {
              console.info(`Pushing in store "${storeName}" failed in sortAndDrawKmlEntities fn`);
              continue;
            }

            // Отмечает активной в списке ПЕРВУЮ ВНОВЬ добавленную из импорта сущность (группу от выполнения одного сценария инструмента)
            // при отсутствии блокировки посредством "isActiveObjsInStores"
            if (thisStoreIndexInListsStores !== -1) {
              if (isActiveObjsInStores?.[storeName] !== true) {
                const groupIndexInToolStore = this.$drawingService.allEntitiesListsLinks[
                  storeName
                ]?.().findIndex((groupInToolStore) => groupInToolStore?.groupId === group.groupId);
                if (groupIndexInToolStore !== -1) {
                  const activeGroupInStore =
                    this.$drawingService.allEntitiesListsLinks[storeName]()?.[
                      groupIndexInToolStore
                    ];
                  if (activeGroupInStore) {
                    this.$drawingsListService.drawingStores[
                      thisStoreIndexInListsStores
                    ].activeObjInStore.set(activeGroupInStore);
                    isActiveObjsInStores[storeName] = true;
                  }
                }
              }
            }
          }
        }
      }
      if (newOversList.length) {
        for (const group of newOversList) {
          if (!group) continue;
          group.defaultEntity = this.setEntitiesGroupDefaultEntity(group);
          this.$drawingService.pushGroupWithoutTemporalWithDrawing(
            group.entitiesList,
            group.groupId,
            undefined, // Отсутствие toolName определит объект в this.$drawingService.overEntitiesList
            group.defaultEntity,
          );
        }
      }
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  private getGroupIdAndToolName(
    entityId: string,
  ): { groupId: string; toolName: DrawingToolName } | undefined {
    try {
      if (!entityId) throw new Error('Invalid entity in fn');
      // Notice: шаблон нашего id: `${groupIdChank}-${ToolName}-${entytyType}-${'(auxiliary)' - опционально}-${unicRandomIdChank}-`
      const newIdArr: string[] = entityId.split('-');

      // Отбраковка в over-список
      const maybeToolName = newIdArr[1];
      if (newIdArr.length < 2 || !maybeToolName || !isDrawingToolName(maybeToolName)) {
        return undefined;
      }
      const groupId = newIdArr[0];
      return { groupId: groupId, toolName: maybeToolName };
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  private setEntitiesGroupDefaultEntity(
    groupObj: EntitiesGroup,
    toolName?: DrawingToolName,
  ): Cesium.Entity | undefined {
    try {
      let defaultEntity: Cesium.Entity | undefined = undefined;
      if (toolName) {
        switch (toolName) {
          case 'drawMark':
            defaultEntity = groupObj.entitiesList?.[0];
            break;
          case 'drawLine':
            defaultEntity = groupObj.entitiesList.find((entity) => entity?.id.includes('-line-'));
            break;
          case 'drawRectangle':
            defaultEntity = groupObj.entitiesList.find((entity) =>
              entity?.id.includes('-polygon-'),
            );
            break;
          case 'drawCircle':
            defaultEntity = groupObj.entitiesList.find((entity) =>
              entity?.id.includes('-ellipse-'),
            );
            break;
          case 'drawPolygon':
            defaultEntity = groupObj.entitiesList.find((entity) =>
              entity?.id.includes('-polygon-'),
            );
            break;
          default:
            defaultEntity = undefined;
        }
      } else {
        // Для "overs"-стора
        defaultEntity = groupObj.entitiesList?.[0];
      }
      // if (defaultEntity) {
      // this.$drawingService.changeDefaultEntityInGroup(groupObj.groupId, defaultEntity, toolName);
      // }
      return defaultEntity;
      // ...другие действия, необходимые для конкретного инструмента
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }
}
