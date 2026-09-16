import { Component, ChangeDetectionStrategy } from '@angular/core';
// import chalk from 'chalk';

// import { MatInputModule } from '@angular/material/input';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';

// import { FlyAroundFloatingWindowService } from '@/components/tools/camera-tools/components/fly-around/components/fly-around-floating-window/services/fly-around-floating-window-service/fly-around-floating-window.service';

// import { FloatingWindow } from '@/components/floating-windows/common/components/floating-window/floating-window';

@Component({
  selector: 'fly-around-floating-window',
  imports: [
    // FloatingWindow,
    // MatButtonModule,
    // MatIconModule,
    // MatCardModule,
    // MatInputModule,
  ],
  templateUrl: './fly-around-floating-window.html',
  styleUrl: './fly-around-floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlyAroundFloatingWindow {
  // constructor(protected readonly $flyAroundFloatingWindowService: FlyAroundFloatingWindowService) {}
}
