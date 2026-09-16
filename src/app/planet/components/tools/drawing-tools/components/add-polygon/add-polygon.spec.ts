import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddPolygon } from './add-polygon';

describe('AddPolygon', () => {
  let component: AddPolygon;
  let fixture: ComponentFixture<AddPolygon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPolygon],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPolygon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
