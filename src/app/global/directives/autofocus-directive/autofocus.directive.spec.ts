import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  selector: 'host-autofocus',
  imports: [AutofocusDirective],
  template: `<input autofocusDirective />`,
})
class HostAutofocus {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<HostAutofocus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostAutofocus],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostAutofocus);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
