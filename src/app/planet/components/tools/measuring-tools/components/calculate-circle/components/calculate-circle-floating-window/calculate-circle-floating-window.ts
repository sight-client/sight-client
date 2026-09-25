import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CalculateCircleFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-circle/components/calculate-circle-floating-window/services/calculate-circle-floating-window-service/calculate-circle-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'calculate-circle-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './calculate-circle-floating-window.html',
  styleUrl: './calculate-circle-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculateCircleFloatingWindow {
  constructor(
    protected readonly $calculateCircleFloatingWindowService: CalculateCircleFloatingWindowService,
    protected readonly $measureService: MeasureService,
    protected $toolsService: ToolsService,
  ) {}
}
