import { reportError } from '@global/lib/report-error.lib';
import { Injectable } from '@angular/core';
import * as Cesium from 'cesium';
import { cloneDeep } from 'lodash';

import { OdsDocument } from 'odf-kit';
import type { OdsCellValue, OdsRowOptions, OdsCellObject } from 'odf-kit';

import {
  readOds,
  //  odsToHtml,
  OdsDocumentModel,
} from 'odf-kit/ods-reader';

import {
  getMomentName,
  // getMomentDate,
  uploadBlob,
} from '@global/lib/common-global.lib';

import { CoordSystems, isCRS } from '@/common/lib/coord-systems.lib';
import * as Humanify from '@/common/lib/humanify.lib';

import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';
// import { UserDataService } from '@global/services/user-data-service/user-data.service';
import {
  DrawingService,
  getRusDrawingToolName,
  getOriginDrawingToolName,
  isDrawingToolName,
  isDrawingToolNameRus,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type {
  DrawingToolName,
  // DrawingToolNameRus,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';
import {
  ToolsService,
  getCircle,
  cartesian3ListFromProperty,
  cartesianFromProperty,
  numberFromProperty,
} from '@/components/tools/services/tools-service/tools.service';
import type { ToolOptions } from '@/components/tools/services/tools-service/tools.service';
// import { ViewerService } from '@/common/services/viewer-service/viewer.service';

import { DrawMarkService } from '@/components/tools/drawing-tools/components/draw-mark/services/draw-mark-service/draw-mark.service';

export type ToolPseudoEntityObj = {
  toolName: DrawingToolName;
  entitiesList: Array<{
    name: string;
    position?: Cesium.Cartesian3 | undefined; // в WGS-84!
    polylynePositions?: Array<Cesium.Cartesian3> | undefined; // в WGS-84!
    radius?: number | undefined;
  }>;
};

function isOdsCellObject(cell: OdsCellValue): cell is OdsCellObject {
  return typeof cell === 'object' && cell !== null && 'rowSpan' in cell;
}

function finiteCellNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

// Запровайден в drawings-list.ts
@Injectable()
export class DrawingsListReportService {
  constructor(
    // protected $viewerService: ViewerService,
    // private $userDataService: UserDataService,
    private $SetProgressSpinnerService: SetProgressSpinnerService,
    private $cursorCoordsService: CursorCoordsService,
    private $drawingService: DrawingService,
    private $drawingsListService: DrawingsListService,
    private $toolsService: ToolsService,

    private $drawMarkService: DrawMarkService,
  ) {}

  private readonly firstColumnName: string = 'Наименование инструмента';
  private readonly secondColumnName: string = 'Широта';
  private readonly thirdColumnName: string = 'Долгота';
  private readonly fourthColumnName: string = 'Высота, м';
  private readonly fifthColumnName: string = 'СК';
  private readonly sixthColumnName: string = 'Радиус, м';

  // ----------------------------------------------------------------------------------------------------------- //
  // Формирование ods-документа
  // ----------------------------------------------------------------------------------------------------------- //

  public async provideReport() {
    this.$SetProgressSpinnerService.setSpinnerOn();
    const a = document.createElement('a');
    try {
      const doc: OdsDocument | undefined | null = await this.formReport();
      if (doc === undefined) {
        alert('Developer error');
        throw new Error('Invalid data for odsDocument in provideReport fn');
      }
      if (doc === null) {
        alert('Сущшости для ods-документа отсутствуют');
        return;
      }
      const bytes = await doc.save();
      const blob = new Blob([new Uint8Array(bytes)], {
        type: 'application/vnd.oasis.opendocument.text',
      });
      const url = URL.createObjectURL(blob);
      a.href = url;
      const momentName = getMomentName(`sight-vectors-report`, 'ods');
      a.download = momentName || 'sight-vectors-report.ods';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    } finally {
      this.$SetProgressSpinnerService.setSpinnerOff();
      if (a) a.remove();
    }
  }

  private async formReport(): Promise<OdsDocument | undefined | null> {
    try {
      const storesNames: Array<DrawingToolName> = [];
      for (const item of this.$drawingsListService.drawingStores) {
        if (item?.storeName && isDrawingToolName(item.storeName)) {
          storesNames.push(item.storeName);
        }
      }
      if (!storesNames.length) return undefined;

      const doc: OdsDocument = new OdsDocument();
      const headerStyleObj: OdsRowOptions = {
        bold: true,
        backgroundColor: '#BBBBBB',
        border: '1pt solid #000000',
        align: 'center',
        verticalAlign: 'bottom',
        wrap: true,
        padding: '0.1cm',
      };

      const allStoresObj = this.$drawingService.allEntitiesListsLinks;
      for (const storeName of storesNames) {
        if (!allStoresObj[storeName]().length) continue;
        const newSheetRows = await this.getSheetRows(storeName);
        if (!newSheetRows?.length) continue;
        const newSheet = doc.addSheet(getRusDrawingToolName(storeName));
        newSheet.setColumnWidth(0, '8cm');
        newSheet.setColumnWidth(1, '4cm');
        newSheet.setColumnWidth(2, '4cm');
        newSheet.setColumnWidth(3, '4cm');
        newSheet.setColumnWidth(4, '2cm');
        // Notice: горизонтальное выранивание не работает адресно (баг библиотеки)
        // let headerRow: Array<OdsCellValue> = [
        //   {
        //     ...headerStyleObj,
        //     ...{ value: firstColumnName, type: 'string', align: 'left' },
        //   },
        //   { ...headerStyleObj, ...{ value: this.secondColumnName, type: 'string', align: 'right' } },
        //   { ...headerStyleObj, ...{ value: this.thirdColumnName, type: 'string', align: 'right' } },
        //   { ...headerStyleObj, ...{ value: this.fourthColumnName, type: 'string', align: 'right' } },
        //   { ...headerStyleObj, ...{ value: this.fifthColumnName, type: 'string', align: 'left' } },
        // ];
        let headerRow: Array<OdsCellValue> = [
          this.firstColumnName,
          this.secondColumnName,
          this.thirdColumnName,
          this.fourthColumnName,
          this.fifthColumnName,
        ];
        //! Должно быть учтено в this.getSheetRows()
        if (storeName === 'drawCircle') {
          newSheet.setColumnWidth(5, '4cm');
          // headerRow.push({
          //   ...headerStyleObj,
          //   ...{ value: this.sixthColumnName, type: 'string', align: 'right' },
          // });
          headerRow.push(this.sixthColumnName);
        }
        // newSheet.addRow(headerRow);
        newSheet.addRow(headerRow, headerStyleObj);
        newSheet.setRowHeight(0, '1cm');
        newSheet.freezeRows(1);
        let coloredRowCounter = 0;
        for (const row of newSheetRows) {
          const firstCell = row?.[0];
          if (isOdsCellObject(firstCell) && firstCell.rowSpan) {
            coloredRowCounter++;
          }
          if (coloredRowCounter % 2 === 0) {
            newSheet.addRow(row, {
              backgroundColor: '#DDDDDD',
              border: '0.5pt solid #000000',
              verticalAlign: 'middle',
              wrap: true,
              padding: '0.1cm',
            });
          } else {
            newSheet.addRow(row, {
              border: '0.5pt solid #000000',
              verticalAlign: 'middle',
              wrap: true,
              padding: '0.1cm',
            });
          }
        }
        // Deprecated
        // Footer
        // sheet.addRow([null, null, null, null, null]);
        // if (
        //   this.$userDataService.firstname() !== undefined &&
        //   this.$userDataService.lastname() !== undefined
        // ) {
        //   sheet.addRow(
        //     [
        //       {
        //         value: 'Документ подготовлен пользователем:',
        //         type: 'string',
        //         wrap: true,
        //       },
        //       {
        //         value: `${this.$userDataService.firstname() ?? ''} ${this.$userDataService.lastname() ?? ''}`,
        //         type: 'string',
        //         wrap: false,
        //       },
        //       null,
        //       null,
        //       null,
        //     ],
        //     {
        //       verticalAlign: 'bottom',
        //       padding: '0.1cm',
        //     },
        //   );
        // }
        // sheet.addRow(
        //   [
        //     {
        //       value: 'Дата формирования документа:',
        //       type: 'string',
        //       wrap: true,
        //     },
        //     {
        //       value: getMomentDate(),
        //       type: 'string',
        //       wrap: false,
        //     },
        //     null,
        //     null,
        //     null,
        //   ],
        //   {
        //     verticalAlign: 'bottom',
        //     wrap: true,
        //     padding: '0.1cm',
        //   },
        // );
      }

      return doc;
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    } finally {
    }
  }

  private async getSheetRows(
    toolName: DrawingToolName,
  ): Promise<Array<Array<OdsCellValue>> | undefined> {
    try {
      const sheetRows: Array<Array<OdsCellValue>> = [];
      const gag: OdsCellValue = 'не определено';
      const sk: OdsCellValue | undefined = this.$cursorCoordsService?.selectedCrs?.() || undefined;
      const allStoresObj = this.$drawingService.allEntitiesListsLinks;
      if (!allStoresObj[toolName]().length) return undefined;
      for (const group of allStoresObj[toolName]()) {
        if (!group) {
          console.info(
            `Group is undefined in store: ${toolName} (by getSheetRows fn). Result will be skipped within .ods document`,
          );
          continue;
        }
        const defaultEntity = group?.defaultEntity;
        if (defaultEntity === undefined || !(defaultEntity instanceof Cesium.Entity)) {
          console.info(
            `Group's defaultEntity is undefined in store: ${toolName} (by getSheetRows fn). Result will be skipped within .ods document`,
          );
          continue;
        }
        const rowWithName: Array<OdsCellValue> = [];
        let entityName = defaultEntity?.name; // пользовательское наименование
        if (entityName === undefined) {
          const newIdArr: string[] = defaultEntity.id.split('-');
          const idToolName = newIdArr[1];
          if (newIdArr.length < 2 || !idToolName || !isDrawingToolName(idToolName)) {
            entityName = 'имя не определено';
          } else {
            const uniqueId = newIdArr[newIdArr.length - 1];
            entityName = `${getRusDrawingToolName(idToolName)}-${uniqueId}`;
          }
        } else {
          if (isDrawingToolName(entityName)) {
            entityName = getRusDrawingToolName(entityName);
          }
        }
        rowWithName.push({
          value: entityName,
          type: 'string',
          rowSpan: 1, // default 1 // количество объединенных строк
        });
        // Более одной строки
        if (toolName === 'drawLine' || toolName === 'drawRectangle' || toolName === 'drawPolygon') {
          const positions = cartesian3ListFromProperty(
            defaultEntity.polyline?.positions?.getValue(),
          );
          if (positions.length) {
            for (let i = 0; i < positions.length; i++) {
              const posObj = await this.$toolsService.getPositionCoordsNumbers(
                positions[i],
                typeof sk === 'string' && isCRS(sk) ? sk : undefined,
              );
              let targetRow: Array<OdsCellValue> = [];
              if (i === 0) {
                targetRow = rowWithName;
              } else {
                targetRow = []; // для последующих строк в объединении значение первой колонки уже не требуется
              }
              targetRow.push(
                {
                  value: posObj?.latitude ? posObj.latitude : gag,
                  type: posObj?.latitude ? 'float' : 'string',
                },
                {
                  value: posObj?.longitude ? posObj?.longitude : gag,
                  type: posObj?.longitude ? 'float' : 'string',
                },
                {
                  value: posObj?.height ? posObj?.height : gag,
                  type: posObj?.height ? 'float' : 'string',
                },
                posObj?.crs || gag,
              );
              sheetRows.push(targetRow);
              const nameCell = rowWithName[0];
              if (i > 0 && isOdsCellObject(nameCell) && nameCell.rowSpan !== undefined) {
                nameCell.rowSpan++;
              }
            }
          } else {
            rowWithName.push(gag, gag, gag, sk || gag);
            sheetRows.push(rowWithName);
          }
          // Единственная строка
        } else {
          const position = cartesianFromProperty(defaultEntity.position?.getValue());
          if (position) {
            const posObj = await this.$toolsService.getPositionCoordsNumbers(
              position,
              typeof sk === 'string' && isCRS(sk) ? sk : undefined,
            );
            rowWithName.push(
              {
                value: posObj?.latitude ? posObj.latitude : gag,
                type: posObj?.latitude ? 'float' : 'string',
              },
              {
                value: posObj?.longitude ? posObj?.longitude : gag,
                type: posObj?.longitude ? 'float' : 'string',
              },
              {
                value: posObj?.height ? posObj?.height : gag,
                type: posObj?.height ? 'float' : 'string',
              },
              posObj?.crs || gag,
            );
          } else {
            rowWithName.push(gag, gag, gag, sk || gag);
          }
          if (toolName === 'drawCircle') {
            const rawRadius = numberFromProperty(defaultEntity.ellipse?.semiMajorAxis?.getValue());
            if (rawRadius !== undefined) {
              rowWithName.push({
                value: Math.round(rawRadius),
                type: 'float',
              });
            } else rowWithName.push(gag);
          }
          sheetRows.push(rowWithName);
        }
      }
      return sheetRows;
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  // ----------------------------------------------------------------------------------------------------------- //
  // Извлечение данных из ods-документа
  // ----------------------------------------------------------------------------------------------------------- //

  public uploadReport(event: Event): boolean {
    try {
      const inputEl = event.target;
      if (!(inputEl instanceof HTMLInputElement)) {
        throw new Error('Report input is not an HTMLInputElement in uploadReport fn');
      }
      const file = uploadBlob(event);
      const reader = new FileReader();
      reader.onload = (): void => {
        try {
          const buffer = reader.result; // ArrayBuffer (после reader.readAsArrayBuffer(file))
          if (!buffer || typeof buffer === 'string') {
            throw new Error('Invalid buffer data in uploadReport fn');
          }
          const bytes = new Uint8Array(buffer);
          // Fast mode — values only, no formatting
          const model2: OdsDocumentModel = readOds(bytes, { includeFormatting: false });
          // console.log(model2.sheets);
          const toolsPseudoCollections: Array<ToolPseudoEntityObj> | undefined =
            this.getPseudoEntitiesFromReport(model2);
          // console.log(toolsPseudoCollections);
          if (!toolsPseudoCollections?.length) {
            throw new Error('Empty tools collections in uploadReport fn');
          }
          this.drawEntitiesFromReport(toolsPseudoCollections);

          // ----------------------------------------------- //
          // Rows matrix
          // const model = readOds(bytes);
          // for (const sheet of model.sheets) {
          //   console.log(sheet.name);
          //   for (const row of sheet.rows) {
          //     for (const cell of row.cells) {
          //       // console.log(cell.colIndex, cell.type, cell.value);
          //       console.log(cell);
          //     }
          //   }
          // }

          // HTML table
          // const html = odsToHtml(bytes);
          // console.log(html);
          // ----------------------------------------------- //
        } catch (error: unknown) {
          reportError(error);
          throw error;
        } finally {
          inputEl.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  private getPseudoEntitiesFromReport(
    odsDocumentModel: OdsDocumentModel,
  ): Array<ToolPseudoEntityObj> | undefined {
    try {
      if (!odsDocumentModel || !odsDocumentModel?.sheets) {
        throw new Error('Invalid odsDocumentModel in getPseudoEntitiesFromReport fn');
      }
      const sheets = odsDocumentModel.sheets;
      if (!sheets?.length) {
        throw new Error('Non sheets in odsDocumentModel in getPseudoEntitiesFromReport fn');
      }
      const toolsPseudoCollections: Array<ToolPseudoEntityObj> = [];
      // Уровень таблиц
      for (const sheet of sheets) {
        if (!sheet?.rows?.length) {
          console.info('Empty sheet. Sheet will be skipped.');
          continue;
        }
        // Обязательные колонки
        if (
          sheet.rows[0]?.cells?.[0]?.value !== this.firstColumnName || // 'Наименование инструмента'
          sheet.rows[0]?.cells?.[1]?.value !== this.secondColumnName || // 'Широта'
          sheet.rows[0]?.cells?.[2]?.value !== this.thirdColumnName || // 'Долгота'
          sheet.rows[0]?.cells?.[3]?.value !== this.fourthColumnName || // 'Высота, м'
          sheet.rows[0]?.cells?.[4]?.value !== this.fifthColumnName // 'СК'
        ) {
          console.info(
            "Invalid row's construction in sheet (default columns). Sheet will be skipped.",
          );
          continue;
        }
        // Опциональные колонки
        if (
          sheet.rows[0]?.cells?.[5]?.value &&
          sheet.rows[0].cells[5].value !== this.sixthColumnName // 'Радиус, м'
        ) {
          console.info(
            "Invalid row's construction in sheet (optional columns). Sheet will be skipped.",
          );
          continue;
        }
        if (sheet.rows[0].cells[0].value === this.firstColumnName && sheet.rows.length === 1) {
          console.info('Empty rows in sheet is undefined. Sheet will be skipped.');
          continue;
        }
        const rusToolName = sheet?.name;
        if (typeof rusToolName !== 'string' || !isDrawingToolNameRus(rusToolName)) {
          console.info('Invalid toolName in sheet. Sheet will be skipped.');
          continue;
        }
        const toolName = getOriginDrawingToolName(rusToolName);
        const toolPseudoEntityObj: ToolPseudoEntityObj = {
          toolName: toolName,
          entitiesList: [],
        };
        let nowEntityIndex = -1;
        // Уровень строк таблицы
        for (const row of sheet.rows) {
          if (!row?.cells?.length || row.cells[0].value === this.firstColumnName) continue;
          const nowCartographic = new Cesium.Cartographic(0, 0, 0);
          // Очередное создание объекта новой сущности на ее первой строке
          if (row.cells[0].type !== 'covered') {
            // 'covered'- тип объединенных ячеек (без значения)
            toolPseudoEntityObj.entitiesList?.push({
              name: `${row.cells[0].value}`,
              position: undefined, // д.б. в WGS-84!
              polylynePositions: [], // д.б. в WGS-84!
              radius: undefined,
            });
            nowEntityIndex++;
          }
          // Уровень ячеек одной строки
          for (let i = 0; i < row.cells.length; i++) {
            if (i === 0)
              continue; // пропуск первого столбца 'Наименование инструмента'
            // 'Широта'
            else if (i === 1) {
              const latitude = finiteCellNumber(row.cells[i].value);
              if (latitude !== undefined) nowCartographic.latitude = latitude;
              // 'Долгота'
            } else if (i === 2) {
              const longitude = finiteCellNumber(row.cells[i].value);
              if (longitude !== undefined) nowCartographic.longitude = longitude;
              // 'Высота, м'
            } else if (i === 3) {
              const height = finiteCellNumber(row.cells[i].value);
              if (height !== undefined) nowCartographic.height = height;
              // 'СК';
            } else if (i === 4) {
              const crs = `${row.cells[i].value}`;
              if (crs.includes('WGS-84')) {
                const cartesian = Cesium.Cartesian3.fromDegrees(
                  nowCartographic.longitude,
                  nowCartographic.latitude,
                  nowCartographic.height,
                );
                if (
                  toolName === 'drawLine' ||
                  toolName === 'drawRectangle' ||
                  toolName === 'drawPolygon'
                ) {
                  toolPseudoEntityObj.entitiesList[nowEntityIndex].polylynePositions?.push(
                    cartesian,
                  );
                } else {
                  toolPseudoEntityObj.entitiesList[nowEntityIndex].position = cartesian;
                }
              } else {
                if (isCRS(crs)) {
                  // Используем полученные данные для пересчета в текущую систему координат
                  const wgs84PseudoCartographic = CoordSystems.toWGS84Cartographic(
                    crs,
                    nowCartographic,
                    '',
                  );
                  const cartographic = new Cesium.Cartographic(
                    wgs84PseudoCartographic.longitude,
                    wgs84PseudoCartographic.latitude,
                    wgs84PseudoCartographic.height,
                  );
                  const cartesian = Cesium.Cartesian3.fromDegrees(
                    cartographic.longitude,
                    cartographic.latitude,
                    cartographic.height,
                  );
                  if (
                    toolName === 'drawLine' ||
                    toolName === 'drawRectangle' ||
                    toolName === 'drawPolygon'
                  ) {
                    toolPseudoEntityObj.entitiesList[nowEntityIndex].polylynePositions?.push(
                      cartesian,
                    );
                  } else {
                    toolPseudoEntityObj.entitiesList[nowEntityIndex].position = cartesian;
                  }
                } else {
                  console.info(
                    `Invalid coord system in tool's "${toolName}" row. Row will be skipped.`,
                  );
                  continue;
                }
              }
              // 'Радиус, м'
            } else if (i === 5) {
              if (toolName === 'drawCircle') {
                const radius = finiteCellNumber(row.cells[i].value);
                if (radius !== undefined) {
                  toolPseudoEntityObj.entitiesList[nowEntityIndex].radius = radius;
                }
              }
            }
          }
        }
        toolsPseudoCollections.push(toolPseudoEntityObj);
      }
      if (!toolsPseudoCollections.length) return undefined;
      else return toolsPseudoCollections;
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  private drawEntitiesFromReport(toolsPseudoCollections: Array<ToolPseudoEntityObj>): boolean {
    try {
      const isActiveObjsInStores: Partial<Record<DrawingToolName, boolean>> = {}; // обеспечивает требуемый автовыбор в списке при импорте (!!! синхронизировано с плавающими окнами инструментов!!! - в свойстве _validPickedEntity)

      for (const toolObj of toolsPseudoCollections) {
        const toolName = toolObj.toolName;
        // Проверка, есть ли уже выбранная сущность (группа составных сущностей) в списке данного типа инструментов
        // Проверка необходима, т.к. на данный момент параметр лист-стора "activeObjInStore" не очищается при опустошении стора инструмента (управляется посредством структурной диррективы "@for" в шаблоне, относящейся к DrawingStoreItem.collection)
        const thisStoreIndexInListsStores = this.$drawingsListService.drawingStores.findIndex(
          (store) => store.storeName === toolName,
        );
        if (thisStoreIndexInListsStores !== -1) {
          if (
            this.$drawingsListService.drawingStores[thisStoreIndexInListsStores]?.activeObjInStore?.()
          ) {
            const oldGroupIndexInToolStore = this.$drawingService.allEntitiesListsLinks[
              toolName
            ]?.().findIndex(
              (oldGroupInToolStore) =>
                oldGroupInToolStore?.groupId ===
                this.$drawingsListService.drawingStores[thisStoreIndexInListsStores].activeObjInStore()
                  ?.groupId,
            );
            // Подтверждение актуальности "activeObjInStores"
            if (oldGroupIndexInToolStore !== -1) {
              isActiveObjsInStores[toolName] = true;
            }
          }
        }

        // -------------------------------------------------------------------------------------------- //

        for (const entityObj of toolObj.entitiesList) {
          const entityName = entityObj.name;
          const groupIdChunk = `${Math.ceil(Math.random() * 1000000)}`;
          // ----------------------------------------------------------- //
          // ----------------------------------------------------------- //
          // ----------------------------------------------------------- //
          if (toolName === 'drawMark') {
            const position = entityObj?.position;
            if (!position) {
              console.info(`"${toolName}" entity's position is undefined. Entity will be skipped.`);
              continue;
            }
            const optForMark = {
              ...cloneDeep(this.$drawMarkService.optForMark),
              ...{
                name: entityName,
                id: `${groupIdChunk}-${toolName}-point-${Math.ceil(Math.random() * 1000000)}`,
              },
            };
            if (optForMark.label) optForMark.label.text = entityName;
            if (optForMark.properties) optForMark.properties.systemCoords = 'WGS-84';
            const entity = this.$toolsService.setPointEntity(position, optForMark);
            if (!entity) {
              console.info(`"${toolName}" entity's construction failed. Entity will be skipped.`);
              continue;
            }
            this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              [entity],
              groupIdChunk,
              toolName,
              entity,
            );
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
          } else if (toolName === 'drawLine') {
            const polylinePositions = entityObj?.polylynePositions;
            if (!polylinePositions?.length) {
              console.info(
                `"${toolName}" entity's polylinePositions is undefined. Entity will be skipped.`,
              );
              continue;
            }
            const optForLine = {
              name: entityName,
              id: `${groupIdChunk}-${toolName}-line-${Math.ceil(Math.random() * 1000000)}`,
              toolName: toolName,
              clampToGround: true,
              properties: {
                lineColor: undefined,
                numericId: undefined,
              },
            };
            const entity = this.$toolsService.setLineEntity(
              polylinePositions,
              polylinePositions[polylinePositions.length - 1],
              entityName,
              optForLine,
            );
            if (!entity) {
              console.info(`"${toolName}" entity's construction failed. Entity will be skipped.`);
              continue;
            }
            this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              [entity],
              groupIdChunk,
              toolName,
              entity,
            );
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
          } else if (toolName === 'drawRectangle') {
            const polylinePositions = entityObj?.polylynePositions;
            if (!polylinePositions?.length) {
              console.info(
                `"${toolName}" entity's polylinePositions is undefined. Entity will be skipped.`,
              );
              continue;
            }
            const optForPolygon = {
              name: entityName,
              id: `${groupIdChunk}-${toolName}-polygon-${Math.ceil(Math.random() * 1000000)}`,
              toolName: toolName,
              clampToGround: true,
            };
            const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
            polygonHierarchy.positions = polylinePositions;
            const entity = this.$toolsService.setPolygonEntity(
              polylinePositions,
              polylinePositions[0],
              entityName,
              polygonHierarchy,
              optForPolygon,
            );
            if (!entity) {
              console.info(`"${toolName}" entity's construction failed. Entity will be skipped.`);
              continue;
            }
            this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              [entity],
              groupIdChunk,
              toolName,
              entity,
            );
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
          } else if (toolName === 'drawCircle') {
            const position = entityObj?.position;
            if (!position) {
              console.info(`"${toolName}" entity's position is undefined. Entity will be skipped.`);
              continue;
            }
            const radius = entityObj?.radius;
            if (!radius) {
              console.info(`"${toolName}" entity's radius is undefined. Entity will be skipped.`);
              continue;
            }

            const startPoint = position;
            const lengthInMeters = radius;
            const azimuth = Math.floor(Math.random() * 180) + 1;
            // Локальная матрица преобразования (East-North-Up) для начальной точки
            const localFrame = Cesium.Transforms.eastNorthUpToFixedFrame(startPoint);
            // Вычисление смещения в метрах по осям X (Восток) и Y (Север) с помощью тригонометрии
            const angleRad = Cesium.Math.toRadians(azimuth);
            const localOffset = new Cesium.Cartesian3(
              lengthInMeters * Math.cos(angleRad), // смещение на Восток
              lengthInMeters * Math.sin(angleRad), // смещение на Север
              0.0, // смещение по высоте (Земля)
            );
            // Перевод локального смещение в глобальные координаты Cartesian3
            const endPoint = Cesium.Matrix4.multiplyByPoint(
              localFrame,
              localOffset,
              new Cesium.Cartesian3(),
            );

            const polylinePositionsRadius = [startPoint, endPoint];
            const optForLine = {
              name: entityName + ' ' + '(auxiliary)',
              id: `${groupIdChunk}-${toolName}-line-${Math.ceil(Math.random() * 1000000)}`,
              toolName: toolName,
              clampToGround: true,
            };
            const lineEntity = this.$toolsService.setLineEntity(
              polylinePositionsRadius,
              endPoint,
              Humanify.distanceM(radius),
              optForLine,
            );
            if (!lineEntity) {
              console.info(
                `"${toolName}" lineEntity entity's construction failed. Entity will be skipped.`,
              );
              continue;
            }

            const optForEllipse: ToolOptions = {
              name: entityName,
              id: `${groupIdChunk}-${toolName}-ellipse-${Math.ceil(Math.random() * 1000000)}`,
              toolName: toolName,
              clampToGround: true,
              ellipse: {
                show: false,
              },
              polygon: {
                material: Cesium.Color.WHITE.withAlpha(0.1),
                perPositionHeight: false,
                hierarchy: new Cesium.PolygonHierarchy(),
              },
            };
            const ellipseEntity = this.$toolsService.setEllipseEntity(
              polylinePositionsRadius,
              startPoint,
              entityName,
              radius,
              radius,
              Cesium.Cartographic.fromCartesian(startPoint).height,
              optForEllipse,
            );
            if (!ellipseEntity) {
              console.info(
                `"${toolName}" ellipse entity's construction failed. Entity will be skipped.`,
              );
              continue;
            }
            const polylinePositionsForCircle = getCircle(ellipseEntity);
            if (polylinePositionsForCircle?.length && ellipseEntity?.polyline) {
              ellipseEntity.polyline.positions = new Cesium.ConstantProperty(
                polylinePositionsForCircle,
              );
            }
            if (ellipseEntity.polygon) {
              const newPolygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
              newPolygonHierarchy.positions = polylinePositionsForCircle;
              ellipseEntity.polygon.hierarchy = new Cesium.ConstantProperty(newPolygonHierarchy);
            }

            this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              [ellipseEntity, lineEntity],
              groupIdChunk,
              toolName,
              ellipseEntity,
            );
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
          } else if (toolName === 'drawPolygon') {
            const polylinePositions = entityObj.polylynePositions;
            if (!polylinePositions?.length) {
              console.info(
                `"${toolName}" entity's polylinePositions is undefined. Entity will be skipped.`,
              );
              continue;
            }
            const optForPolygon = {
              name: entityName,
              id: `${groupIdChunk}-${toolName}-polygon-${Math.ceil(Math.random() * 1000000)}`,
              toolName: toolName,
              clampToGround: true,
            };
            const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
            polygonHierarchy.positions = polylinePositions;
            const entity = this.$toolsService.setPolygonEntity(
              polylinePositions,
              polylinePositions[0],
              entityName,
              polygonHierarchy,
              optForPolygon,
            );
            if (!entity) {
              console.info(`"${toolName}" entity's construction failed. Entity will be skipped.`);
              continue;
            }
            this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              [entity],
              groupIdChunk,
              toolName,
              entity,
            );
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
            // ----------------------------------------------------------- //
          } else if (toolName === 'addDome') {
            const position = entityObj?.position;
            if (!position) {
              console.info(`"${toolName}" entity's position is undefined. Entity will be skipped.`);
              continue;
            }
            const radius = entityObj?.radius;
            if (!radius) {
              console.info(`"${toolName}" entity's radius is undefined. Entity will be skipped.`);
              continue;
            }

            const startPoint = position;
            const lengthInMeters = radius;
            const azimuth = Math.floor(Math.random() * 180) + 1;
            // Локальная матрица преобразования (East-North-Up) для начальной точки
            const localFrame = Cesium.Transforms.eastNorthUpToFixedFrame(startPoint);
            // Вычисление смещения в метрах по осям X (Восток) и Y (Север) с помощью тригонометрии
            const angleRad = Cesium.Math.toRadians(azimuth);
            const localOffset = new Cesium.Cartesian3(
              lengthInMeters * Math.cos(angleRad), // смещение на Восток
              lengthInMeters * Math.sin(angleRad), // смещение на Север
              0.0, // смещение по высоте (Земля)
            );
            // Перевод локального смещение в глобальные координаты Cartesian3
            const endPoint = Cesium.Matrix4.multiplyByPoint(
              localFrame,
              localOffset,
              new Cesium.Cartesian3(),
            );

            const polylinePositionsRadius = [startPoint, endPoint];
            const optForEllipsoid = {
              name: entityName,
              id: `${groupIdChunk}-${toolName}-ellipsoid-${Math.ceil(Math.random() * 1000000)}`,
              toolName: toolName,
              withPoint: true,
              arrow: true,
            };
            const radii: Cesium.Cartesian3 = new Cesium.Cartesian3(radius, radius, radius);
            const horizontalHeight = Cesium.Cartographic.fromCartesian(startPoint).height;
            const entity = this.$toolsService.setEllipsoidEntity(
              polylinePositionsRadius,
              polylinePositionsRadius[0],
              entityName,
              radii,
              radius,
              horizontalHeight,
              optForEllipsoid,
            );
            if (!entity) {
              console.info(`"${toolName}" entity's construction failed. Entity will be skipped.`);
              continue;
            }
            this.$drawingService.pushGroupWithoutTemporalWithDrawing(
              [entity],
              groupIdChunk,
              toolName,
              entity,
            );
          }

          // -------------------------------------------------------------------------------------------- //

          // Отмечает активной в списке ПЕРВУЮ ВНОВЬ добавленную из импорта сущность (группу от выполнения одного сценария инструмента)
          // при отсутствии блокировки посредством "isActiveObjsInStores"
          if (thisStoreIndexInListsStores !== -1) {
            if (isActiveObjsInStores?.[toolName] !== true) {
              // сработает один раз для одного типа инструментов
              const groupIndexInToolStore = this.$drawingService.allEntitiesListsLinks[
                toolName
              ]?.().findIndex((groupInToolStore) => groupInToolStore?.groupId === groupIdChunk);
              if (groupIndexInToolStore !== -1) {
                const activeGroupInStore =
                  this.$drawingService.allEntitiesListsLinks[toolName]()?.[groupIndexInToolStore];
                if (activeGroupInStore) {
                  this.$drawingsListService.drawingStores[
                    thisStoreIndexInListsStores
                  ].activeObjInStore.set(activeGroupInStore);
                  isActiveObjsInStores[toolName] = true;
                }
              }
            }
          }
        }
      }
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }
}
