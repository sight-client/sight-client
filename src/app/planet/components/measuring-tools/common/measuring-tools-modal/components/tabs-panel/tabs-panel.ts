import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { getRusToolName } from '@/common/services/measure-service/measure.service';
import { MeasuringToolsModalsService } from '@/components/measuring-tools/common/measuring-tools-modal/services/measuring-tools-modals-service/measuring-tools-modals.service';

@Component({
  selector: 'tabs-panel',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './tabs-panel.html',
  styleUrl: './tabs-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPanel {
  constructor(protected $measuringToolsModalsService: MeasuringToolsModalsService) {}
  protected getRusToolName = getRusToolName;
}
