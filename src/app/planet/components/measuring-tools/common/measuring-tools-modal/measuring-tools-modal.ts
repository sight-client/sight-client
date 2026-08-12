import {
  Component,
  ChangeDetectionStrategy,
  Input,
  TemplateRef,
  ElementRef,
  ViewChild,
  afterNextRender,
  computed,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import chalk from 'chalk';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

import { MeasuringToolsModalsService } from '@/components/measuring-tools/common/measuring-tools-modal/services/measuring-tools-modals-service/measuring-tools-modals.service';
import { getRusToolName } from '@/common/services/measure-service/measure.service';
import type { ToolName } from '@/common/services/measure-service/measure.service';

@Component({
  selector: 'measuring-tools-modal',
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, CdkDrag, CdkDragHandle],
  templateUrl: './measuring-tools-modal.html',
  styleUrl: './measuring-tools-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasuringToolsModal {
  @Input() contentTemplate: TemplateRef<any>;
  @Input() parentName: ToolName;
  @Input() modalElementRef: ElementRef;
  constructor(protected $measuringToolsModalsService: MeasuringToolsModalsService) {
    afterNextRender(() => {
      try {
        // Актуализация начального z-index модалки (значение в таблице стилей для .measuring-tools-modal)
        this.zIndexDefault = window?.getComputedStyle(this.measuringToolsModalRef?.nativeElement)
          ?.zIndex
          ? +window.getComputedStyle(this.measuringToolsModalRef.nativeElement).zIndex - 1 // "- 1" - т.к. при создании модалка имеет флаг isActive === true
          : 103;

        // Актуализация размера отступов новых модалок (определяется единожды)
        if (this.$measuringToolsModalsService.modalHeaderHeight === undefined) {
          const modalHeaderHeight = window?.getComputedStyle(
            this.measuringToolsModalHeaderRef?.nativeElement,
          )?.height
            ? window.getComputedStyle(this.measuringToolsModalHeaderRef.nativeElement).height
            : '32px';
          this.$measuringToolsModalsService.getModalHeaderHeight(modalHeaderHeight);
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }
  @ViewChild('measuringToolsModal') public measuringToolsModalRef!: ElementRef<Element>;
  protected zIndexDefault: number = 103;
  @ViewChild('measuringToolsModalHeader') public measuringToolsModalHeaderRef!: ElementRef<Element>;

  // Пересмотр индекса модалки после удаления из общего списка ее "соседей" слева (единственного вычисления parentIndex в ngOnInit недостаточно)
  protected modalIndex = computed<number>(() => {
    if (this.parentName) {
      if (this.$measuringToolsModalsService.measuringToolsModalsList().length) {
        const index = this.$measuringToolsModalsService
          .measuringToolsModalsList()
          .findIndex((item) => item?.toolName === this.parentName);
        if (index !== -1) {
          return index;
        } else {
          console.log(chalk.red(`Parent index in modal "${this.parentName}" is not valid`));
          return -1;
        }
      } else {
        console.log(chalk.red(`Modals list is empty (from "${this.parentName}" modal component)`));
        return -1;
      }
    } else {
      console.log(chalk.red(`Parent name in modal "${this.parentName}" hasn't recived`));
      return -1;
    }
  });

  // Требуется преобразование, т.к. везде сохраняюся литералы из type ToolName
  protected getRusToolName = getRusToolName;
}
