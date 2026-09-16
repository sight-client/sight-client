import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddCircle } from './add-circle';

describe('AddCircle', () => {
  let component: AddCircle;
  let fixture: ComponentFixture<AddCircle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCircle],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCircle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
