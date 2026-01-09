import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CameraHeightTool } from './camera-height-tool';

describe('CameraHeightTool', () => {
  let component: CameraHeightTool;
  let fixture: ComponentFixture<CameraHeightTool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraHeightTool],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraHeightTool);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
