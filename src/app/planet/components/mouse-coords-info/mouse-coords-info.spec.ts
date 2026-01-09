import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MouseCoordsInfo } from './mouse-coords-info';

describe('MouseCoordsInfo', () => {
  let component: MouseCoordsInfo;
  let fixture: ComponentFixture<MouseCoordsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MouseCoordsInfo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MouseCoordsInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
