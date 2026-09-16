import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import type { WindowName } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import {
  drawingToolsNames,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import {
  measuringToolsNames,
  getRusMeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';

@Component({
  selector: 'floating-windows-tabs-panel',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './floating-windows-tabs-panel.html',
  styleUrl: './floating-windows-tabs-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingWindowTabsPanel {
  constructor(protected $floatingWindowsService: FloatingWindowsService) {}

  protected normalizeName(name: WindowName) {
    if (drawingToolsNames.includes(name as DrawingToolName)) {
      return getRusDrawingToolName(name);
    } else if (measuringToolsNames.includes(name as MeasuringToolName)) {
      return getRusMeasuringToolName(name);
    } else if (name === 'terrainAnalysis') {
      return 'Анализ рельефа';
    } else return name;
  }

  protected willClose(name: WindowName): boolean {
    if (measuringToolsNames.includes(name as MeasuringToolName) || name === 'terrainAnalysis') {
      return true;
    } else return false;
  }
}
