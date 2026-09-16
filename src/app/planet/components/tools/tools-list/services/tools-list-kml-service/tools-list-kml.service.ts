import { Injectable } from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';
import { cloneDeep } from 'lodash';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  drawingToolsNames,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { getMomentName, downloadBlob, uploadBlob } from '@global/lib/common-global.lib';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';

import { undefinedToJsonNull, jsonNullToUndefined } from '@global/lib/common-global.lib';

export class CustomPropsFromKml {
  // использовать только валидные для JSON-преобразований типы данных
  toolName: string;
  id: string;
  name: string | undefined;
  position: Cesium.Cartesian3 | undefined;
  show: boolean;
  properties?: { [key: string]: any };
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
    material?: { color: Cesium.Color } | any; // иные типы material присваивать в пособработке (для конкретных инструментов)
    clampToGround?: boolean;
  };
  polygon?: {
    show?: boolean;
    material?: { color: Cesium.Color } | any;
    hierarchy?: Cesium.PolygonHierarchy;
    perPositionHeight?: boolean;
  };
  ellipse?: {
    show?: boolean;
    semiMinorAxis?: number;
    semiMajorAxis?: number;
    rotation?: number;
    material?: { color: Cesium.Color } | any;
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
    material?: { color: Cesium.Color } | any;
    outline?: boolean;
    outlineWidth?: number;
    outlineColor?: Cesium.Color;
    heightReference?: number;
  };
}

