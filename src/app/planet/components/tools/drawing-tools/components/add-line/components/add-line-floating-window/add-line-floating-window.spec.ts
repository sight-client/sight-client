import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddLineFloatingWindow } from './add-line-floating-window';

describe('AddLineFloatingWindow', () => {
  let component: AddLineFloatingWindow;
  let fixture: ComponentFixture<AddLineFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLineFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddLineFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
