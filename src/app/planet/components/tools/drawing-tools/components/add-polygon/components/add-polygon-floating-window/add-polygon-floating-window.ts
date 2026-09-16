import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddPolygonFloatingWindowService } from '@/components/tools/drawing-tools/components/add-polygon/components/add-polygon-floating-window/services/add-polygon-floating-window-service/add-polygon-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'add-polygon-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './add-polygon-floating-window.html',
  styleUrl: './add-polygon-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPolygonFloatingWindow {
  constructor(
    protected readonly $addPolygonFloatingWindowService: AddPolygonFloatingWindowService,
    protected readonly $drawingService: DrawingService,
    protected $toolsService: ToolsService,
  ) {}
}
