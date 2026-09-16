import { InjectionToken, Provider } from '@angular/core';
import * as Cesium from 'cesium';

export const CESIUM_INSTANCE = new InjectionToken<typeof Cesium>('Cesium.Instance');
// Позволяет Cesium делать сетевые запросы в обход ангуляровского HttpClient
export const CESIUM_PROVIDER: Provider = {
  provide: CESIUM_INSTANCE,
  useValue: Cesium,
};
