import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';

// Инструменты рисования
import { AddMarkFloatingWindow } from '@/components/tools/drawing-tools/components/add-mark/components/add-mark-floating-window/add-mark-floating-window';
import { AddMarkFloatingWindowService } from '@/components/tools/drawing-tools/components/add-mark/components/add-mark-floating-window/services/add-mark-floating-window-service/add-mark-floating-window.service';

import { AddLineFloatingWindow } from '@/components/tools/drawing-tools/components/add-line/components/add-line-floating-window/add-line-floating-window';
import { AddLineFloatingWindowService } from '@/components/tools/drawing-tools/components/add-line/components/add-line-floating-window/services/add-line-floating-window-service/add-line-floating-window.service';

import { AddRectangleFloatingWindow } from '@/components/tools/drawing-tools/components/add-rectangle/components/add-rectangle-floating-window/add-rectangle-floating-window';
import { AddRectangleFloatingWindowService } from '@/components/tools/drawing-tools/components/add-rectangle/components/add-rectangle-floating-window/services/add-rectangle-floating-window-service/add-rectangle-floating-window.service';

import { AddCircleFloatingWindow } from '@/components/tools/drawing-tools/components/add-circle/components/add-circle-floating-window/add-circle-floating-window';
import { AddCircleFloatingWindowService } from '@/components/tools/drawing-tools/components/add-circle/components/add-circle-floating-window/services/add-circle-floating-window-service/add-circle-floating-window.service';

import { AddPolygonFloatingWindow } from '@/components/tools/drawing-tools/components/add-polygon/components/add-polygon-floating-window/add-polygon-floating-window';
import { AddPolygonFloatingWindowService } from '@/components/tools/drawing-tools/components/add-polygon/components/add-polygon-floating-window/services/add-polygon-floating-window-service/add-polygon-floating-window.service';

