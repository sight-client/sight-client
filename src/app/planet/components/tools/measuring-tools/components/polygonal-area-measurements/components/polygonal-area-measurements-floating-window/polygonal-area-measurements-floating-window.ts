import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { PolygonalAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/components/polygonal-area-measurements-floating-window/services/polygonal-area-measurements-floating-window-service/polygonal-area-measurements-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'polygonal-area-measurements-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './polygonal-area-measurements-floating-window.html',
  styleUrl: './polygonal-area-measurements-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolygonalAreaMeasurementsFloatingWindow {
  constructor(
    protected readonly $polygonalAreaMeasurementsFloatingWindowService: PolygonalAreaMeasurementsFloatingWindowService,
    protected readonly $measureService: MeasureService,
    protected $toolsService: ToolsService,
  ) {}
}
