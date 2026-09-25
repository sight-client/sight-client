/*
Советы для быстрого начала работы с данной заготовкой (типового инструмента работы с картой, использующего сторы drawing.service.ts).
1. Скопировать всю текущую (обновляемую) дирректорию /drawing-tool-blank в /<project-name>/../<project-name>-blanks/<project-name> (если уже есть - перезаписать).
2. В drawing.service.ts добавить новую информацию, характерную своему инструмента (только в случае нанесения на карту его сущностей):
- имя - в массив имен drawingToolsNames;
- новый вариант для перебора - в "getRusDrawingToolName()";
- стор для групп сущностей;
- при необходимости этот стор - в эффект, контролирующий привязку сущностей к рельефу;
- флаг наличия хотя бы одной группы сущностей в сторе (плюс, применить его в вычисляемом сигнале "storesAreEmpty" в entity-rubber.service.ts);
- ссылка на стор - в объект "_allEntitiesListsLinks";
- при необходимости, условие для обработки импортируемого .kml в методе setEntitiesGroupDefaultEntity (drawings-list.service.ts).
3. Перименовать все дирретории и файлы в дирректории /tools/drawing-tools/components/drawing-tool-blank (заменить НАЧАЛО имени "drawing-tool-blank" на свое). Импорты можно не обновлять.
4. В vs code перейти в поисковую панель, ВКЛЮЧИТЬ УСЛОВИЯ ПОЛНОГО СОВПАДЕНИЯ и ДОБАВИТЬ в поле "files to include" ДИРРЕКТОРИЮ ЗАГОТОВКИ "/home/user/proj/sight/<project-name>/src/app/planet/core/tools/drawing-tools/components/своя-новая-дирректория/**".
5. Заменить на свои следующие наименования (или их части):
- "drawing-tool-blank";
- "DrawingToolBlank":
- "DrawingToolBlankService":
- "DrawingToolBlankFloatingWindow":
- "DrawingToolBlankFloatingWindowService":
- "$drawingToolBlankService":
- "$drawingToolBlankFloatingWindowService":
- "drawingToolBlankGroupsCounter":
- "'drawingToolBlank'" (замена должна совпадать с новым литералом в типе "Toolname" в drawing.service.ts):
- "drawingToolBlankList" (замена должна совпадать с новым стором в drawing.service.ts):
- "isBlanksEntityes" (замена должна совпадать с новым флагом в drawing.service.ts).
6. Изменить иконку кнопки инструмента в html данного компонента.
7. В drawing-tools.ts (или соответствующего родителя) импортировать main-компонент своего инструмента, вставить в html, создать и использовать в хэндлерах соответствующую шаблонную ссылку.
8. При необходимости добавить в tools-floating-windows.ts свои импорты в массив floatingWindowsComponents.
9. При необходимости внести свой компонент в структуру drawings-list (обеспечить, например, реактивное переменование сущности, подлет к ней и т.д).
10. При необходимости внести свой компонент в структуру drawings-list-kml.service.ts.
11. При необходимости внести свой компонент в структуру drawings-list-report.service.ts.
12. Скопировать обратно дирректорию с данной "рыбой" (в дирректорю /tools/drawing-tools/components) - для дальшейших общего пользования и обновлений.
13. Профит. Можно добавлять свою новую логику и представление.
14. Удалить данную инструкцию из этого файла (уже не нужна и "испорчена" заменами при поиске).
*/

import {
  Component,
  ChangeDetectionStrategy,
  // signal,
  // ElementRef,
  // OnInit,
  // OnDestroy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

// ИМПОРТИРОВАТЬ И ЗАПРОВАЙДИТЬ В planet.ts
import { DrawingToolBlankService } from '@/components/tools/drawing-tools/components/drawing-tool-blank/services/drawing-tool-blank-service/drawing-tool-blank.service';

// ИМПОРТИРОВАТЬ И ЗАПРОВАЙДИТЬ В tools-floating-windows.ts
// import { DrawingToolBlankFloatingWindowService } from '@/components/tools/drawing-tools/components/drawing-tool-blank/components/drawing-tool-blank-floating-window/services/drawing-tool-blank-floating-window-service/drawing-tool-blank-floating-window.service';
import {
  getRusDrawingToolName,
  type DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
// import {
//   setStartBtnVisibility,
//   getBtnVisibilityObserver,
// } from '@/components/tools/lib/buttons-subgroups-visibility';

// ИМПОРТИРОВАТЬ В tools-floating-windows.ts
// import { DrawingToolBlankFloatingWindow } from '@/components/tools/drawing-tools/components/drawing-tool-blank/components/drawing-tool-blank-floating-window/drawing-tool-blank-floating-window';

@Component({
  selector: 'drawing-tool-blank',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusDrawingToolName(this.$drawingToolBlankService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$drawingToolBlankService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$drawingToolBlankService.buttonHandler($event)"
      [disabled]="
        !this.$drawingToolBlankService.isActive() && $drawingToolBlankService.drawingsBlocker()
      "
    >
      <mat-icon>
        <!-- <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 7.5c.97 0 1.75-.78 1.75-1.75S12.97 4 12 4s-1.75.78-1.75 1.75S11.03 7.5 12 7.5M14 20v-5h1v-4.5c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2V15h1v5z"
          />
        </svg> -->
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingToolBlank {
  // implements OnInit, OnDestroy
  declare public readonly toolName: DrawingToolName;
  constructor(
    protected readonly $drawingToolBlankService: DrawingToolBlankService,
    // ВНЕДРИТЬ В tools-floating-windows.ts (вместе с компонентом плавающего окна, см. п.8):
    // protected readonly $drawingToolBlankFloatingWindowService: DrawingToolBlankFloatingWindowService,
  ) {
    this.toolName = this.$drawingToolBlankService.toolName;
  }

  // Видимость хоста задаёт панель через style.display (block / none).

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$drawingToolBlankService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$drawingToolBlankService.cancelThisTool();
  }
}
