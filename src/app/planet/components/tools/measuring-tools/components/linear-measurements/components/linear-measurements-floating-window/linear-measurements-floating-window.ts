import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { LinearMeasurementsService } from '@/components/tools/measuring-tools/components/linear-measurements/services/linear-measurements-service/linear-measurements.service';
import { LinearMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/linear-measurements/components/linear-measurements-floating-window/services/linear-measurements-floating-window-service/linear-measurements-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'linear-measurements-floating-window',
  imports: [
    FloatingWindow,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './linear-measurements-floating-window.html',
  styleUrl: './linear-measurements-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinearMeasurementsFloatingWindow {
  constructor(
    protected readonly $linearMeasurementsService: LinearMeasurementsService,
    protected readonly $linearMeasurementsFloatingWindowService: LinearMeasurementsFloatingWindowService,
    protected readonly $measureService: MeasureService,
    protected $toolsService: ToolsService,
  ) {}
}
