import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddMarkFloatingWindow } from './add-mark-floating-window';

describe('AddMarkFloatingWindow', () => {
  let component: AddMarkFloatingWindow;
  let fixture: ComponentFixture<AddMarkFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMarkFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMarkFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
