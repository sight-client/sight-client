import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { RectangleAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/components/rectangle-area-measurements-floating-window/services/rectangle-area-measurements-floating-window-service/rectangle-area-measurements-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'rectangle-area-measurements-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './rectangle-area-measurements-floating-window.html',
  styleUrl: './rectangle-area-measurements-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RectangleAreaMeasurementsFloatingWindow {
  constructor(
    protected readonly $rectangleAreaMeasurementsFloatingWindowService: RectangleAreaMeasurementsFloatingWindowService,
    protected readonly $measureService: MeasureService,
    protected $toolsService: ToolsService,
  ) {}
}
