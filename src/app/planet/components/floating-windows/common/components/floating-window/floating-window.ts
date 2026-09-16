import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  OnInit,
  Input,
  TemplateRef,
  ElementRef,
  ViewChild,
  computed,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import chalk from 'chalk';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import type { WindowName } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import {
  drawingToolsNames,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import {
  measuringToolsNames,
  getRusMeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';

@Component({
  selector: 'floating-window',
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './floating-window.html',
  styleUrl: './floating-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingWindow implements OnInit {
  @Input() contentTemplate: TemplateRef<any>;
  @Input() parentName: WindowName;
  @Input() customTop?: number; // пропс для плавающих окон, не относящихся к инструментам правой панели
  @Input() customRight?: number; // -//-//-//-

  // @ViewChild('floatingWindow') private floatingWindowRef!: ElementRef<Element>;
  protected zIndexWhenActive: number = 104; // при создании объект окна имеет флаг isActive === true, поэтому устанавливается повышенный z-index (пересчитывается при изменении флага)
  @ViewChild('floatingWindowHeader') private floatingWindowHeaderRef!: ElementRef<Element>;

  constructor(protected $floatingWindowsService: FloatingWindowsService) {
    afterNextRender(() => {
      try {
        // Актуализация начального z-index окна (значение в таблице стилей для .floating-window)
        // !Конфликтует с импортами из других форматов
        // this.zIndexWhenActive = window?.getComputedStyle(this.floatingWindowRef?.nativeElement)
        //   ?.zIndex
        //   ? +window.getComputedStyle(this.floatingWindowRef.nativeElement).zIndex
        //   : 104;
        // Актуализация размера отступов новых окон (определяется единожды)
        if (this.$floatingWindowsService.windowHeaderHeight === undefined) {
          const windowHeaderHeight = window?.getComputedStyle(
            this.floatingWindowHeaderRef?.nativeElement,
          )?.height
            ? window.getComputedStyle(this.floatingWindowHeaderRef.nativeElement).height
            : '32px';
          this.$floatingWindowsService.getWindowHeaderHeight(windowHeaderHeight);
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }

  declare protected isDrawingTool: boolean;
  declare protected isMeasuringTool: boolean;
  declare protected headerName: string;

  ngOnInit() {
    // Определение соответствия к/л группе инструментов
    this.isDrawingTool = drawingToolsNames.includes(this.parentName as DrawingToolName);
    this.isMeasuringTool = measuringToolsNames.includes(this.parentName as MeasuringToolName);

    // Русификация имени инструмента
    this.headerName = this.normalizeName(this.parentName);
  }

  // Требуется преобразование, т.к. для инструментов работы с картой везде сохраняюся литералы из type типа "ToolName"
  protected normalizeName = (name: WindowName): string => {
    if (this.isDrawingTool) {
      return getRusDrawingToolName(name);
    } else if (this.isMeasuringTool) {
      return getRusMeasuringToolName(name);
    } else if (name === 'terrainAnalysis') {
      return 'Анализ рельефа';
    } else return name;
  };

  // Пересмотр индекса модалки после удаления из общего списка ее "соседей" слева (единственного вычисления parentIndex в ngOnInit недостаточно)
  protected windowIndex = computed<number>(() => {
    if (this.parentName) {
      if (this.$floatingWindowsService.floatingWindowsList().length) {
        const index = this.$floatingWindowsService
          .floatingWindowsList()
          .findIndex((item) => item?.windowName === this.parentName);
        if (index !== -1) {
          return index;
        } else {
          console.log(chalk.red(`Parent index in Window "${this.parentName}" is not valid`));
          return -1;
        }
      } else {
        console.log(
          chalk.red(`Floating windows list is empty (from "${this.parentName}" window component)`),
        );
        return -1;
      }
    } else {
      console.log(chalk.red(`Parent name in window "${this.parentName}" hasn't recived`));
      return -1;
    }
  });

  protected closeOrHide(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.isMeasuringTool || this.parentName === 'terrainAnalysis') {
      this.$floatingWindowsService.deleteWindowItem(this.parentName);
    } else this.$floatingWindowsService.hideWindow(this.windowIndex());
  }
}
