import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';

// Инструменты рисования
import { DrawMarkFloatingWindow } from '@/components/tools/drawing-tools/components/draw-mark/components/draw-mark-floating-window/draw-mark-floating-window';
import { DrawMarkFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-mark/components/draw-mark-floating-window/services/draw-mark-floating-window-service/draw-mark-floating-window.service';

import { DrawLineFloatingWindow } from '@/components/tools/drawing-tools/components/draw-line/components/draw-line-floating-window/draw-line-floating-window';
import { DrawLineFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-line/components/draw-line-floating-window/services/draw-line-floating-window-service/draw-line-floating-window.service';

import { DrawRectangleFloatingWindow } from '@/components/tools/drawing-tools/components/draw-rectangle/components/draw-rectangle-floating-window/draw-rectangle-floating-window';
import { DrawRectangleFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-rectangle/components/draw-rectangle-floating-window/services/draw-rectangle-floating-window-service/draw-rectangle-floating-window.service';

import { DrawCircleFloatingWindow } from '@/components/tools/drawing-tools/components/draw-circle/components/draw-circle-floating-window/draw-circle-floating-window';
import { DrawCircleFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-circle/components/draw-circle-floating-window/services/draw-circle-floating-window-service/draw-circle-floating-window.service';

import { DrawPolygonFloatingWindow } from '@/components/tools/drawing-tools/components/draw-polygon/components/draw-polygon-floating-window/draw-polygon-floating-window';
import { DrawPolygonFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-polygon/components/draw-polygon-floating-window/services/draw-polygon-floating-window-service/draw-polygon-floating-window.service';

// Инструменты измерения
import { CalculateLineFloatingWindow } from '@/components/tools/measuring-tools/components/calculate-line/components/calculate-line-floating-window/calculate-line-floating-window';
import { CalculateLineFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-line/components/calculate-line-floating-window/services/calculate-line-floating-window-service/calculate-line-floating-window.service';

import { CalculateRectangleFloatingWindow } from '@/components/tools/measuring-tools/components/calculate-rectangle/components/calculate-rectangle-floating-window/calculate-rectangle-floating-window';
import { CalculateRectangleFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-rectangle/components/calculate-rectangle-floating-window/services/calculate-rectangle-floating-window-service/calculate-rectangle-floating-window.service';

import { CalculateCircleFloatingWindow } from '@/components/tools/measuring-tools/components/calculate-circle/components/calculate-circle-floating-window/calculate-circle-floating-window';
import { CalculateCircleFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-circle/components/calculate-circle-floating-window/services/calculate-circle-floating-window-service/calculate-circle-floating-window.service';

import { CalculatePolygonFloatingWindow } from '@/components/tools/measuring-tools/components/calculate-polygon/components/calculate-polygon-floating-window/calculate-polygon-floating-window';
import { CalculatePolygonFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-polygon/components/calculate-polygon-floating-window/services/calculate-polygon-floating-window-service/calculate-polygon-floating-window.service';

// Notice: плавающие окна пока что не используются
// Инструменты работы с камерой
// import { FlyAroundFloatingWindow } from '@/components/tools/camera-view-tools/components/fly-around/components/fly-around-floating-window/fly-around-floating-window';
// import { FlyAroundFloatingWindowService } from '@/components/tools/camera-view-tools/components/fly-around/components/fly-around-floating-window/services/fly-around-floating-window-service/fly-around-floating-window.service';

type FloatingWindowItem = {
  type: Type<unknown>;
  name: string;
};
@Component({
  selector: 'tools-floating-windows',
  providers: [
    // Инструменты рисования
    DrawMarkFloatingWindowService,
    DrawLineFloatingWindowService,
    DrawRectangleFloatingWindowService,
    DrawCircleFloatingWindowService,
    DrawPolygonFloatingWindowService,
    // Инструменты измерения
    CalculateLineFloatingWindowService,
    CalculateRectangleFloatingWindowService,
    CalculateCircleFloatingWindowService,
    CalculatePolygonFloatingWindowService,
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
  protected getFloatingWindowComponentType(windowName: string | undefined): Type<unknown> | null {
    if (windowName === undefined) return null;
    const floatingWindowItem = this.floatingWindowsComponents.find(
      (item) => item.name === windowName,
    );
    return floatingWindowItem?.type ?? null;
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
    protected readonly $drawMarkFloatingWindowService: DrawMarkFloatingWindowService,
    protected readonly $drawLineFloatingWindowService: DrawLineFloatingWindowService,
    protected readonly $drawRectangleFloatingWindowService: DrawRectangleFloatingWindowService,
    protected readonly $drawCircleFloatingWindowService: DrawCircleFloatingWindowService,
    protected readonly $drawPolygonFloatingWindowService: DrawPolygonFloatingWindowService,
    // Инструменты измерения
    protected readonly $calculateLineFloatingWindowService: CalculateLineFloatingWindowService,
    protected readonly $calculateRectangleFloatingWindowService: CalculateRectangleFloatingWindowService,
    protected readonly $calculateCircleFloatingWindowService: CalculateCircleFloatingWindowService,
    protected readonly $calculatePolygonFloatingWindowService: CalculatePolygonFloatingWindowService,
    // Notice: плавающие окна пока что не используются
    // Инструменты работы с камерой
    // protected readonly $flyAroundFloatingWindowService: FlyAroundFloatingWindowService,
  ) {
    this.floatingWindowsComponents = [
      // Инструменты рисования
      {
        type: DrawMarkFloatingWindow,
        name: this.$drawMarkFloatingWindowService.toolName,
      },
      {
        type: DrawLineFloatingWindow,
        name: this.$drawLineFloatingWindowService.toolName,
      },
      {
        type: DrawRectangleFloatingWindow,
        name: this.$drawRectangleFloatingWindowService.toolName,
      },
      {
        type: DrawCircleFloatingWindow,
        name: this.$drawCircleFloatingWindowService.toolName,
      },
      {
        type: DrawPolygonFloatingWindow,
        name: this.$drawPolygonFloatingWindowService.toolName,
      },
      // Инструменты измерения
      {
        type: CalculateLineFloatingWindow,
        name: this.$calculateLineFloatingWindowService.toolName,
      },
      {
        type: CalculateRectangleFloatingWindow,
        name: this.$calculateRectangleFloatingWindowService.toolName,
      },
      {
        type: CalculateCircleFloatingWindow,
        name: this.$calculateCircleFloatingWindowService.toolName,
      },
      {
        type: CalculatePolygonFloatingWindow,
        name: this.$calculatePolygonFloatingWindowService.toolName,
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
