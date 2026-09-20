import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LightDarkMode } from './light-dark-mode';
import { SetLightDarkModeService } from '@global/services/set-light-dark-mode-service/set-light-dark-mode.service';

describe('LightDarkThemeSwitcher', () => {
  let component: LightDarkMode;
  let fixture: ComponentFixture<LightDarkMode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightDarkMode],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LightDarkMode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('click calls SetLightDarkModeService.setColorScheme', () => {
    const service = TestBed.inject(SetLightDarkModeService);
    const spy = vi.spyOn(service, 'setColorScheme');
    fixture.nativeElement.querySelector('button')?.click();
    expect(spy).toHaveBeenCalled();
  });
});
