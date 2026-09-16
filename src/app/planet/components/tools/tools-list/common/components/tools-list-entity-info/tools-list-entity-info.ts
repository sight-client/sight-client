import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import chalk from 'chalk';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';

@Component({
  selector: 'tools-list-entity-info',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="tools-list-entity-info">
      <span
        class="tools-list-entity-info-text"
        #itemName
        [matTooltip]="
          itemName.scrollHeight > itemName.offsetHeight
            ? getDescription(objInCollection, forcedName)
            : ''
        "
        matTooltipShowDelay="1000"
        (click)="clickCallback(callback, callbackArgs)"
        >{{ getDescription(objInCollection, forcedName) }}
      </span>
      @if (objInCollection.defaultEntity?.id?.includes('-line-mostDetailed-')) {
        <mat-icon
          class="tools-list-entity-info-text-most-detailed-icon"
          aria-hidden="false"
          aria-label="Most detailed"
          matTooltip="Рассчитано с учетом рельефа"
          matTooltipShowDelay="1000"
          >filter_hdr</mat-icon
        >
      }
    </div>
  `,
  styleUrl: '../../../tools-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsListEntityInfo implements OnInit, OnDestroy {
  @Input() objInCollection: EntitiesGroup;
  @Input() forcedName?: string;
  @Input() callback?: Function;
  @Input() callbackArgs?: Array<any>;

  @Output() counterChangeEmitter = new EventEmitter<number>();
  ngOnInit() {
    this.counterChangeEmitter.emit(1);
  }
  ngOnDestroy() {
    this.counterChangeEmitter.emit(-1);
  }

  protected getDescription(
    objInCollection: EntitiesGroup,
    forcedName?: string,
  ): string | undefined {
    try {
      if (forcedName && typeof forcedName === 'string') return forcedName;
      if (objInCollection?.defaultEntity?.name) {
        return objInCollection.defaultEntity.name;
      }
      if (objInCollection?.defaultEntity?.id) return `id: ${objInCollection.defaultEntity.id}`;
      if (objInCollection?.groupId) return `group id: ${objInCollection.groupId}`;
      if (
        objInCollection?.entitiesList?.length &&
        objInCollection?.entitiesList[objInCollection.entitiesList.length - 1]?.id
      )
        return `last entity id: ${objInCollection.groupId}`;
      return 'description error';
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return 'description error';
    }
  }

  protected clickCallback(callback?: Function, callbackArgs?: Array<any>): boolean {
    try {
      // Всплытие события клика не перехватывать! (используется в родителе для обновления newPickedEntity)
      if (callback && typeof callback === 'function') {
        if (callbackArgs && callbackArgs?.length) {
          console.log('callbackArgs :>> ', callbackArgs);
          callback(...callbackArgs);
        } else callback();
        return true;
      } else return false;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
}
