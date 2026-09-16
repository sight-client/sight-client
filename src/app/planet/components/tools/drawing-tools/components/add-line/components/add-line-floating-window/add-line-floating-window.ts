import { Component, ChangeDetectionStrategy, signal, effect, untracked } from '@angular/core';
// import chalk from 'chalk';

import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as Cesium from 'cesium';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddLineService } from '@/components/tools/drawing-tools/components/add-line/services/add-line-service/add-line.service';
import { AddLineFloatingWindowService } from '@/components/tools/drawing-tools/components/add-line/components/add-line-floating-window/services/add-line-floating-window-service/add-line-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'add-line-floating-window',
  imports: [
    FloatingWindow,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './add-line-floating-window.html',
  styleUrl: './add-line-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLineFloatingWindow {
  constructor(
    protected readonly $addLineService: AddLineService,
    protected readonly $addLineFloatingWindowService: AddLineFloatingWindowService,
    protected readonly $drawingService: DrawingService,
    protected $toolsService: ToolsService,
  ) {
    effect(() => {
      const pickedEntity = $addLineFloatingWindowService.validPickedEnttity();
      if (!pickedEntity) return;
      untracked(() => {
        this.entity.set(pickedEntity);
        this.newColor = pickedEntity.polyline?.material.getValue().color.toCssHexString();
      });
    });
  }

  // TODO: вынести все в сервис к объекту валидной сущности и отрефакторить после Саши
  nameText = signal<string>('');
  newColor: string = '';
  entity = signal<Cesium.Entity | undefined>(undefined);

  changeColor(color: Cesium.Color | string) {
    if (this.entity() === undefined) return;
    this.entity()!.properties!['lineColor'] = color;
    if (typeof color === 'string') {
      color = Cesium.Color.fromCssColorString(color);
    }
    // this.$addLineService.newCesiumColor.set(color);
  }
}
