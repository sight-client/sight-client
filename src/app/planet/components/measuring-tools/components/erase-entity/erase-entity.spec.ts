import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { EraseEntity } from './erase-entity';

describe('EraseEntity', () => {
  let component: EraseEntity;
  let fixture: ComponentFixture<EraseEntity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EraseEntity],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(EraseEntity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
