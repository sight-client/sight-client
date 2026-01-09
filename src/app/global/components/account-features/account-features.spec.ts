import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AccountFeatures } from './account-features';

describe('AccountFeatures', () => {
  let component: AccountFeatures;
  let fixture: ComponentFixture<AccountFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountFeatures],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountFeatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
