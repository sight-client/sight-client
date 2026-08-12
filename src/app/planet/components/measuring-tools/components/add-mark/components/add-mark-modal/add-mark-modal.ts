import { Component, ChangeDetectionStrategy, computed, linkedSignal } from '@angular/core';
// import chalk from 'chalk';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import * as Cesium from 'cesium';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import type { ToolName } from '@/common/services/measure-service/measure.service';
// import type { CRS } from '@/common/lib/coord-sistems.lib';
// import { MeasuringToolsModalsService } from '@/components/measuring-tools/common/measuring-tools-modal/services/measuring-tools-modals-service/measuring-tools-modals.service';

import { MeasuringToolsModal } from '@/components/measuring-tools/common/measuring-tools-modal/measuring-tools-modal';

@Component({
  selector: 'add-mark-modal',
  imports: [MeasuringToolsModal, MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  templateUrl: './add-mark-modal.html',
  styleUrl: './add-mark-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMarkModal {
  constructor(
    private $viewerService: ViewerService,
    // private $measuringToolsModalsService: MeasuringToolsModalsService,
  ) {}

  protected readonly parentName: ToolName = 'addMark';

  // Notice: pickedEntity также обновляется при каждом успешном окончании сценария использования инструмента (заложено в функциях measure.service.ts)
  private pickedEntity = computed<Cesium.Entity | undefined>(() => {
    // @ts-ignore
    if (this.$viewerService.viewer?.pickedEntity?.()?.toolName === this.parentName) {
      return this.$viewerService.viewer?.pickedEntity?.();
    } else return undefined;
  });
  protected validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>(
    {
      source: this.pickedEntity,
      computation(newVal, prevVal) {
        return newVal !== undefined ? newVal : prevVal?.value; // notice: prevVal?.source - предыдущее значения source-сигнала (не текущего linkedSignal)
        // Notice: computation не видит контекст компонента (если нужен - можно использовать значение linkedSignal в виде результата работы метода компонента)
        // return newVal?.toolName === this.parentName ? newVal : prevVal?.value;
      },
    },
  );
}
