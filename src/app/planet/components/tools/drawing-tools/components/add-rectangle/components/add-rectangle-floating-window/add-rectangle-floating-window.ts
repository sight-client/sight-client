import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddRectangleFloatingWindowService } from '@/components/tools/drawing-tools/components/add-rectangle/components/add-rectangle-floating-window/services/add-rectangle-floating-window-service/add-rectangle-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'add-rectangle-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './add-rectangle-floating-window.html',
  styleUrl: './add-rectangle-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRectangleFloatingWindow {
  constructor(
    protected readonly $addRectangleFloatingWindowService: AddRectangleFloatingWindowService,
    protected readonly $drawingService: DrawingService,
    protected $toolsService: ToolsService,
  ) {}
}
