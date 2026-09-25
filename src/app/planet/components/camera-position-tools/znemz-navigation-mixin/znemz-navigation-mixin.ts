import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  Injector,
  runInInjectionContext,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import * as Cesium from 'cesium';
import ViewerCesiumNavigationMixin from '@znemz/cesium-navigation';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';

function elementByClass(className: string, index = 0): HTMLElement | undefined {
  const el = document.getElementsByClassName(className).item(index);
  return el instanceof HTMLElement ? el : undefined;
}

function elementChild(parent: HTMLElement, index: number): HTMLElement | undefined {
  const child = parent.children.item(index);
  return child instanceof HTMLElement ? child : undefined;
}

@Component({
  selector: 'znemz-navigation-mixin',
  imports: [],
  template: '<div id="navigationMixinWrapper"></div>',
  styleUrl: './znemz-navigation-mixin.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZnemzNavigationMixin {
  constructor(
    private $viewerService: ViewerService,
    private $checkMobileDeviceService: CheckMobileDeviceService,
    private injector: Injector,
  ) {
    effect(() => {
      if (this.$viewerService.cameraIsFlyingAround() === true) {
        elementByClass('navigation-controls')?.classList.add('navigation-controls-blocked');
        elementByClass('compass')?.classList.add('compass-blocked');
      } else {
        elementByClass('navigation-controls')?.classList.remove('navigation-controls-blocked');
        elementByClass('compass')?.classList.remove('compass-blocked');
      }
    });

    effect((onCleanup) => {
      if (this.$viewerService.viewerHasLoaded()) {
        const detach = untracked(() => {
          this.setNavMixin();
          this.replaceNavMixin();
          this.translateNavMixin();
          this.getUsability();
          this.getCursorListeners();
          const detachTooltips = this.bindNavMixinTooltips();
          const wrapper = document.getElementById('navigationMixinWrapper');
          const detachTouch =
            this.$checkMobileDeviceService.isMobile && wrapper
              ? attachNavigationTouchBridge(wrapper)
              : undefined;
          return () => {
            detachTouch?.();
            detachTooltips();
          };
        });
        onCleanup(detach);
      } else {
        const navigationMixinDiv = elementByClass('cesium-widget-cesiumNavigationContainer');
        navigationMixinDiv?.remove();
      }
    });
  }

  private setNavMixin(): void {
    const mixinOptions: {
        enableCompass: boolean;
        enableCompassOuterRing: boolean;
        enableZoomControls: boolean;
        defaultResetView: Cesium.Cartographic;
        enableDistanceLegend: boolean;
        distanceLabelFormatter: (length: number, units: string) => string;
      } = {
        enableCompass: true,
        enableCompassOuterRing: true,
        enableZoomControls: true,
        defaultResetView: Cesium.Cartographic.fromCartesian(
          this.$viewerService.startCamDestination,
        ),
        enableDistanceLegend: false,
        distanceLabelFormatter: this.distanceLabelFormatter,
      };
      /* Подключение миксина к вьюеру (в #cesiumContainer) - по умолчанию в новый контейнер класса 'cesium-widget-[контейнер миксина]',
          который состоит из #distanceLegendDiv (с .distance-legend) и #navigationDiv (с .compass и .navigation-controls) */
      this.$viewerService.viewer.extend(ViewerCesiumNavigationMixin, mixinOptions);
  }

  private distanceLabelFormatter(length: number, units: string): string {
    const UNITS_TO_ABBREVIATION: {
        [key: string]: string;
      } = {
        meters: 'м',
        kilometers: 'км',
      };
      const fixed = 0;
      const unitsRes = length < 1 ? 'meters' : units;
      const lengthRes = length < 1 ? Math.round(length * 1000) : length;
      return `${lengthRes.toFixed(fixed)} ${UNITS_TO_ABBREVIATION[unitsRes]}`;
  }

  private replaceNavMixin(): void {
    document.getElementById('navigationDiv')?.classList.add('navigationMixinDiv');
    const navigationMixinDiv = elementByClass('cesium-widget-cesiumNavigationContainer');
    const wrapper = document.getElementById('navigationMixinWrapper');
    if (navigationMixinDiv && wrapper) {
      wrapper.appendChild(navigationMixinDiv);
    }
  }

  private translateNavMixin(): void {
    elementByClass('compass-outer-ring')?.removeAttribute('title');
    elementByClass('compass')?.removeAttribute('title');
    const controls = elementByClass('navigation-controls');
    if (!controls) return;
    elementChild(controls, 0)?.removeAttribute('title');
    elementChild(controls, 1)?.removeAttribute('title');
    elementChild(controls, 2)?.removeAttribute('title');
  }

  private bindNavMixinTooltips(): () => void {
    const root = document.getElementById('navigationMixinWrapper');
    if (!root) {
      return () => {};
    }
    const tooltips: MatTooltip[] = [];
    const bind = (
      element: Element | null,
      message: string,
      touchGestures: 'auto' | 'off',
    ): void => {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      const tooltip = runInInjectionContext(
        Injector.create({
          parent: this.injector,
          providers: [{ provide: ElementRef, useValue: new ElementRef(element) }],
        }),
        () => new MatTooltip(),
      );
      tooltip.position = 'left';
      tooltip.showDelay = 1000;
      tooltip.touchGestures = touchGestures;
      tooltip.message = message;
      tooltip.ngAfterViewInit();
      tooltips.push(tooltip);
    };
    bind(
      root.querySelector('.compass-outer-ring-background'),
      'Нажмите и тащите чтобы вращать камеру.',
      'off',
    );
    bind(
      root.querySelector('.compass-gyro-background'),
      'Внешнее кольцо: вращение камеры. Внутренний гироскоп: свободный обзор.',
      'off',
    );
    const controlTexts = ['Приблизить', 'Вернуть начальный вид', 'Отдалить'];
    const controls = root.querySelectorAll('.navigation-control, .navigation-control-last');
    controls.forEach((control, index) => {
      const message = controlTexts[index];
      if (message) {
        bind(control, message, 'auto');
      }
    });
    return () => {
      for (const tooltip of tooltips) {
        tooltip.ngOnDestroy();
      }
    };
  }

  private getUsability(): void {
    const zoomIn = elementByClass('navigation-control', 0);
    const resetView = elementByClass('navigation-control', 1);
    const zoomOut = elementByClass('navigation-control-last', 0);
    if (zoomIn && resetView && zoomOut) {
        const btnsArr = [zoomIn, resetView, zoomOut];
        for (const btn of btnsArr) {
          if (!(btn instanceof HTMLElement)) continue;
          btn.setAttribute('tabindex', '0');
          btn.addEventListener('keyup', (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter') {
              btn.click();
            }
          });
        }
      }
  }

  private getCursorListeners(): void {
    const compassRingEl = elementByClass('compass-outer-ring-background');
    function mouseUpCallback(): void {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mouseup', mouseUpCallback);
    }
    if (compassRingEl) {
      compassRingEl.addEventListener('mousedown', () => {
        document.body.style.cursor = 'grabbing';
        document.addEventListener('mouseup', mouseUpCallback);
      });
    }
    const compassGyroEl = elementByClass('compass-gyro-background');
    if (compassGyroEl) {
      compassGyroEl.addEventListener('mousedown', () => {
        document.body.style.cursor = 'move';
        document.addEventListener('mouseup', mouseUpCallback);
      });
    }
  }
}