// Запровайден в tools-list.ts
@Injectable()
export class ToolsListKmlService {
  declare private drawLayer: Cesium.DataSource;
  constructor(
    private $viewerService: ViewerService,
    private $toolsService: ToolsService,
    private $drawingService: DrawingService,
    private $toolsListService: ToolsListService,
  ) {
    const dataSource: Cesium.DataSource | undefined =
      this?.$viewerService.viewer.dataSources?.getByName(
        this.$drawingService.drawingToolsLayerName,
      )?.[0];
    if (dataSource) {
      this.drawLayer = dataSource;
    } else {
      console.log(chalk.red("Data source hasn't found in ToolsListService"));
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
      console.log(chalk.red('Layer is not valid or undefined in exportAllToKml fn'));
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
        console.log(chalk.blue('Nothing to export'));
        return false;
      }

      // Резервная проверка на "мусорные" сущности (обязательная очистка - в импорте), не выявленные при возможном предварительном импорте из .kml (для сценария пересохранения).
      // Применяется только в отношение сущностей инструментов "Ока" (имеющих entity.toolName). Сторонние kml-сущности экспортируются, как есть.
      let trashEntities: Array<Cesium.Entity> = [];
      const trashIds: Array<string> = [];
      for (const entity of exportedCollection.values) {
        const toolBaseProps = this.getGroupIdAndToolName(entity?.id);
        //@ts-ignore (конфликт - кастомное свойство toolName)
        if (!toolBaseProps || !entity?.toolName) {
          //@ts-ignore (конфликт - кастомное свойство _children)
          if (entity?._children?.length) {
            //@ts-ignore (конфликт - кастомное свойство _children)
            trashEntities = trashEntities.concat(entity?._children);
            // @ts-ignore (конфликт - кастомное свойство _children)
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
        // @ts-ignore (конфликт - кастомное свойство toolName)
        if (!toolBaseProps || !entity?.toolName) {
          // Добавление в экспорт без подготовки entity.description
          modifiedExportedCollection.add(entity);
          continue;
        } else {
          // Пропуск "мусорных" сущностей (наличие toolName характеризует предшествующий импорт, как сущностей "Ока")
          if (trashIds.includes(entity?.id)) continue;
          const updatedEntity = this.setEntityDescriptionForExport(
            entity,
            // @ts-ignore (конфликт - кастомное свойство toolName)
            toolBaseProps?.toolName || entity?.toolName,
          );
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
      if (kmz) {
        if (!(newExport as Cesium.exportKmlResultKmz)?.kmz) {
          throw new Error('Invalid .kmz data in exportAllToKml fn');
        }
        blobData = new Blob([(newExport as Cesium.exportKmlResultKmz).kmz], {
          type: 'plain/text;charset=utf8',
        });
        momentName = getMomentName('sight-export-all-layers', 'kmz');
      } else {
        if (!(newExport as Cesium.exportKmlResultKml)?.kml) {
          throw new Error('Invalid .kml data in exportAllToKml fn');
        }
        blobData = new Blob([(newExport as Cesium.exportKmlResultKml).kml], {
          type: 'plain/text;charset=utf8',
        });
        momentName = getMomentName('sight-export-all-layers', 'kml');
      }
      downloadBlob(momentName, blobData);
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return false;
    } finally {
      // Для сборщика мусора JS
      if (exportedCollection) exportedCollection = null!;
      if (validDrawingCollection) validDrawingCollection = null!;
      if (compositeCollection) compositeCollection = null!;
      if (modifiedExportedCollection) modifiedExportedCollection = null!;
    }
  }

  public async exportToolToKml(
    toolName: string | DrawingToolName,
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
      // @ts-ignore (конфликт - кастомное свойство toolName)
      if (!drawingToolsNames.includes(toolName)) {
        alert(
          'Имя инструмента не определено. Сущности, будут экспортированы без привязки к функциональности ГИП "Око"',
        );
        return this.exportOversToKml(kmz); // без к/л преобразований
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return false;
    }
    let exportedCollection: Cesium.EntityCollection = new Cesium.EntityCollection();
    try {
      const allEntitiesOnLayer: Array<Cesium.Entity | undefined> = layer?.entities?.values;
      if (!allEntitiesOnLayer?.length) {
        alert('Сущностей для экспорта не обнаружено');
        console.log(chalk.blue('Nothing to export'));
        return false;
      }

      // Резервная проверка на "мусорные" сущности (обязательная очистка - в импорте), не выявленные при возможном предварительном импорте из .kml (для сценария пересохранения).
      // Применяется только в отношение сущностей инструментов "Ока" (имеющих entity.toolName). Сторонние kml-сущности экспортируются, как есть (в this.exportOversToKml() или this.exportAllToKml()).
      let trashEntities: Array<Cesium.Entity> = [];
      const trashIds: Array<string> = [];
      for (const entity of allEntitiesOnLayer) {
        //@ts-ignore (конфликт - кастомное свойство _children)
        if (entity?._children?.length) {
          //@ts-ignore (конфликт - кастомное свойство _children)
          trashEntities = trashEntities.concat(entity?._children);
          // @ts-ignore (конфликт - кастомное свойство _children)
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
          // @ts-ignore (конфликт - кастомное свойство toolName)
          entity?.toolName === toolName &&
          entity?.id.includes(toolName) &&
          // @ts-ignore (конфликт - кастомное свойство toolName)
          drawingToolsNames.includes(entity?.toolName)
        ) {
          //@ts-ignore (конфликт - кастомное свойство toolName)
          const updatedEntity = this.setEntityDescriptionForExport(entity, entity?.toolName);
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
      if (kmz) {
        if (!(newExport as Cesium.exportKmlResultKmz)?.kmz) {
          throw new Error('Invalid .kmz data in exportToolToKml fn');
        }
        blobData = new Blob([(newExport as Cesium.exportKmlResultKmz).kmz], {
          type: 'plain/text;charset=utf8',
        });
        momentName = getMomentName(`sight-export-${toolName}-layer`, 'kmz');
      } else {
        if (!(newExport as Cesium.exportKmlResultKml)?.kml) {
          throw new Error('Invalid .kml data in exportToolToKml fn');
        }
        blobData = new Blob([(newExport as Cesium.exportKmlResultKml).kml], {
          type: 'plain/text;charset=utf8',
        });
        momentName = getMomentName(`sight-export-${toolName}-layer`, 'kml');
      }
      downloadBlob(momentName, blobData);
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return false;
    } finally {
      if (exportedCollection) exportedCollection = null!;
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
        console.log(
          chalk.blue(
            "Entity's description already exists and will be rewrite (by setEntityDescriptionForExport fn)",
          ),
        );
        // return undefined;
      }
      if (!toolName || !drawingToolsNames.includes(toolName)) {
        console.log(chalk.blue("Ivalid entity's toolName in setEntityDescriptionForExport fn"));
        return undefined;
      }
      // Общие для всех сущностей параметры
      const customProps: CustomPropsFromKml = {
        toolName: toolName,
        id: entity.id,
        name: entity.name,
        position: entity.position?.getValue(),
        show: entity.show,
      };
      if (entity.properties) customProps.properties = entity.properties.getValue();
      if (entity.label) {
        customProps.label = {
          show: entity.label.show?.getValue(),
          text: entity.label.text?.getValue(),
          showBackground: entity.label.showBackground?.getValue(),
          backgroundColor: entity.label.backgroundColor?.getValue(),
          font: entity.label.font?.getValue(),
          translucencyByDistance: entity.label.translucencyByDistance?.getValue(),
          style: entity.label.style?.getValue(),
          pixelOffset: entity.label.pixelOffset?.getValue(),
          eyeOffset: entity.label.eyeOffset?.getValue(),
          horizontalOrigin: entity.label.horizontalOrigin?.getValue(),
          verticalOrigin: entity.label.verticalOrigin?.getValue(),
          disableDepthTestDistance:
            entity.label.disableDepthTestDistance?.getValue() === Infinity
              ? 'Infinity' // т.к. JSON.stringify(Infinity) === null
              : entity.label.disableDepthTestDistance?.getValue(),
          heightReference: entity.label.heightReference?.getValue(),
        };
      }
      if (entity.billboard) {
        customProps.billboard = {
          show: entity.billboard.show?.getValue(),
          image: entity.billboard.image?.getValue(),
          height: entity.billboard.height?.getValue(),
          width: entity.billboard.width?.getValue(),
          color: entity.billboard.color?.getValue(),
          pixelOffset: entity.billboard.pixelOffset?.getValue(),
          eyeOffset: entity.billboard.eyeOffset?.getValue(),
          scaleByDistance: entity.billboard.scaleByDistance?.getValue(),
          horizontalOrigin: entity.billboard.horizontalOrigin?.getValue(),
          verticalOrigin: entity.billboard.verticalOrigin?.getValue(),
          disableDepthTestDistance:
            entity.billboard.disableDepthTestDistance?.getValue() === Infinity
              ? 'Infinity'
              : entity.billboard.disableDepthTestDistance?.getValue(),
          heightReference: entity.billboard.heightReference?.getValue(),
        };
      }
      if (entity.point) {
        customProps.point = {
          show: entity.point.show?.getValue(),
          pixelSize: entity.point.pixelSize?.getValue(),
          color: entity.point.color?.getValue(),
          outlineWidth: entity.point.outlineWidth?.getValue(),
          outlineColor: entity.point.outlineColor?.getValue(),
          disableDepthTestDistance:
            entity.point.disableDepthTestDistance?.getValue() === Infinity
              ? 'Infinity'
              : entity.point.disableDepthTestDistance?.getValue(),
          heightReference: entity.point.heightReference?.getValue(),
        };
      }
      if (entity.polyline) {
        customProps.polyline = {
          show: entity.polyline.show?.getValue(),
          positions: entity.polyline.positions?.getValue(),
          width: entity.polyline.width?.getValue(),
          material: entity.polyline.material?.getValue(),
          clampToGround: entity.polyline.clampToGround?.getValue(),
        };
      }
      if (entity.polygon) {
        customProps.polygon = {
          show: entity.polygon.show?.getValue(),
          material: entity.polygon.material?.getValue(),
          hierarchy: entity.polygon.hierarchy?.getValue(),
          perPositionHeight: entity.polygon.perPositionHeight?.getValue(),
        };
      }
      if (entity.ellipse) {
        customProps.ellipse = {
          show: entity.ellipse.show?.getValue(),
          semiMinorAxis: entity.ellipse.semiMinorAxis?.getValue(),
          semiMajorAxis: entity.ellipse.semiMajorAxis?.getValue(),
          rotation: entity.ellipse.rotation?.getValue(),
          material: entity.ellipse.material?.getValue(),
          outline: entity.ellipse.outline?.getValue(),
          outlineWidth: entity.ellipse.outlineWidth?.getValue(),
          outlineColor: entity.ellipse.outlineColor?.getValue(),
          height: entity.ellipse.height?.getValue(),
          heightReference: entity.ellipse.heightReference?.getValue(),
        };
      }
      if (entity.ellipsoid) {
        customProps.ellipsoid = {
          show: entity.ellipsoid.show?.getValue(),
          radii: entity.ellipsoid.radii?.getValue(),
          minimumCone: entity.ellipsoid.minimumCone?.getValue(),
          maximumCone: entity.ellipsoid.maximumCone?.getValue(),
          material: entity.ellipsoid.material?.getValue(),
          outline: entity.ellipsoid.outline?.getValue(),
          outlineWidth: entity.ellipsoid.outlineWidth?.getValue(),
          outlineColor: entity.ellipsoid.outlineColor?.getValue(),
          heightReference: entity.ellipsoid.heightReference?.getValue(),
        };
      }

      // Правки для конкретных типов инструментов
      // if (toolName === 'addMark') {
      // } else if (toolName === 'addLine') {
      // } else if (toolName === 'addRectangle') {
      // } else if (toolName === 'addCircle') {
      // } else if (toolName === 'addPolygon') {
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
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
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
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
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
        // @ts-ignore (конфликт - кастомное свойство toolName)
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
            exportedCollection.add(entity!);
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
      if (kmz) {
        if (!(newExport as Cesium.exportKmlResultKmz)?.kmz) {
          throw new Error('Invalid .kmz data in exportOversToKml fn');
        }
        blobData = new Blob([(newExport as Cesium.exportKmlResultKmz).kmz], {
          type: 'plain/text;charset=utf8',
        });
        momentName = getMomentName(`sight-export-overs-layer`, 'kmz');
      } else {
        if (!(newExport as Cesium.exportKmlResultKml)?.kml) {
          throw new Error('Invalid .kml data in exportOversToKml fn');
        }
        blobData = new Blob([(newExport as Cesium.exportKmlResultKml).kml], {
          type: 'plain/text;charset=utf8',
        });
        momentName = getMomentName(`sight-export-overs-layer`, 'kml');
      }
      downloadBlob(momentName, blobData);
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return false;
    } finally {
      if (exportedCollection) exportedCollection = null!;
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
      const inputEl = event.target as HTMLInputElement;
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
                console.log(chalk.red('Error on parsing entities in importAllFromKml fn'));
                // Уже может быть частично мутирован (при к/л положительных результатах перебора)
                this.sortAndDrawKmlEntities(clearedEntities);
              }
            } else {
              console.log(chalk.red('Error on clearing entities in importAllFromKml fn'));
              this.sortAndDrawKmlEntities(newDataSource.entities.values);
            }
          } else {
            alert('В импорте сущностей к отображению не обнаружено');
            throw new Error(
              'No entities in newDataSource in sortAndDrimportAllFromKmlawKmlEntities fn',
            );
          }
          // console.log(this.$drawingService.addLineEntitiesList());
        } catch (error: unknown) {
          console.log(chalk.red(error));
          if (error instanceof Error) console.log(error.stack);
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
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
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
        // @ts-ignore (конфликт - кастомное свойство _children)
        if (entity?._children?.length) {
          // @ts-ignore (конфликт - кастомное свойство _children)
          entitiesToRemove = entitiesToRemove.concat(entity._children);
          // @ts-ignore (конфликт - кастомное свойство _children)
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
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return undefined;
    }
  }

  private readonly htmlParser = new DOMParser();
  private prepareKmlEntities(entities: Array<Cesium.Entity>): Array<Cesium.Entity> | undefined {
    try {
      if (!entities?.length) {
        throw new Error('No entities for parsing in prepareKmlEntities fn');
      }
      for (const entity of entities) {
        // Проверка на принадлежность к "Око"
        const toolBaseProps = this.getGroupIdAndToolName(entity?.id);
        if (!toolBaseProps || !drawingToolsNames.includes(toolBaseProps.toolName)) continue;

        // При экспорте в .kml свойство entity.description "зашивается" в html-строку (для стандартного Cesium Infobox)
        const htmlString = entity?.description?.getValue();
        if (htmlString === '') {
          console.log(chalk.blue('Entity without description'));
          continue;
        }
        const doc = this.htmlParser?.parseFromString(htmlString, 'text/html');
        if (!doc) {
          console.log(
            chalk.blue(
              `Invalid value of .kml-entity's description tag in prepareKmlEntities fn: ${htmlString}`,
            ),
          );
          continue;
        }
        const description: unknown = doc?.querySelector(
          '.cesium-infoBox-description-lighter',
        )?.textContent;
        if (!description) {
          console.log(chalk.blue(`Invalid JSON to parse in prepareKmlEntities fn: ${description}`));
          continue;
        } else if (typeof description === 'string') {
          const parsedProps = JSON.parse(description);
          const customProps = jsonNullToUndefined(parsedProps) as CustomPropsFromKml;
          if (!customProps) {
            console.log(
              chalk.blue(`Invalid parsed customProps in prepareKmlEntities fn: ${customProps}`),
            );
            continue;
          }
          // console.log('New parsed props: ', customProps);
          // ------------------------------------------------------------------------ //
          // @ts-ignore (конфликт - кастомное свойство toolName)
          entity.toolName = customProps?.toolName; // резервное восстановление toolName
          if (!entity.id) entity.id = customProps.id;
          entity.name = customProps.name;
          if (customProps.position)
            entity.position = new Cesium.ConstantPositionProperty(
              new Cesium.Cartesian3(
                customProps?.position?.x || 0.0,
                customProps?.position?.y || 0.0,
                customProps?.position?.z || 0.0,
              ),
            );
          entity.show = customProps.show;
          // ------------------------------------------------------------------------ //
          if (customProps.properties !== undefined)
            entity.properties = new Cesium.PropertyBag(customProps.properties);
          // ------------------------------------------------------------------------ //
          if (customProps.label) {
            if (!entity.label) entity.label = new Cesium.LabelGraphics();
            if (customProps.label.show !== undefined)
              entity.label!.show = new Cesium.ConstantProperty(customProps.label.show);
            if (customProps.label.text !== undefined)
              entity.label!.text = new Cesium.ConstantProperty(customProps.label.text);
            if (customProps.label.showBackground !== undefined)
              entity.label!.showBackground = new Cesium.ConstantProperty(
                customProps.label.showBackground,
              );
            if (customProps.label.backgroundColor !== undefined)
              entity.label!.backgroundColor = new Cesium.ConstantProperty(
                new Cesium.Color(
                  customProps.label.backgroundColor.red,
                  customProps.label.backgroundColor.green,
                  customProps.label.backgroundColor.blue,
                  customProps.label.backgroundColor.alpha ?? 1,
                ),
              );
            if (customProps.label.font !== undefined)
              entity.label!.font = new Cesium.ConstantProperty(customProps.label.font);
            if (customProps.label.translucencyByDistance !== undefined)
              entity.label!.translucencyByDistance = new Cesium.ConstantProperty(
                new Cesium.NearFarScalar(
                  customProps.label.translucencyByDistance.near,
                  customProps.label.translucencyByDistance.nearValue,
                  customProps.label.translucencyByDistance.far,
                  customProps.label.translucencyByDistance.farValue,
                ),
              );
            if (customProps.label.pixelOffset !== undefined)
              entity.label!.pixelOffset = new Cesium.ConstantProperty(
                new Cesium.Cartesian2(
                  customProps.label.pixelOffset?.x || 0.0,
                  customProps.label.pixelOffset?.y || 0.0,
                ),
              );
            if (customProps.label.eyeOffset !== undefined)
              entity.label!.eyeOffset = new Cesium.ConstantProperty(
                new Cesium.Cartesian3(
                  customProps.label.eyeOffset?.x || 0.0,
                  customProps.label.eyeOffset?.y || 0.0,
                  customProps.label.eyeOffset?.z || 0.0,
                ),
              );
            if (customProps.label.style !== undefined)
              entity.label!.style = new Cesium.ConstantProperty(customProps.label.style);
            if (customProps.label.horizontalOrigin !== undefined) {
              entity.label!.horizontalOrigin = new Cesium.ConstantProperty(
                customProps.label.horizontalOrigin,
              );
            }
            if (customProps.label.verticalOrigin !== undefined)
              entity.label!.verticalOrigin = new Cesium.ConstantProperty(
                customProps.label.verticalOrigin,
              );
            if (
              customProps.label.disableDepthTestDistance === 'Infinity' ||
              customProps.label.disableDepthTestDistance === undefined ||
              typeof customProps.label.disableDepthTestDistance === 'number'
            ) {
              if (customProps.label.disableDepthTestDistance === 'Infinity') {
                entity.label!.disableDepthTestDistance = new Cesium.ConstantProperty(
                  Number.POSITIVE_INFINITY,
                );
              } else {
                entity.label!.disableDepthTestDistance = new Cesium.ConstantProperty(
                  customProps.label.disableDepthTestDistance,
                );
              }
            }
            if (customProps.label.heightReference !== undefined)
              entity.label!.heightReference = new Cesium.ConstantProperty(
                customProps.label.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.billboard) {
            if (!entity.billboard) entity.billboard = new Cesium.BillboardGraphics();
            if (customProps.billboard.show !== undefined)
              entity.billboard!.show = new Cesium.ConstantProperty(customProps.billboard.show);
            if (customProps.billboard.image !== undefined)
              entity.billboard!.image = new Cesium.ConstantProperty(customProps.billboard.image);
            if (customProps.billboard.height !== undefined)
              entity.billboard!.height = new Cesium.ConstantProperty(customProps.billboard.height);
            if (customProps.billboard.width !== undefined)
              entity.billboard!.width = new Cesium.ConstantProperty(customProps.billboard.width);
            if (customProps.billboard.color !== undefined)
              entity.billboard!.color = new Cesium.ConstantProperty(
                new Cesium.Color(
                  customProps.billboard.color.red,
                  customProps.billboard.color.green,
                  customProps.billboard.color.blue,
                  customProps.billboard.color.alpha ?? 1,
                ),
              );
            if (customProps.billboard.scaleByDistance !== undefined)
              entity.billboard!.scaleByDistance = new Cesium.ConstantProperty(
                new Cesium.NearFarScalar(
                  customProps.billboard.scaleByDistance.near,
                  customProps.billboard.scaleByDistance.nearValue,
                  customProps.billboard.scaleByDistance.far,
                  customProps.billboard.scaleByDistance.farValue,
                ),
              );
            if (customProps.billboard.pixelOffset !== undefined)
              entity.billboard!.pixelOffset = new Cesium.ConstantProperty(
                new Cesium.Cartesian2(
                  customProps.billboard.pixelOffset?.x || 0.0,
                  customProps.billboard.pixelOffset?.y || 0.0,
                ),
              );
            if (customProps.billboard.eyeOffset !== undefined)
              entity.billboard!.eyeOffset = new Cesium.ConstantProperty(
                new Cesium.Cartesian3(
                  customProps.billboard.eyeOffset?.x || 0.0,
                  customProps.billboard.eyeOffset?.y || 0.0,
                  customProps.billboard.eyeOffset?.z || 0.0,
                ),
              );
            if (customProps.billboard.horizontalOrigin !== undefined)
              entity.billboard!.horizontalOrigin = new Cesium.ConstantProperty(
                customProps.billboard.horizontalOrigin,
              );
            if (customProps.billboard.verticalOrigin !== undefined)
              entity.billboard!.verticalOrigin = new Cesium.ConstantProperty(
                customProps.billboard.verticalOrigin,
              );
            if (
              customProps.billboard.disableDepthTestDistance === 'Infinity' ||
              customProps.billboard.disableDepthTestDistance === undefined ||
              typeof customProps.billboard.disableDepthTestDistance === 'number'
            ) {
              if (customProps.billboard.disableDepthTestDistance === 'Infinity') {
                entity.billboard!.disableDepthTestDistance = new Cesium.ConstantProperty(
                  Number.POSITIVE_INFINITY,
                );
              } else {
                entity.billboard!.disableDepthTestDistance = new Cesium.ConstantProperty(
                  customProps.billboard.disableDepthTestDistance,
                );
              }
            }
            if (customProps.billboard.heightReference !== undefined)
              entity.billboard!.heightReference = entity.billboard!.heightReference =
                new Cesium.ConstantProperty(customProps.billboard.heightReference);
          }
          // ------------------------------------------------------------------------ //
          if (customProps.point) {
            if (!entity.point) entity.point = new Cesium.PointGraphics();
            if (customProps.point.show !== undefined)
              entity.point!.show = new Cesium.ConstantProperty(customProps.point.show);
            if (customProps.point.pixelSize !== undefined)
              entity.point!.pixelSize = new Cesium.ConstantProperty(customProps.point.pixelSize);
            if (customProps.point.color !== undefined)
              entity.point!.color = new Cesium.ConstantProperty(
                new Cesium.Color(
                  customProps.point.color.red,
                  customProps.point.color.green,
                  customProps.point.color.blue,
                  customProps.point.color.alpha ?? 1,
                ),
              );
            if (customProps.point.outlineWidth !== undefined)
              entity.point!.outlineWidth = new Cesium.ConstantProperty(
                customProps.point.outlineWidth,
              );
            if (customProps.point.outlineColor !== undefined)
              entity.point!.outlineColor = new Cesium.ConstantProperty(
                new Cesium.Color(
                  customProps.point.outlineColor.red,
                  customProps.point.outlineColor.green,
                  customProps.point.outlineColor.blue,
                  customProps.point.outlineColor.alpha ?? 1,
                ),
              );
            if (
              customProps.point.disableDepthTestDistance === 'Infinity' ||
              customProps.point.disableDepthTestDistance === undefined ||
              typeof customProps.point.disableDepthTestDistance === 'number'
            ) {
              if (customProps.point.disableDepthTestDistance === 'Infinity') {
                entity.point!.disableDepthTestDistance = new Cesium.ConstantProperty(
                  Number.POSITIVE_INFINITY,
                );
              } else {
                entity.point!.disableDepthTestDistance = new Cesium.ConstantProperty(
                  customProps.point.disableDepthTestDistance,
                );
              }
            }
            if (customProps.point.heightReference !== undefined)
              entity.point!.heightReference = new Cesium.ConstantProperty(
                customProps.point.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.polyline) {
            if (!entity.polyline) entity.polyline = new Cesium.PolylineGraphics();
            if (customProps.polyline.show !== undefined)
              entity.polyline!.show = new Cesium.ConstantProperty(customProps.polyline.show);
            if (
              customProps.polyline.positions !== undefined &&
              customProps.polyline.positions?.length
            ) {
              const cartesianArr: Array<Cesium.Cartesian3> = [];
              for (const item of customProps.polyline.positions) {
                cartesianArr.push(new Cesium.Cartesian3(item.x, item.y, item.z));
              }
              if (cartesianArr.length)
                entity.polyline!.positions = new Cesium.ConstantProperty(cartesianArr);
            }
            if (customProps.polyline.width !== undefined)
              entity.polyline!.width = new Cesium.ConstantProperty(customProps.polyline.width);
            if (customProps.polyline.material !== undefined) {
              if (customProps.polyline.material.color) {
                // просто цвет (иначе внести правки, характерные для конкретного инструмента, ниже, после определения стандартных свойств)
                entity.polyline!.material = new Cesium.ColorMaterialProperty(
                  new Cesium.Color(
                    customProps.polyline.material.color.red,
                    customProps.polyline.material.color.green,
                    customProps.polyline.material.color.blue,
                    customProps.polyline.material.color.alpha ?? 1,
                  ),
                );
              }
            }
            if (customProps.polyline.clampToGround !== undefined)
              entity.polyline!.clampToGround = new Cesium.ConstantProperty(
                customProps.polyline.clampToGround,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.polygon) {
            if (!entity.polygon) entity.polygon = new Cesium.PolygonGraphics();
            if (customProps.polygon.show !== undefined)
              entity.polygon!.show = new Cesium.ConstantProperty(customProps.polygon.show);
            if (customProps.polygon.material !== undefined) {
              if (customProps.polygon.material.color) {
                entity.polygon!.material = new Cesium.ColorMaterialProperty(
                  new Cesium.Color(
                    customProps.polygon.material.color.red,
                    customProps.polygon.material.color.green,
                    customProps.polygon.material.color.blue,
                    customProps.polygon.material.color.alpha ?? 0.1,
                  ),
                );
              }
            }
            if (
              customProps.polygon.hierarchy?.positions !== undefined &&
              customProps.polygon.hierarchy.positions?.length
            ) {
              const cartesianArr: Array<Cesium.Cartesian3> = [];
              for (const item of customProps.polygon.hierarchy.positions) {
                cartesianArr.push(new Cesium.Cartesian3(item.x, item.y, item.z));
              }
              if (cartesianArr.length)
                entity.polygon!.hierarchy = new Cesium.ConstantProperty(
                  new Cesium.PolygonHierarchy(cartesianArr),
                );
            }
            if (customProps.polygon.perPositionHeight !== undefined)
              entity.polygon!.perPositionHeight = new Cesium.ConstantProperty(
                customProps.polygon.perPositionHeight,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.ellipse) {
            if (!entity.ellipse) entity.ellipse = new Cesium.EllipseGraphics();
            if (customProps.ellipse.show !== undefined)
              entity.ellipse!.show = new Cesium.ConstantProperty(customProps.ellipse.show);
            if (customProps.ellipse.semiMinorAxis !== undefined)
              entity.ellipse!.semiMinorAxis = new Cesium.ConstantProperty(
                customProps.ellipse.semiMinorAxis,
              );
            if (customProps.ellipse.semiMajorAxis !== undefined)
              entity.ellipse!.semiMajorAxis = new Cesium.ConstantProperty(
                customProps.ellipse.semiMajorAxis,
              );
            if (customProps.ellipse.rotation !== undefined)
              entity.ellipse!.rotation = new Cesium.ConstantProperty(customProps.ellipse.rotation);
            if (customProps.ellipse.material !== undefined) {
              if (customProps.ellipse.material.color) {
                entity.ellipse!.material = new Cesium.ColorMaterialProperty(
                  new Cesium.Color(
                    customProps.ellipse.material.color.red,
                    customProps.ellipse.material.color.green,
                    customProps.ellipse.material.color.blue,
                    customProps.ellipse.material.color.alpha ?? 1,
                  ),
                );
              }
            }
            if (customProps.ellipse.outline !== undefined)
              entity.ellipse!.outline = new Cesium.ConstantProperty(customProps.ellipse.outline);
            if (customProps.ellipse.outlineWidth !== undefined)
              entity.ellipse!.outlineWidth = new Cesium.ConstantProperty(
                customProps.ellipse.outlineWidth,
              );
            if (customProps.ellipse.outlineColor !== undefined)
              entity.ellipse!.outlineColor = new Cesium.ConstantProperty(
                new Cesium.Color(
                  customProps.ellipse.outlineColor.red,
                  customProps.ellipse.outlineColor.green,
                  customProps.ellipse.outlineColor.blue,
                  customProps.ellipse.outlineColor.alpha ?? 1,
                ),
              );
            if (customProps.ellipse.height !== undefined)
              entity.ellipse!.height = new Cesium.ConstantProperty(customProps.ellipse.height);
            if (customProps.ellipse.heightReference !== undefined)
              entity.ellipse!.heightReference = new Cesium.ConstantProperty(
                customProps.ellipse.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //
          if (customProps.ellipsoid) {
            if (!entity.ellipsoid) entity.ellipsoid = new Cesium.EllipsoidGraphics();
            if (customProps.ellipsoid.show !== undefined)
              entity.ellipsoid!.radii = new Cesium.ConstantProperty(customProps.ellipsoid.show);
            if (customProps.ellipsoid.radii !== undefined) {
              entity.ellipsoid!.radii = new Cesium.ConstantProperty(
                new Cesium.Cartesian3(
                  customProps.ellipsoid.radii.x,
                  customProps.ellipsoid.radii.y,
                  customProps.ellipsoid.radii.z,
                ),
              );
            }
            if (customProps.ellipsoid.minimumCone !== undefined)
              entity.ellipsoid!.minimumCone = new Cesium.ConstantProperty(
                customProps.ellipsoid.minimumCone,
              );
            if (customProps.ellipsoid.maximumCone !== undefined)
              entity.ellipsoid!.maximumCone = new Cesium.ConstantProperty(
                customProps.ellipsoid.maximumCone,
              );
            if (customProps.ellipsoid.material !== undefined) {
              if (customProps.ellipsoid.material.color) {
                // просто цвет (иначе внести правки, характерные для конкретного инструмента, ниже, после определения стандартных свойств)
                entity.ellipsoid!.material = new Cesium.ColorMaterialProperty(
                  new Cesium.Color(
                    customProps.ellipsoid.material.color.red,
                    customProps.ellipsoid.material.color.green,
                    customProps.ellipsoid.material.color.blue,
                    customProps.ellipsoid.material.color.alpha ?? 1,
                  ),
                );
              }
            }
            if (customProps.ellipsoid.outline !== undefined)
              entity.ellipsoid!.outline = new Cesium.ConstantProperty(
                customProps.ellipsoid.outline,
              );
            if (customProps.ellipsoid.outlineWidth !== undefined)
              entity.ellipsoid!.outlineWidth = new Cesium.ConstantProperty(
                customProps.ellipsoid.outlineWidth,
              );
            if (customProps.ellipsoid.outlineColor !== undefined)
              entity.ellipsoid!.outlineColor = new Cesium.ConstantProperty(
                new Cesium.Color(
                  customProps.ellipsoid.outlineColor.red,
                  customProps.ellipsoid.outlineColor.green,
                  customProps.ellipsoid.outlineColor.blue,
                  customProps.ellipsoid.outlineColor.alpha ?? 1,
                ),
              );
            if (customProps.ellipsoid.heightReference !== undefined)
              entity.ellipsoid!.heightReference = new Cesium.ConstantProperty(
                customProps.ellipsoid.heightReference,
              );
          }
          // ------------------------------------------------------------------------ //

          // Правки для конкретных типов инструментов
          if (
            // @ts-ignore (конфликт - кастомное свойство toolName)
            drawingToolsNames.includes(entity?.toolName) &&
            // @ts-ignore (конфликт - кастомное свойство toolName)
            entity.toolName !== 'addMark' &&
            entity.point !== undefined
          ) {
            // Принудительно назначается конструктором из Cesium.KmlDataSource.load при наличии свойства entity.point
            if (entity.billboard) {
              // console.log(entity.billboard);
              entity.billboard = undefined;
            }
          }
          // // @ts-ignore (конфликт - кастомное свойство toolName)
          // if (entity.toolName === 'addMark') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'addLine') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'addRectangle') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'addCircle') {
          //   // @ts-ignore (конфликт - кастомное свойство toolName)
          // } else if (entity.toolName === 'addPolygon') {
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
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
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
        // @ts-ignore (конфликт - кастомное свойство toolName)
        entity.toolName = toolName; // возврат удаленного при экспорте свойства
        const collectionIndex = newStoresList.findIndex((store) => store?.toolName === toolName);
        if (collectionIndex === -1) {
          // вновь созданный временный стор
          newStoresList.push({
            toolName: toolName as DrawingToolName,
            collection: [{ groupId: groupId, entitiesList: [entity] }],
          });
        } else {
          if (!newStoresList[collectionIndex]?.collection) {
            console.log(
              chalk.red(
                `None collection property in "${newStoresList[collectionIndex]?.toolName}" store in sortAndDrawKmlEntities fn`,
              ),
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

      const isActiveObjsInStores: { [key: string]: boolean } = {}; // обеспечивает требуемый автовыбор в списке при импорте (!!! синхронизировано с плавающими окнами инструментов!!! - в свойстве _validPickedEntity)
      // Добавление в существующие сторы и отрисовка
      if (newStoresList.length) {
        for (const store of newStoresList) {
          if (!store?.collection || !store?.toolName) {
            console.log(
              chalk.red("Invalid newStoresList item's forming in sortAndDrawKmlEntities fn"),
            );
            continue;
          }
          const storeName = store.toolName;
          const collection = store.collection;

          // Проверка, есть ли уже выбранная сущность (группа составных сущностей) в списке данного типа инструментов
          // Проверка необходима, т.к. на данный момент параметр лист-стора "activeObjInStore" не очищается при опустошении стора инструмента (управляется посредством структурной диррективы "@for" в шаблоне, относящейся к DrawingStoreItem.collection)
          const thisStoreIndexInListsStores = this.$toolsListService.drawingStores.findIndex(
            (store) => store.storeName === storeName,
          );
          if (thisStoreIndexInListsStores !== -1) {
            if (
              this.$toolsListService.drawingStores[
                thisStoreIndexInListsStores
              ]?.activeObjInStore?.()
            ) {
              const oldGroupIndexInToolStore = this.$drawingService.allEntitiesListsLinks[
                storeName
              ]?.().findIndex(
                (oldGroupInToolStore) =>
                  oldGroupInToolStore?.groupId ===
                  this.$toolsListService.drawingStores[
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
              console.log(
                chalk.red(`Pushing in store "${storeName}" failed in sortAndDrawKmlEntities fn`),
              );
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
                    this.$toolsListService.drawingStores[
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
            group!.entitiesList,
            group!.groupId,
            undefined, // Отсутствие toolName определит объект в this.$drawingService.overEntitiesList
            group.defaultEntity,
          );
        }
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
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
      if (newIdArr.length < 2 || !drawingToolsNames.includes(newIdArr[1] as any)) {
        return undefined;
      }
      const groupId = newIdArr[0];
      const toolName = newIdArr[1];
      if (!drawingToolsNames.includes(toolName as DrawingToolName)) {
        return undefined;
      }
      return { groupId: groupId, toolName: toolName as DrawingToolName };
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
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
          case 'addMark':
            defaultEntity = groupObj.entitiesList?.[0];
            break;
          case 'addLine':
            defaultEntity = groupObj.entitiesList.find((entity) => entity?.id.includes('-line-'));
            break;
          case 'addRectangle':
            defaultEntity = groupObj.entitiesList.find((entity) =>
              entity?.id.includes('-polygon-'),
            );
            break;
          case 'addCircle':
            defaultEntity = groupObj.entitiesList.find((entity) =>
              entity?.id.includes('-ellipse-'),
            );
            break;
          case 'addPolygon':
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
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return undefined;
    }
  }
}
