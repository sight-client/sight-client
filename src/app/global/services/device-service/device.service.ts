import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor() {
    this.isMobile = this.checkMobile();
  }
  declare readonly isMobile: boolean;
  private checkMobile(): boolean {
    try {
      const userAgent: string = navigator.userAgent;
      const isMobileUA: boolean =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTouchDevice: boolean = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return isMobileUA || isTouchDevice;
    } catch (error: unknown) {
      throw new Error('Ошибка при определении типа устройства');
    }
  }
}
