import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddRectangleFloatingWindow } from './add-rectangle-floating-window';

describe('AddRectangleFloatingWindow', () => {
  let component: AddRectangleFloatingWindow;
  let fixture: ComponentFixture<AddRectangleFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRectangleFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddRectangleFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
