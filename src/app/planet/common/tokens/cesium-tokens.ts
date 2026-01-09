import { InjectionToken, Provider } from '@angular/core';
import * as Cesium from 'cesium';

export const CESIUM_INSTANCE = new InjectionToken<typeof Cesium>('Cesium.Instance');

export const CESIUM_PROVIDER: Provider = {
  provide: CESIUM_INSTANCE,
  useValue: Cesium,
};
