import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DrawingToolBlankFloatingWindowService } from '@/components/tools/drawing-tools/components/drawing-tool-blank/components/drawing-tool-blank-floating-window/services/drawing-tool-blank-floating-window-service/drawing-tool-blank-floating-window.service';

import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'drawing-tool-blank-floating-window',
  imports: [FloatingWindow, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './drawing-tool-blank-floating-window.html',
  styleUrl: './drawing-tool-blank-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingToolBlankFloatingWindow {
  constructor(
    protected readonly $drawingToolBlankFloatingWindowService: DrawingToolBlankFloatingWindowService,
  ) {}
}
