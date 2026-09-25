import { Directive, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[autofocusDirective]',
})
export class AutofocusDirective implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}
  // Дополнительный входной параметр для управления фокусом
  @Input() set appAutoFocus(condition: boolean | undefined) {
    if (condition) {
      this.focusElement();
    }
  }
  ngOnInit(): void {
    // Фокус при первой инициализации директивы, если не задано условие
    if (this.appAutoFocus === undefined) {
      this.focusElement();
    }
  }
  focusElement(): void {
    // Фокусируемся на элементе
    this.el.nativeElement.focus();
  }
}
