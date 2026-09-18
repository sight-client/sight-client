import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { UserDataService } from '@global/services/user-data-service/user-data.service';
import { AccountFeatures } from './account-features';

describe('AccountFeatures', () => {
  let component: AccountFeatures;
  let fixture: ComponentFixture<AccountFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountFeatures],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: UserDataService,
          useValue: {
            userName: signal(undefined),
            firstname: signal(undefined),
            lastname: signal(undefined),
            loginResult: signal(undefined),
            logoutResult: signal(undefined),
            registrationResult: signal(undefined),
            clearAuthResults: () => {},
            clearRegFormValuesReserv: () => {},
            getLogoutSubscription: () => ({ unsubscribe() {} }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountFeatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
