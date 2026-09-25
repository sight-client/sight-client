import { Injectable, inject, signal, Signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';

const UA_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const PHONE_MQ = '(max-width: 460px)'; // из моих брейкпойнтов
const tabletWidthBorder = 767; // из моих брейкпойнтов
const TABLET_MQ = `(max-width: ${tabletWidthBorder}px)`;
const LAPTOP_MQ = '(max-width: 1080px)'; // из моих брейкпойнтов
const NARROW_MQ = '(max-width: 1660px)'; // выбор ИИ

@Injectable({ providedIn: 'root' })
export class CheckMobileDeviceService {
  readonly isMobile: boolean;
  readonly phoneLayout: Signal<boolean>;
  readonly tabletLayout: Signal<boolean>;
  readonly laptopLayout: Signal<boolean>;
  readonly narrowChromeLayout: Signal<boolean>;

  private readonly _phoneLayout = signal(false);
  private readonly _tabletLayout = signal(false);
  private readonly _laptopLayout = signal(false);
  private readonly _narrowChromeLayout = signal(false);

  private document = inject(DOCUMENT);
  private window = this.document.defaultView;
  private nowMobileWidth = signal<number>(this.window?.innerWidth || 0);
  readonly wideMobile = computed<boolean>(() => {
    if (this.isMobile) {
      return this.nowMobileWidth() > tabletWidthBorder;
    } else {
      return false;
    }
  });

  constructor() {
    this.isMobile = this.checkMobile();
    this.phoneLayout = this._phoneLayout.asReadonly();
    this.tabletLayout = this._tabletLayout.asReadonly();
    this.laptopLayout = this._laptopLayout.asReadonly();
    this.narrowChromeLayout = this._narrowChromeLayout.asReadonly();
    this.bindQuery(PHONE_MQ, this._phoneLayout);
    this.bindQuery(TABLET_MQ, this._tabletLayout);
    this.bindQuery(LAPTOP_MQ, this._laptopLayout);
    this.bindQuery(NARROW_MQ, this._narrowChromeLayout);
    const view = this.window;
    if (this.isMobile && view) {
      fromEvent(view, 'resize').subscribe(() => {
        this.nowMobileWidth.set(view.innerWidth);
      });
    }
  }

  public checkMobile(): boolean {
    return UA_MOBILE.test(navigator.userAgent);
  }

  private bindQuery(query: string, target: ReturnType<typeof signal<boolean>>): void {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia(query);
    target.set(mq.matches);
    const onChange = (event: MediaQueryListEvent) => target.set(event.matches);
    mq.addEventListener('change', onChange);
  }
}
