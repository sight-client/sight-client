import { Component, ChangeDetectionStrategy, HostListener, ViewChild } from '@angular/core';

import { MeasureService } from '@/common/services/measure-service/measure.service';

import { AddMark } from '@/components/measuring-tools/components/add-mark/add-mark';
import { LinearMeasurements } from '@/components/measuring-tools/components/linear-measurements/linear-measurements';
import { EraseEntity } from '@/components/measuring-tools/components/erase-entity/erase-entity';
import { ClearMeasurements } from '@/components/measuring-tools/components/clear-measurements/clear-measurements';

@Component({
  selector: 'measuring-tools',
  imports: [AddMark, LinearMeasurements, EraseEntity, ClearMeasurements],
  template: `
    <div class="measuring-tools-container">
      <add-mark />
      <linear-measurements />
      <div class="gag"></div>
      <erase-entity />
      <clear-measurements />
    </div>
  `,
  styleUrl: './measuring-tools.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasuringTools {
  constructor(protected $measureService: MeasureService) {}
  @ViewChild(AddMark) addMarkRef: AddMark;
  @ViewChild(LinearMeasurements) linearMeasurementsRef: LinearMeasurements;

  @ViewChild(EraseEntity) eraseEntityRef: EraseEntity;

  @HostListener('document:keyup.escape')
  handleForEsc(): void {
    // @ts-ignore
    if (!this.$measureService.handler()?._initializer) return;
    // @ts-ignore
    if (this.$measureService.handler()._initializer === 'add-mark') {
      this.addMarkRef.cancelByEsc();
    }
    // @ts-ignore
    else if (this.$measureService.handler()._initializer === 'linear-measurements') {
      this.linearMeasurementsRef.cancelByEsc();
    }

    // @ts-ignore
    else if (this.$measureService.handler()._initializer === 'erase-entity') {
      this.eraseEntityRef.cancelByEsc();
    }
  }
}