const TAP_SLOP_PX = 10;
const DOUBLE_TAP_MS = 300;
const LONG_PRESS_MS = 500;

type TouchPoint = {
  identifier: number;
  clientX: number;
  clientY: number;
  screenX?: number;
  screenY?: number;
};

type TouchLike = Event & {
  touches: ArrayLike<TouchPoint>;
  changedTouches: ArrayLike<TouchPoint>;
};

function isTouchLike(event: Event): event is TouchLike {
  return 'touches' in event && 'changedTouches' in event;
}

function pointFrom(list: ArrayLike<TouchPoint>, identifier: number): TouchPoint | undefined {
  for (let i = 0; i < list.length; i++) {
    if (list[i].identifier === identifier) {
      return list[i];
    }
  }
  return undefined;
}

function dispatchMouse(
  type: 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dblclick',
  target: EventTarget,
  point: TouchPoint,
): void {
  const released = type === 'mouseup' || type === 'click' || type === 'dblclick';
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: point.clientX,
      clientY: point.clientY,
      screenX: point.screenX ?? point.clientX,
      screenY: point.screenY ?? point.clientY,
      button: 0,
      buttons: released ? 0 : 1,
    }),
  );
}

function listenUntilLift(
  onMove: (event: Event) => void,
  onEnd: (event: Event) => void,
): () => void {
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd, { passive: false });
  document.addEventListener('touchcancel', onEnd, { passive: false });
  return () => {
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    document.removeEventListener('touchcancel', onEnd);
  };
}

