import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AuthModule } from './auth-module';

describe('AuthModule', () => {
  let component: AuthModule;
  let fixture: ComponentFixture<AuthModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
