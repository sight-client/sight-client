import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CircleAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/circle-area-measurements/components/circle-area-measurements-floating-window/services/circle-area-measurements-floating-window-service/circle-area-measurements-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'circle-area-measurements-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './circle-area-measurements-floating-window.html',
  styleUrl: './circle-area-measurements-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleAreaMeasurementsFloatingWindow {
  constructor(
    protected readonly $circleAreaMeasurementsFloatingWindowService: CircleAreaMeasurementsFloatingWindowService,
    protected readonly $measureService: MeasureService,
    protected $toolsService: ToolsService,
  ) {}
}
