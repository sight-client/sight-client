import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddMarkModal } from './add-mark-modal';

describe('AddMarkModal', () => {
  let component: AddMarkModal;
  let fixture: ComponentFixture<AddMarkModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMarkModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMarkModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
