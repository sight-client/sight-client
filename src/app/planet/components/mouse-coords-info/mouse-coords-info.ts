import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DeviceService } from '@global/services/device-service/device.service';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';

import type { CRS } from '@/common/lib/coord-sistems.lib';

@Component({
  selector: 'mouse-coords-info',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule],
  templateUrl: './mouse-coords-info.html',
  styleUrl: './mouse-coords-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MouseCoordsInfo {
  constructor(
    private $viewerService: ViewerService,
    protected $mouseCoordsService: MouseCoordsService,
    private $deviceService: DeviceService,
  ) {
    effect(() => {
      if (
        this.$viewerService.viewerHasLoaded() &&
        this.$mouseCoordsService.underMouseEntityHasLoaded()
      ) {
        if (!this.$deviceService.isMobile) {
          this.mouseMoveSubscription = this.getMouseMoveSubscription();
        }
      }
    });
  }

  protected mouseCoordsDescription = computed<{
    latitude: string;
    longitude: string;
    heigh: string;
  }>(() => {
    return {
      latitude: this.$mouseCoordsService.latitudeDescription(),
      longitude: this.$mouseCoordsService.longitudeDescription(),
      heigh: this.$mouseCoordsService.heightDescription(),
    };
  });
  protected crsVarsArr: Array<CRS> = ['WGS-84', 'СК-42 м', 'СК-42 °', 'ПЗ-90.11'];
  public selectedCRS = signal<CRS>('WGS-84');

  // Подписка на движение курсора мыши по холсту
  declare private mouseMoveSubscription: Subscription;
  private getMouseMoveSubscription(): Subscription {
    try {
      const cesiumContainer: Element = this.$viewerService.viewer.container;
      if (!cesiumContainer)
        throw new Error('Cesium container is not defined. Mouse move subscription was failed!');
      const mouseMove$: Observable<Event> = fromEvent(cesiumContainer, 'mousemove');
      return mouseMove$.subscribe((event) => {
        this.setCoordsWindowPosition(event as MouseEvent);
      });
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  protected outOfScreen = signal<boolean>(false);
  // Сдвиг поля с координатами возле курсора
  protected left: string = 'calc(50% + 6px)';
  protected top: string = 'calc(50% + 14px)';
  private maxFieldWidth: number = 0;
  private setCoordsWindowPosition(event: MouseEvent): void {
    try {
      if (!this.maxFieldWidth) {
        let fieldMaxWidth: number = 110;
        const field: Element | undefined = document.getElementsByClassName(
          'mouse-coords-cursor-field',
        )?.[0];
        if (field) {
          const newFeldMaxWidth = +getComputedStyle(field)
            ?.getPropertyValue('--cursor-field-max-width')
            ?.slice(0, -2);
          if (isFinite(newFeldMaxWidth) && newFeldMaxWidth > fieldMaxWidth)
            fieldMaxWidth = newFeldMaxWidth;
        }
        this.maxFieldWidth = fieldMaxWidth;
      }

      this.left = `${event.pageX + 6}px`;
      this.top = `${event.pageY + 14}px`;
      if (
        event.clientX < 0 ||
        event.clientX + 6 + 10 + this.maxFieldWidth > document.documentElement.clientWidth ||
        event.clientY < 0 ||
        event.clientY + 14 + 10 + 50 > document.documentElement.clientHeight
      ) {
        if (!this.outOfScreen()) this.outOfScreen.set(true);
        return;
      } else {
        if (this.outOfScreen()) this.outOfScreen.set(false);
      }
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.mouseMoveSubscription) {
      this.mouseMoveSubscription.unsubscribe();
    }
  }

  protected cursorDescIsChecked = signal<boolean>(false);
  protected toggleMouseCoordsFieldDisplay(): void {
    this.cursorDescIsChecked.set(!this.cursorDescIsChecked());
  }
}
