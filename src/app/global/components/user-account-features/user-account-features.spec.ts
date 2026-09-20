import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { UserDataService } from '@global/services/user-data-service/user-data.service';
import { UserAccountFeatures } from './user-account-features';

describe('UserAccountFeatures', () => {
  let component: UserAccountFeatures;
  let fixture: ComponentFixture<UserAccountFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccountFeatures],
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

    fixture = TestBed.createComponent(UserAccountFeatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
