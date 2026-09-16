import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddCircleFloatingWindowService } from '@/components/tools/drawing-tools/components/add-circle/components/add-circle-floating-window/services/add-circle-floating-window-service/add-circle-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'add-circle-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './add-circle-floating-window.html',
  styleUrl: './add-circle-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCircleFloatingWindow {
  constructor(
    protected readonly $addcircleFloatingWindowService: AddCircleFloatingWindowService,
    protected readonly $drawingService: DrawingService,
    protected $toolsService: ToolsService,
  ) {}
}
