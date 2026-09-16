import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddPolygonFloatingWindow } from './add-polygon-floating-window';

describe('AddPolygonFloatingWindow', () => {
  let component: AddPolygonFloatingWindow;
  let fixture: ComponentFixture<AddPolygonFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPolygonFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPolygonFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
