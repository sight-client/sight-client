import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { UserDataService } from '@global/services/user-data-service/user-data.service';
import { AuthModule } from './auth-module';

describe('AuthModule', () => {
  let component: AuthModule;
  let fixture: ComponentFixture<AuthModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModule],
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
            clearAuthSubscriptions: () => {},
            setRegFormValuesReserv: () => {},
            regFormValuesReserv: signal({
              login: '',
              password: '',
              firstName: '',
              lastName: '',
              organization: '',
              telephone: '',
              email: '',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
