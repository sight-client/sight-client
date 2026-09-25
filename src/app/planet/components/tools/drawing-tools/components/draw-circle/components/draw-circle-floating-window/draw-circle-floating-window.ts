import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawCircleFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-circle/components/draw-circle-floating-window/services/draw-circle-floating-window-service/draw-circle-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'draw-circle-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './draw-circle-floating-window.html',
  styleUrl: './draw-circle-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawCircleFloatingWindow {
  constructor(
    protected readonly $addcircleFloatingWindowService: DrawCircleFloatingWindowService,
    protected readonly $drawingService: DrawingService,
    protected $toolsService: ToolsService,
  ) {}
}
