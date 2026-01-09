import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ZnemzNavigationMixin } from './znemz-navigation-mixin';

describe('ZnemzNavigationMixin', () => {
  let component: ZnemzNavigationMixin;
  let fixture: ComponentFixture<ZnemzNavigationMixin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZnemzNavigationMixin],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ZnemzNavigationMixin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
