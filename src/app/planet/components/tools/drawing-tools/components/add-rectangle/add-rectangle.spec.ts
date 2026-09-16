import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddRectangle } from './add-rectangle';

describe('AddRectangle', () => {
  let component: AddRectangle;
  let fixture: ComponentFixture<AddRectangle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRectangle],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddRectangle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