// Инструменты измерения
import { LinearMeasurementsFloatingWindow } from '@/components/tools/measuring-tools/components/linear-measurements/components/linear-measurements-floating-window/linear-measurements-floating-window';
import { LinearMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/linear-measurements/components/linear-measurements-floating-window/services/linear-measurements-floating-window-service/linear-measurements-floating-window.service';

import { RectangleAreaMeasurementsFloatingWindow } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/components/rectangle-area-measurements-floating-window/rectangle-area-measurements-floating-window';
import { RectangleAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/components/rectangle-area-measurements-floating-window/services/rectangle-area-measurements-floating-window-service/rectangle-area-measurements-floating-window.service';

import { CircleAreaMeasurementsFloatingWindow } from '@/components/tools/measuring-tools/components/circle-area-measurements/components/circle-area-measurements-floating-window/circle-area-measurements-floating-window';
import { CircleAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/circle-area-measurements/components/circle-area-measurements-floating-window/services/circle-area-measurements-floating-window-service/circle-area-measurements-floating-window.service';

import { PolygonalAreaMeasurementsFloatingWindow } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/components/polygonal-area-measurements-floating-window/polygonal-area-measurements-floating-window';
import { PolygonalAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/components/polygonal-area-measurements-floating-window/services/polygonal-area-measurements-floating-window-service/polygonal-area-measurements-floating-window.service';

// Notice: плавающие окна пока что не используются
// Инструменты работы с камерой
// import { FlyAroundFloatingWindow } from '@/components/tools/camera-tools/components/fly-around/components/fly-around-floating-window/fly-around-floating-window';
// import { FlyAroundFloatingWindowService } from '@/components/tools/camera-tools/components/fly-around/components/fly-around-floating-window/services/fly-around-floating-window-service/fly-around-floating-window.service';

type FloatingWindowItem = {
  type: any; // типы импортируемых компонентов плавающих окон
  name: string;
};
@Component({
  selector: 'tools-floating-windows',
  providers: [
    // Инструменты рисования
    AddMarkFloatingWindowService,
    AddLineFloatingWindowService,
    AddRectangleFloatingWindowService,
    AddCircleFloatingWindowService,
    AddPolygonFloatingWindowService,
    // Инструменты измерения
    LinearMeasurementsFloatingWindowService,
    RectangleAreaMeasurementsFloatingWindowService,
    CircleAreaMeasurementsFloatingWindowService,
    PolygonalAreaMeasurementsFloatingWindowService,
    // Notice: плавающие окна пока что не используются
    // Инструменты работы с камерой
    // FlyAroundFloatingWindowService,
  ],
  imports: [CommonModule],
  templateUrl: './tools-floating-windows.html',
  styleUrls: [
    '../../floating-windows/floating-windows-container/floating-windows-container.scss',
    './tools-floating-windows.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsFloatingWindows {
  declare protected floatingWindowsComponents: Array<FloatingWindowItem>;
  protected getFloatingWindowComponentType(windowName: string | undefined) {
    if (windowName === undefined) return undefined;
    const floatingWindowItem = this.floatingWindowsComponents.find(
      (item) => item.name === windowName,
    );
    return floatingWindowItem?.type;
  }
  // Нужен только для корректной работы leave animation (на "обертке" компонента под @if)
  protected checkFloatingWindow(windowName: string | undefined) {
    if (windowName === undefined) return undefined;
    const index = this.floatingWindowsComponents.findIndex((item) => item.name === windowName);
    if (index !== -1) return true;
    else return false;
  }
  constructor(
    protected readonly $floatingWindowsService: FloatingWindowsService,
    // // Инструменты рисования
    protected readonly $addMarkFloatingWindowService: AddMarkFloatingWindowService,
    protected readonly $addLineFloatingWindowService: AddLineFloatingWindowService,
    protected readonly $addRectangleFloatingWindowService: AddRectangleFloatingWindowService,
    protected readonly $addCircleFloatingWindowService: AddCircleFloatingWindowService,
    protected readonly $addPolygonFloatingWindowService: AddPolygonFloatingWindowService,
    // Инструменты измерения
    protected readonly $linearMeasurementsFloatingWindowService: LinearMeasurementsFloatingWindowService,
    protected readonly $rectangleAreaMeasurementsFloatingWindowService: RectangleAreaMeasurementsFloatingWindowService,
    protected readonly $circleAreaMeasurementsFloatingWindowService: CircleAreaMeasurementsFloatingWindowService,
    protected readonly $polygonalAreaMeasurementsFloatingWindowService: PolygonalAreaMeasurementsFloatingWindowService,
    // Notice: плавающие окна пока что не используются
    // Инструменты работы с камерой
    // protected readonly $flyAroundFloatingWindowService: FlyAroundFloatingWindowService,
  ) {
    this.floatingWindowsComponents = [
      // Инструменты рисования
      {
        type: AddMarkFloatingWindow,
        name: this.$addMarkFloatingWindowService.toolName,
      },
      {
        type: AddLineFloatingWindow,
        name: this.$addLineFloatingWindowService.toolName,
      },
      {
        type: AddRectangleFloatingWindow,
        name: this.$addRectangleFloatingWindowService.toolName,
      },
      {
        type: AddCircleFloatingWindow,
        name: this.$addCircleFloatingWindowService.toolName,
      },
      {
        type: AddPolygonFloatingWindow,
        name: this.$addPolygonFloatingWindowService.toolName,
      },
      // Инструменты измерения
      {
        type: LinearMeasurementsFloatingWindow,
        name: this.$linearMeasurementsFloatingWindowService.toolName,
      },
      {
        type: RectangleAreaMeasurementsFloatingWindow,
        name: this.$rectangleAreaMeasurementsFloatingWindowService.toolName,
      },
      {
        type: CircleAreaMeasurementsFloatingWindow,
        name: this.$circleAreaMeasurementsFloatingWindowService.toolName,
      },
      {
        type: PolygonalAreaMeasurementsFloatingWindow,
        name: this.$polygonalAreaMeasurementsFloatingWindowService.toolName,
      },
      // Notice: плавающие окна пока что не используются
      // Инструменты работы с камерой
      // {
      //   type: FlyAroundFloatingWindow,
      //   name: this.$flyAroundFloatingWindowService.toolName,
      // },
    ];
  }
}
