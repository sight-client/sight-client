import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from './viewer.service';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';

describe('ViewerService', () => {
  afterEach(() => {
    localStorage.removeItem('sceneMode');
  });

  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ViewerService, SetProgressSpinnerService],
    });
    expect(TestBed.inject(ViewerService)).toBeTruthy();
  });

  it('reads 2D from localStorage.sceneMode', () => {
    localStorage.setItem('sceneMode', '2D');
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ViewerService, SetProgressSpinnerService],
    });
    expect(TestBed.inject(ViewerService).nowSceneModeDescription()).toBe('2D');
  });

  it('missing or invalid sceneMode falls back to 3D', () => {
    localStorage.removeItem('sceneMode');
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ViewerService, SetProgressSpinnerService],
    });
    expect(TestBed.inject(ViewerService).nowSceneModeDescription()).toBe('3D');
  });

  it('ignores a non-literal sceneMode in localStorage', () => {
    localStorage.setItem('sceneMode', 'MORPHING');
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ViewerService, SetProgressSpinnerService],
    });
    expect(TestBed.inject(ViewerService).nowSceneModeDescription()).toBe('3D');
  });

  it('setClampToGround(false) updates clampToGroundSignal without throwing on empty viewer', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ViewerService, SetProgressSpinnerService],
    });
    const service = TestBed.inject(ViewerService);
    expect(() => service.setClampToGround(false)).not.toThrow();
    expect(service.clampToGroundSignal()).toBe(false);
  });

  it('setNowSceneMode COLUMBUS_VIEW sets description Columbus', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ViewerService, SetProgressSpinnerService],
    });
    const service = TestBed.inject(ViewerService);
    service.setNowSceneMode(Cesium.SceneMode.COLUMBUS_VIEW);
    expect(service.nowSceneModeDescription()).toBe('Columbus');
  });
});
