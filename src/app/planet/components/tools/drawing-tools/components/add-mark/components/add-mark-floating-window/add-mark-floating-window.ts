import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  effect,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { MatTooltip } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddMarkService } from '../../services/add-mark-service/add-mark.service';
import { AddMarkFloatingWindowService } from '@/components/tools/drawing-tools/components/add-mark/components/add-mark-floating-window/services/add-mark-floating-window-service/add-mark-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';
import { CoordSystems } from '@/common/lib/coord-sistems.lib';
import type { CRS } from '@/common/lib/coord-sistems.lib';

// interface iconsOption {
//   id: number;
//   url?: Cesium.Property | string;
//   label: string;
// }

@Component({
  selector: 'add-mark-floating-window',
  imports: [FloatingWindow, MatTooltip, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './add-mark-floating-window.html',
  styleUrl: './add-mark-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMarkFloatingWindow {
  constructor(
    protected $addMarkFloatingWindowService: AddMarkFloatingWindowService,
    protected $drawingService: DrawingService,
    protected $toolsService: ToolsService,
    protected $addMarkService: AddMarkService,
  ) {
    effect(() => {
      try {
        const pickedEntity = this.$addMarkFloatingWindowService.validPickedEnttity();
        if (!pickedEntity) return;
        // Для новой поставленной метки
        untracked(() => {
          this.entity.set(pickedEntity);
          this.labelText.set(pickedEntity.label?.text);
          this.newColor = this.newColor = this.entity()
            ?.billboard?.color?.getValue()
            .toCssHexString();
          this.selectedBillboardImage = this.entity()?.billboard?.image?.getValue();
          this.selectedCoordsSystem = this.entity()?.properties?.getValue().systemCoords;
          this.checkBoxBoolean = this.entity()?.label?.show?.getValue();
          // this.icons.find((item) => {
          //   if (item.url === this.selectedBillboardImage) {
          //     this.selectIcon = item;
          //   }
          // });
          if (pickedEntity.properties !== undefined) {
            const props = pickedEntity.properties.getValue(Cesium.JulianDate.now());
            this.selectedCoordsSystem = props?.systemCoords;
            (async () => {
              const coords = await $toolsService.getPositionCoordsDescription(
                pickedEntity.position?.getValue(Cesium.JulianDate.now()),
                props?.systemCoords,
              );
              if (coords) {
                this.latitudeDescriptionValue.set(
                  coords?.latitudeDescription.match(/-?\d+\.\d+/)?.[0],
                );
                this.longitudeDescriptionValue =
                  coords?.longitudeDescription.match(/-?\d+\.\d+/)?.[0];
                this.latitudeDescriptionStart = coords?.latitudeDescription.slice(0, 1);
                this.longitudeDescriptionStart = coords?.longitudeDescription.slice(0, 1);
                // $addMarkService.heightEntity.set(
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
        if (this.$addMarkFloatingWindowService.flag) {
          untracked(() => {
            if (pickedEntity.properties !== undefined) {
              const props = pickedEntity.properties.getValue(Cesium.JulianDate.now());
              this.selectedCoordsSystem = props?.systemCoords;
              (async () => {
                const coords = await $toolsService.getPositionCoordsDescription(
                  pickedEntity.position?.getValue(Cesium.JulianDate.now()),
                  props?.systemCoords,
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
        console.log(chalk.red(error));
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
  descriptionsCoords: object | undefined = {};
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
  protected onSelectedCheckbox(event: any) {
    this.checkBoxBoolean = event.target.checked;
    if (this.entity() != undefined) {
      this.entity()!.label!.show = new Cesium.ConstantProperty(this.checkBoxBoolean);
      this.$addMarkFloatingWindowService.changesEntity(this.entity()); // !!! изменять параметры validPickedEnttity
    }
  }
  // // Открытие выпад. списка
  // toggleDropDown() {
  //   this.isOpenDropDown = !this.isOpenDropDown;
  // }
  // Функция выпад.списка марок
  // select(icon: any) {
  //   this.selectIcon = icon;
  //   this.isOpenDropDown = false;
  //   if (this.entity() != undefined) {
  //     this.changeSelectedBillboardImage(icon.url, this.entity()!);
  //   }
  // }

  protected async onSelectedCoordsSystem(event: any) {
    const entity = this.entity();
    if (entity != undefined) {
      this.selectedCoordsSystem = event;
      const coords = await this.$toolsService.getPositionCoordsDescription(
        entity.position?.getValue(),
        event,
      );
      let text: string = '';
      if (entity.properties != undefined) {
        entity.properties!['systemCoords'] = event;
        this.coordsDescription = coords?.coordsDescription;
        const coordsSrc = entity.properties?.getValue().systemCoords;
        text = 'СК: ' + coordsSrc + '\n' + this.coordsDescription;
      }
      // изменения label, если не был кастомно изменен
      if (
        entity.label?.text?.getValue().startsWith(`СК: `) ||
        entity.label?.text?.getValue().length === 0
      ) {
        entity.label!.text = new Cesium.ConstantProperty(text);
      }
      this.$addMarkFloatingWindowService.changesEntity(entity);
    }
  }

  // Функция input`a широты
  protected changeLatitudeDescriptionValue() {
    if (this.latitudeDescriptionValue()?.length != 0) {
      let latitudeTrue;
      if (
        this.entity()!.properties != undefined &&
        this.entity()!.properties!['systemCoords'] != undefined
      ) {
        latitudeTrue = this.isValidCoordinate(
          this.latitudeDescriptionValue()!,
          this.latitudeDescriptionStart!,
          this.entity()!.properties!.getValue().systemCoords,
        );
      } else {
        latitudeTrue = this.isValidCoordinate(
          this.latitudeDescriptionValue()!,
          this.latitudeDescriptionStart!,
          this.selectedCoordsSystem!,
        );
      }
      if (this.entity() != undefined && latitudeTrue != null) {
        this.changePositionMark(latitudeTrue, 'lat', this.entity()!);
      }
    }
  }

  // Функция input`a долготы
  protected changeLongitudeDescriptionValue() {
    if (this.longitudeDescriptionValue?.length != 0) {
      let longitudeTrue;
      if (
        this.entity()!.properties != undefined &&
        this.entity()!.properties!['systemCoords'] != undefined
      ) {
        longitudeTrue = this.isValidCoordinate(
          this.longitudeDescriptionValue!,
          this.longitudeDescriptionStart!,
          this.entity()!.properties!.getValue().systemCoords,
        );
      } else {
        longitudeTrue = this.isValidCoordinate(
          this.longitudeDescriptionValue!,
          this.longitudeDescriptionStart!,
          this.selectedCoordsSystem!,
        );
      }
      if (this.entity() != undefined && longitudeTrue != null) {
        this.changePositionMark(longitudeTrue, 'lng', this.entity()!);
      }
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

  // Перевод координат ск42м
  private sk42mToCarto(
    selectedCrs: CRS,
    x: string | number,
    y: string | number,
    z: string | number,
  ) {
    const toCarto: any = CoordSystems.toWGS84Cartesian(
      selectedCrs,
      {
        x: Number(x),
        y: Number(y),
        z: Number(z),
      },
      '',
    );
    return toCarto;
  }

  // Смена позиции метки
  private changePositionMark(
    oneCoords: number,
    type: string,
    entity: Cesium.Entity.ConstructorOptions,
  ) {
    if (type === 'lat') {
      if (this.latitudeDescriptionStart! === 'X') {
        const coords = this.sk42mToCarto(
          this.selectedCoordsSystem!,
          this.longitudeDescriptionValue!,
          oneCoords,
          // this.heightDescriptionValue!,
          0,
        );
        entity.position = Cesium.Cartesian3.fromDegrees(coords.x, coords.y, coords.z);
      } else {
        entity.position = Cesium.Cartesian3.fromDegrees(
          Number(this.longitudeDescriptionValue),
          oneCoords,
          // Number(this.heightDescriptionValue),
          0,
        );
      }
    } else if (type === 'lng') {
      if (this.longitudeDescriptionStart === 'Y') {
        const coords = this.sk42mToCarto(
          this.selectedCoordsSystem!,
          oneCoords,
          this.latitudeDescriptionValue()!,
          // this.heightDescriptionValue!,
          0,
        );
        entity.position = Cesium.Cartesian3.fromDegrees(coords.x, coords.y, coords.z);
      } else {
        entity.position = Cesium.Cartesian3.fromDegrees(
          oneCoords,
          Number(this.latitudeDescriptionValue()),
          // Number(this.heightDescriptionValue),
          0,
        );
      }
    }
    // Для изменения значений в label
    this.onSelectedCoordsSystem(this.selectedCoordsSystem);
    this.$addMarkFloatingWindowService.changesEntity(this.entity());
  }

  // Функция input`a цвета
  protected onColorChange(newColor: string) {
    if (this.entity() != undefined) {
      this.changeColor(newColor, this.entity()!);
    }
  }

  // Изменение цвета метки
  private changeColor(color: string, entity: Cesium.Entity.ConstructorOptions) {
    if (entity != undefined) {
      if (entity.billboard != undefined) {
        entity.billboard.color = Cesium.Color.fromCssColorString(color);
        this.$addMarkFloatingWindowService.changesEntity(this.entity());
      }
    }
  }

  // // Изменение метки
  // changeSelectedBillboardImage(billboardImage: string, entity: Cesium.Entity.ConstructorOptions) {
  //   if (entity != undefined) {
  //     if (entity.billboard != undefined) {
  //       entity.billboard.image = billboardImage;
  //     }
  //   }
  // }
}
