import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddMark } from './add-mark';

describe('AddMark', () => {
  let component: AddMark;
  let fixture: ComponentFixture<AddMark>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMark],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMark);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
