import { reportError } from '@global/lib/report-error.lib';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  effect,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as Cesium from 'cesium';

import { MatTooltip } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import {
  ToolsService,
  cartesianFromProperty,
  stringFromProperty,
  booleanFromProperty,
  colorFromProperty,
  colorFromCssString,
} from '@/components/tools/services/tools-service/tools.service';
import type { PositionCoordsDescription } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawMarkService } from '../../services/draw-mark-service/draw-mark.service';
import { DrawMarkFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-mark/components/draw-mark-floating-window/services/draw-mark-floating-window-service/draw-mark-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';
import { CoordSystems, isCRS, type CRS } from '@/common/lib/coord-sistems.lib';

// interface iconsOption {
//   id: number;
//   url?: Cesium.Property | string;
//   label: string;
// }

function crsFromProperties(value: unknown): CRS | undefined {
  if (typeof value !== 'object' || value === null || !('systemCoords' in value)) return undefined;
  const systemCoords = value.systemCoords;
  return typeof systemCoords === 'string' && isCRS(systemCoords) ? systemCoords : undefined;
}

@Component({
  selector: 'draw-mark-floating-window',
  imports: [FloatingWindow, MatTooltip, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './draw-mark-floating-window.html',
  styleUrl: './draw-mark-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawMarkFloatingWindow {
  constructor(
    protected $drawMarkFloatingWindowService: DrawMarkFloatingWindowService,
    protected $drawingService: DrawingService,
    protected $toolsService: ToolsService,
    protected $drawMarkService: DrawMarkService,
  ) {
    effect(() => {
      try {
        const pickedEntity = this.$drawMarkFloatingWindowService.validPickedEnttity();
        if (!pickedEntity) return;
        // Для новой поставленной метки
        untracked(() => {
          this.entity.set(pickedEntity);
          this.labelText.set(pickedEntity.label?.text);
          const color = colorFromProperty(pickedEntity.billboard?.color?.getValue());
          if (color) {
            this.newColor = color.toCssHexString();
          }
          const image = stringFromProperty(pickedEntity.billboard?.image?.getValue());
          this.selectedBillboardImage = image ?? '';
          const show = booleanFromProperty(pickedEntity.label?.show?.getValue());
          if (show !== undefined) this.checkBoxBoolean = show;
          // this.icons.find((item) => {
          //   if (item.url === this.selectedBillboardImage) {
          //     this.selectIcon = item;
          //   }
          // });
          if (pickedEntity.properties !== undefined) {
            const systemCoords = crsFromProperties(
              pickedEntity.properties.getValue(Cesium.JulianDate.now()),
            );
            this.selectedCoordsSystem = systemCoords;
            (async () => {
              const coords = await $toolsService.getPositionCoordsDescription(
                cartesianFromProperty(pickedEntity.position?.getValue(Cesium.JulianDate.now())),
                systemCoords,
              );
              if (coords) {
                this.latitudeDescriptionValue.set(
                  coords?.latitudeDescription.match(/-?\d+\.\d+/)?.[0],
                );
                this.longitudeDescriptionValue =
                  coords?.longitudeDescription.match(/-?\d+\.\d+/)?.[0];
                this.latitudeDescriptionStart = coords?.latitudeDescription.slice(0, 1);
                this.longitudeDescriptionStart = coords?.longitudeDescription.slice(0, 1);
                // $drawMarkService.heightEntity.set(
                //   Number(coords?.heightDescription.match(/-?\d+\.\d+/)?.[0]),
                // );
                // this.heightDescriptionStart = coords?.heightDescription.slice(0, 1);
                this.coordsDescription = coords?.coordsDescription;
                this.coordsDescriptionEnd = coords?.latitudeDescription.slice(-1);
              }
            })();
          }
        });
        // При перемещении ранее поставленной метки
        if (this.$drawMarkFloatingWindowService.flag) {
          untracked(() => {
            if (pickedEntity.properties !== undefined) {
              const systemCoords = crsFromProperties(
                pickedEntity.properties.getValue(Cesium.JulianDate.now()),
              );
              this.selectedCoordsSystem = systemCoords;
              (async () => {
                const coords = await $toolsService.getPositionCoordsDescription(
                  cartesianFromProperty(pickedEntity.position?.getValue(Cesium.JulianDate.now())),
                  systemCoords,
                );
                if (coords) {
                  this.latitudeDescriptionValue.set(
                    coords?.latitudeDescription.match(/-?\d+\.\d+/)?.[0],
                  );
                  this.longitudeDescriptionValue =
                    coords?.longitudeDescription.match(/-?\d+\.\d+/)?.[0];
                  // this.heightDescriptionValue = coords?.heightDescription.match(/-?\d+\.\d+/)?.[0];
                  this.latitudeDescriptionStart = coords?.latitudeDescription.slice(0, 1);
                  this.longitudeDescriptionStart = coords?.longitudeDescription.slice(0, 1);
                  // this.heightDescriptionStart = coords?.heightDescription.slice(0, 1);
                  this.coordsDescription = coords?.coordsDescription;
                  this.coordsDescriptionEnd = coords?.latitudeDescription.slice(-1);
                }
              })();
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  // TODO: вынести все в сервис к объекту валидной сущности и отрефакторить после Саши
  placeholderLabel: string | undefined = undefined;
  entity = signal<Cesium.Entity | undefined>(undefined);
  labelText = signal<Cesium.Property | string | undefined>('');
  selectedBillboardImage: Cesium.Property | string | undefined = '';
  newColor: string = '#ff0000';
  selectedCoordsSystem: CRS | undefined = 'WGS-84';
  descriptionsCoords: PositionCoordsDescription | undefined = undefined;
  latitudeDescriptionValue = signal<string | undefined>('');
  longitudeDescriptionValue: string | undefined = '';
  // heightDescriptionValue: string | undefined = '';
  coordsDescription: string | undefined = '';
  latitudeDescriptionStart: string | undefined = '';
  longitudeDescriptionStart: string | undefined = '';
  // heightDescriptionStart: string | undefined = '';
  coordsDescriptionEnd: string | undefined = '';
  // isOpenDropDown: boolean = false;
  checkBoxBoolean: boolean = true;
  // icons: iconsOption[] = [
  //   {
  //     id: 1,
  //     url: 'assets/core/drawings-tools/map-position_white.png',
  //     label: 'Метка',
  //   },
  //   {
  //     id: 2,
  //     url: 'assets/core/drawings-tools/globe.png',
  //     label: 'Глобус',
  //   },
  // ];
  // selectIcon: iconsOption = this.icons[0];

  // Скрытие/показ label
  protected onSelectedCheckbox(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.checkBoxBoolean = target.checked;
    const entity = this.entity();
    if (!entity?.label) return;
    entity.label.show = new Cesium.ConstantProperty(this.checkBoxBoolean);
    this.$drawMarkFloatingWindowService.changesEntity(entity);
  }
  // // Открытие выпад. списка
  // toggleDropDown() {
  //   this.isOpenDropDown = !this.isOpenDropDown;
  // }
  // Функция выпад.списка марок
  // select(icon: { url?: string }) {
  //   this.selectIcon = icon;
  //   this.isOpenDropDown = false;
  //   const entity = this.entity();
  //   if (entity) this.changeSelectedBillboardImage(icon.url, entity);
  // }

  protected async onSelectedCoordsSystem(event: CRS | undefined) {
    const entity = this.entity();
    if (!entity) return;
    this.selectedCoordsSystem = event;
    const coords = await this.$toolsService.getPositionCoordsDescription(
      cartesianFromProperty(entity.position?.getValue()),
      event,
    );
    let text: string = '';
    if (entity.properties) {
      entity.properties['systemCoords'] = event;
      this.coordsDescription = coords?.coordsDescription;
      const coordsSrc = crsFromProperties(entity.properties.getValue()) ?? event;
      text = 'СК: ' + coordsSrc + '\n' + this.coordsDescription;
    }
    const labelText = stringFromProperty(entity.label?.text?.getValue());
    if (
      entity.label &&
      labelText !== undefined &&
      (labelText.startsWith('СК: ') || labelText.length === 0)
    ) {
      entity.label.text = new Cesium.ConstantProperty(text);
    }
    this.$drawMarkFloatingWindowService.changesEntity(entity);
  }

  // Функция input`a широты
  protected changeLatitudeDescriptionValue() {
    const latitude = this.latitudeDescriptionValue();
    const entity = this.entity();
    const latitudeKind = this.latitudeDescriptionStart;
    const coordsSystem =
      crsFromProperties(entity?.properties?.getValue()) ?? this.selectedCoordsSystem;
    if (!latitude || !entity || !latitudeKind || !coordsSystem) return;
    const latitudeTrue = this.isValidCoordinate(latitude, latitudeKind, coordsSystem);
    if (latitudeTrue !== undefined && latitudeTrue !== null) {
      this.changePositionMark(latitudeTrue, 'lat', entity);
    }
  }

  // Функция input`a долготы
  protected changeLongitudeDescriptionValue() {
    const longitude = this.longitudeDescriptionValue;
    const entity = this.entity();
    const longitudeKind = this.longitudeDescriptionStart;
    const coordsSystem =
      crsFromProperties(entity?.properties?.getValue()) ?? this.selectedCoordsSystem;
    if (!longitude || !entity || !longitudeKind || !coordsSystem) return;
    const longitudeTrue = this.isValidCoordinate(longitude, longitudeKind, coordsSystem);
    if (longitudeTrue !== undefined && longitudeTrue !== null) {
      this.changePositionMark(longitudeTrue, 'lng', entity);
    }
  }

  // Проверка валидности кооридинаты
  private isValidCoordinate(value: string, type: string, sk: string) {
    const trimmed = value.trim();
    const regex = /^-?\d+(?:\.\d+)?$/;
    if (!regex.test(trimmed)) return null;

    const num = parseFloat(trimmed);
    if (isNaN(num)) return null;
    if (sk === 'СК-42 м') {
      if (type === 'X') {
        return num >= -10000000 && num <= 20000000 ? num : null;
      } else if (type === 'Y') {
        return num >= -10000000 && num <= 20000000 ? num : null;
      }
    } else {
      if (type === 'B') {
        return num >= -90 && num <= 90 ? num : null;
      } else if (type === 'L') {
        return num >= -180 && num <= 180 ? num : null;
      }
    }
    return null;
  }

  private toFiniteNumber(value: string | number | undefined): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  // Перевод координат ск42м
  private sk42mToCarto(
    selectedCrs: CRS,
    x: string | number,
    y: string | number,
    z: string | number,
  ) {
    const easting = this.toFiniteNumber(x);
    const northing = this.toFiniteNumber(y);
    const height = this.toFiniteNumber(z);
    if (easting === undefined || northing === undefined || height === undefined) return undefined;
    return CoordSystems.toWGS84Cartesian(
      selectedCrs,
      {
        x: easting,
        y: northing,
        z: height,
      },
      '',
    );
  }

  // Смена позиции метки
  private changePositionMark(
    oneCoords: number,
    type: string,
    entity: Cesium.Entity.ConstructorOptions,
  ) {
    const crs = this.selectedCoordsSystem;
    if (type === 'lat') {
      const longitude = this.longitudeDescriptionValue;
      if (this.latitudeDescriptionStart === 'X') {
        if (!crs || !longitude) return;
        const coords = this.sk42mToCarto(crs, longitude, oneCoords, 0);
        if (!coords) return;
        entity.position = Cesium.Cartesian3.fromDegrees(coords.x, coords.y, coords.z);
      } else {
        const longitudeDeg = this.toFiniteNumber(longitude);
        if (longitudeDeg === undefined) return;
        entity.position = Cesium.Cartesian3.fromDegrees(longitudeDeg, oneCoords, 0);
      }
    } else if (type === 'lng') {
      const latitude = this.latitudeDescriptionValue();
      if (this.longitudeDescriptionStart === 'Y') {
        if (!crs || !latitude) return;
        const coords = this.sk42mToCarto(crs, oneCoords, latitude, 0);
        if (!coords) return;
        entity.position = Cesium.Cartesian3.fromDegrees(coords.x, coords.y, coords.z);
      } else {
        const latitudeDeg = this.toFiniteNumber(latitude);
        if (latitudeDeg === undefined) return;
        entity.position = Cesium.Cartesian3.fromDegrees(oneCoords, latitudeDeg, 0);
      }
    }
    // Для изменения значений в label
    this.onSelectedCoordsSystem(this.selectedCoordsSystem);
    this.$drawMarkFloatingWindowService.changesEntity(this.entity());
  }

  // Функция input`a цвета
  protected onColorChange(newColor: string) {
    const entity = this.entity();
    if (!entity) return;
    this.changeColor(newColor, entity);
  }

  // Изменение цвета метки
  private changeColor(color: string, entity: Cesium.Entity.ConstructorOptions) {
    if (!entity.billboard) return;
    const parsed = colorFromCssString(color);
    if (!parsed) return;
    entity.billboard.color = parsed;
    this.$drawMarkFloatingWindowService.changesEntity(this.entity());
  }

  // // Изменение метки
  // changeSelectedBillboardImage(billboardImage: string, entity: Cesium.Entity.ConstructorOptions) {
  //   if (entity !== undefined) {
  //     if (entity.billboard !== undefined) {
  //       entity.billboard.image = billboardImage;
  //     }
  //   }
  // }
}
