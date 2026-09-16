import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddCircleFloatingWindow } from './add-circle-floating-window';

describe('AddCircleFloatingWindow', () => {
  let component: AddCircleFloatingWindow;
  let fixture: ComponentFixture<AddCircleFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCircleFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCircleFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
