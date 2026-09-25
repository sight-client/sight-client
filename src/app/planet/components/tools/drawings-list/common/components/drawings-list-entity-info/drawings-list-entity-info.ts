import { reportError } from '@global/lib/report-error.lib';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';

@Component({
  selector: 'drawings-list-entity-info',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="drawings-list-entity-info">
      <span
        class="drawings-list-entity-info-text"
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
          class="drawings-list-entity-info-text-most-detailed-icon"
          aria-hidden="false"
          aria-label="Most detailed"
          matTooltip="Рассчитано с учетом рельефа"
          matTooltipShowDelay="1000"
          >filter_hdr</mat-icon
        >
      }
    </div>
  `,
  styleUrl: '../../../drawings-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingsListEntityInfo implements OnInit, OnDestroy {
  @Input() objInCollection: EntitiesGroup;
  @Input() forcedName?: string;
  @Input() callback?: (...args: readonly unknown[]) => void;
  @Input() callbackArgs?: readonly unknown[];

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
      reportError(error);
      return 'description error';
    }
  }

  protected clickCallback(
    callback?: (...args: readonly unknown[]) => void,
    callbackArgs?: readonly unknown[],
  ): boolean {
    try {
      // Всплытие события клика не перехватывать! (используется в родителе для обновления newPickedEntity)
      if (callback && typeof callback === 'function') {
        if (callbackArgs && callbackArgs?.length) {
          callback(...callbackArgs);
        } else callback();
        return true;
      } else return false;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }
}