function movedPastSlop(start: TouchPoint, current: TouchPoint): boolean {
  return Math.hypot(current.clientX - start.clientX, current.clientY - start.clientY) > TAP_SLOP_PX;
}

/**
 * Пакет слушает только mouse/click. На мобильном UA тач компаса и кнопок
 * переводится в эти события. preventDefault только у жеста, начатого на виджете.
 */
export function attachNavigationTouchBridge(root: ParentNode): () => void {
  const compass = root.querySelector('.compass');
  const controls = root.querySelector('.navigation-controls');
  let detachGesture: (() => void) | undefined;
  let compassHeld = false;
  let lastCompassTapAt = 0;
  let disposed = false;

  const releaseGesture = (): void => {
    detachGesture?.();
    detachGesture = undefined;
  };

  const onCompassStart = (event: Event): void => {
    if (disposed || detachGesture || !(compass instanceof HTMLElement)) {
      return;
    }
    if (compass.classList.contains('compass-blocked') || !isTouchLike(event)) {
      return;
    }
    if (event.touches.length !== 1) {
      return;
    }
    const start = event.changedTouches[0];
    if (!start) {
      return;
    }
    event.preventDefault();
    compassHeld = true;
    let moved = false;
    const onMove = (moveEvent: Event): void => {
      if (!isTouchLike(moveEvent)) {
        return;
      }
      const current = pointFrom(moveEvent.touches, start.identifier);
      if (!current) {
        return;
      }
      moved = moved || movedPastSlop(start, current);
      moveEvent.preventDefault();
      dispatchMouse('mousemove', document, current);
    };
    const onEnd = (endEvent: Event): void => {
      if (!isTouchLike(endEvent)) {
        return;
      }
      const current = pointFrom(endEvent.changedTouches, start.identifier);
      if (!current) {
        return;
      }
      endEvent.preventDefault();
      compassHeld = false;
      dispatchMouse('mouseup', document, current);
      const now = Date.now();
      const tap = !moved && endEvent.type !== 'touchcancel';
      if (tap && lastCompassTapAt !== 0 && now - lastCompassTapAt <= DOUBLE_TAP_MS) {
        dispatchMouse('dblclick', compass, current);
        lastCompassTapAt = 0;
      } else {
        lastCompassTapAt = tap ? now : 0;
      }
      releaseGesture();
    };
    detachGesture = listenUntilLift(onMove, onEnd);
    dispatchMouse('mousedown', compass, start);
  };

  const onControlStart = (event: Event): void => {
    if (disposed || detachGesture || !(controls instanceof HTMLElement)) {
      return;
    }
    if (controls.classList.contains('navigation-controls-blocked') || !isTouchLike(event)) {
      return;
    }
    if (event.touches.length !== 1 || !(event.target instanceof Element)) {
      return;
    }
    const control = event.target.closest('.navigation-control, .navigation-control-last');
    if (!(control instanceof HTMLElement)) {
      return;
    }
    const start = event.changedTouches[0];
    if (!start) {
      return;
    }
    event.preventDefault();
    const pressedAt = Date.now();
    let moved = false;
    const onMove = (moveEvent: Event): void => {
      if (!isTouchLike(moveEvent)) {
        return;
      }
      const current = pointFrom(moveEvent.touches, start.identifier);
      if (!current) {
        return;
      }
      moved = moved || movedPastSlop(start, current);
      moveEvent.preventDefault();
    };
    const onEnd = (endEvent: Event): void => {
      if (!isTouchLike(endEvent)) {
        return;
      }
      const current = pointFrom(endEvent.changedTouches, start.identifier);
      if (!current) {
        return;
      }
      endEvent.preventDefault();
      const longPress = Date.now() - pressedAt >= LONG_PRESS_MS;
      if (!moved && !longPress && endEvent.type !== 'touchcancel') {
        dispatchMouse('click', control, current);
      }
      releaseGesture();
    };
    detachGesture = listenUntilLift(onMove, onEnd);
  };

  compass?.addEventListener('touchstart', onCompassStart, { passive: false });
  controls?.addEventListener('touchstart', onControlStart, { passive: false });

  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    compass?.removeEventListener('touchstart', onCompassStart);
    controls?.removeEventListener('touchstart', onControlStart);
    if (compassHeld) {
      compassHeld = false;
      dispatchMouse('mouseup', document, { identifier: -1, clientX: 0, clientY: 0 });
    }
    releaseGesture();
  };
}
