import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  signal,
  untracked,
} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import type { CRS } from '@/common/lib/coord-sistems.lib';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';
import { finiteCssPx } from '@global/lib/common-global.lib';

@Component({
  selector: 'cursor-coords-info',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatTooltipModule],
  templateUrl: './cursor-coords-info.html',
  styleUrl: './cursor-coords-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorCoordsInfo {
  constructor(
    private $viewerService: ViewerService,
    protected $cursorCoordsService: CursorCoordsService,
    private $checkMobileDeviceService: CheckMobileDeviceService,
    private el: ElementRef<HTMLElement>,
  ) {
    effect(() => {
      if (
        // this.$viewerService.viewerHasLoaded() &&
        this.$cursorCoordsService.underMouseEntityHasLoaded()
      ) {
        untracked(() => {
          if (!this.$checkMobileDeviceService.isMobile) {
            this.mouseMoveSubscription = this.getMouseMoveSubscription();
          }
        });
      }
    });
    afterEveryRender(() => this.syncPhoneCoordsMinWidth());
  }

  protected cursorCoordsDescription = computed<{
    latitude: string;
    longitude: string;
    heigh: string;
  }>(() => {
    return {
      latitude: this.$cursorCoordsService.latitudeDescription(),
      longitude: this.$cursorCoordsService.longitudeDescription(),
      heigh: this.$cursorCoordsService.heightDescription(),
    };
  });
  protected crsVarsArr: Array<CRS> = ['WGS-84', 'СК-42 м', 'СК-42 °', 'ПЗ-90.11'];
  public selectedCRS = signal<CRS>('WGS-84');

  // Подписка на движение поля с координатами вместе с курсором мыши
  declare private mouseMoveSubscription: Subscription;
  private getMouseMoveSubscription(): Subscription {
    const cesiumContainer: Element = this.$viewerService.viewer.container;
      if (!cesiumContainer)
        throw new Error('Cesium container is not defined. Mouse move subscription was failed!');
      const mouseMove$: Observable<Event> = fromEvent(cesiumContainer, 'mousemove');
      return mouseMove$.subscribe((event) => {
        if (event instanceof MouseEvent) this.setCoordsWindowPosition(event);
      });
  }

  protected outOfScreen = signal<boolean>(false);
  // Сдвиг поля с координатами возле курсора
  protected left: string = 'calc(50% + 6px)';
  protected top: string = 'calc(50% + 14px)';
  private maxFieldWidth: number = 0;
  private setCoordsWindowPosition(event: MouseEvent): void {
    if (!this.maxFieldWidth) {
      let fieldMaxWidth: number = 110;
      const field = document.getElementsByClassName('cursor-coords-cursor-field').item(0);
      if (field instanceof HTMLElement) {
        const newFeldMaxWidth = finiteCssPx(
          getComputedStyle(field).getPropertyValue('--cursor-field-max-width'),
        );
        if (newFeldMaxWidth > fieldMaxWidth) {
          fieldMaxWidth = newFeldMaxWidth;
        }
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
  }

  ngOnDestroy() {
    if (this.mouseMoveSubscription) {
      this.mouseMoveSubscription.unsubscribe();
    }
  }

  protected cursorDescIsChecked = signal<boolean>(false);
  protected toggleCursorCoordsFieldDisplay(): void {
    this.cursorDescIsChecked.set(!this.cursorDescIsChecked());
  }

  protected coordsExpanded = signal(false);

  protected showPhoneChevron = computed(() => this.$checkMobileDeviceService.phoneLayout());

  // Same format/length as WGS-84 HUD, so the phone stack width is known before live lat/lon.
  protected readonly phoneWidthProbeLat = 'B: -00.0000000 ˚';
  protected readonly phoneWidthProbeLon = 'L: -000.0000000 ˚';

  protected toggleCoordsExpanded(event: Event): void {
    event.stopPropagation();
    this.coordsExpanded.update((v) => !v);
  }

  // Phone stack width is shared by height, coords, and the coords chevron.
  private stackStyleTargets(): HTMLElement[] {
    const nodes = [document.documentElement, document.getElementById('sightUiContainer')];
    return nodes.filter((n): n is HTMLElement => n instanceof HTMLElement);
  }

  private heightPanelNaturalWidth(): number {
    const box = document.querySelector('.camera-height-container');
    if (!(box instanceof HTMLElement)) return 0;
    const cs = getComputedStyle(box);
    const padX =
      finiteCssPx(cs.paddingLeft) + finiteCssPx(cs.paddingRight);
    const childrenW = [...box.children]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
    return childrenW + padX;
  }

  private syncPhoneCoordsMinWidth(): void {
    const targets = this.stackStyleTargets();
    if (!this.$checkMobileDeviceService.phoneLayout()) {
      for (const node of targets) {
        node.classList.remove('phone-stack-ready');
        node.style.removeProperty('--phone-coords-content-width');
        node.style.removeProperty('--phone-height-stack-width');
      }
      return;
    }
    const host = this.el.nativeElement;
    const main = host.querySelector('.coords-description-main');
    if (!(main instanceof HTMLElement)) return;
    const prevWidth = main.style.width;
    const prevMax = main.style.maxWidth;
    main.style.width = 'max-content';
    main.style.maxWidth = 'none';
    const svg = main.querySelector('.cursor-coords-cursor-field-display-option svg:last-child');
    const mainRect = main.getBoundingClientRect();
    const svgRight = svg instanceof SVGElement ? svg.getBoundingClientRect().right : mainRect.right;
    const padRight = finiteCssPx(getComputedStyle(main).paddingRight);
    const needed = Math.ceil(
      Math.max(mainRect.width, main.scrollWidth, svgRight - mainRect.left + padRight),
    );
    main.style.width = prevWidth;
    main.style.maxWidth = prevMax;
    if (!needed) return;
    const currentCoords = Math.max(
      ...targets.map((n) => finiteCssPx(n.style.getPropertyValue('--phone-coords-content-width'))),
    );
    const coordsW = Math.max(needed, currentCoords);
    const stackW = Math.ceil(Math.max(this.heightPanelNaturalWidth(), coordsW));
    for (const node of targets) {
      node.style.setProperty('--phone-coords-content-width', `${coordsW}px`);
      node.style.setProperty('--phone-height-stack-width', `${stackW}px`);
      node.classList.add('phone-stack-ready');
    }
  }
}
