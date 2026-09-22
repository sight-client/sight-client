import { Injectable, signal, Signal } from '@angular/core';

const UA_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const PHONE_MQ = '(max-width: 582px)';
const TABLET_MQ = '(max-width: 767px)';
const LAPTOP_MQ = '(max-width: 1080px)';
const NARROW_MQ = '(max-width: 1660px)';

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
