import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ToolsFloatingWindows } from '@/components/tools/tools-floating-windows/tools-floating-windows';

@Component({
  selector: 'floating-windows-container',
  imports: [ToolsFloatingWindows],
  template: ` <div class="main-floating-windows-container"><tools-floating-windows /></div> `,
  styleUrl: './floating-windows-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingWindowsContainer {}
