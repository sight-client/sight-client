import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { fromEvent, Observable, Subscription, throttleTime } from 'rxjs';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';
import { CursorPositionListener } from '@global/listeners/cursor-position-listener/cursor-position-listener';
// Компонент существует пока $setProgressSpinnerService.isShowSpinner()
@Component({
  selector: 'progress-spinner',
  imports: [MatProgressSpinnerModule],
  template: `
    <mat-spinner
      [style.left.px]="mouseX"
      [style.top.px]="mouseY"
      style="position: fixed; z-index: 1001; width: 15px; height: 15px"
    ></mat-spinner>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressSpinner {
  constructor(
    protected $setProgressSpinnerService: SetProgressSpinnerService,
    private $cursorPositionListener: CursorPositionListener,
  ) {
    if (this.$cursorPositionListener.listenerExistence === true) {
      this.mouseX = this.$cursorPositionListener.cursorXExport + this.difX;
      this.mouseY = this.$cursorPositionListener.cursorYExport + this.difY;
    }
  }
  protected mouseX = 0;
  protected mouseY = 0;
  private clientX = 0;
  private clientY = 0;
  private difX = 15; // смещение от курсора
  private difY = 15;
  private initialWidth = window.innerWidth;
  private innerHeight = window.innerHeight;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
    this.mouseX = event.clientX + this.difX;
    this.mouseY = event.clientY + this.difY;
  }
  // Добавить точности расчетов в будущем
  @HostListener('window:resize', ['$event'])
  onResize(_event: UIEvent) {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    const widthChange = (currentWidth - this.initialWidth) / this.initialWidth;
    const heightChange = (currentHeight - this.innerHeight) / this.innerHeight;
    this.difX = this.difX + this.difX * widthChange;
    this.difY = this.difY + this.difY * heightChange;
    this.initialWidth = currentWidth;
    this.innerHeight = currentHeight;
    if (this.$setProgressSpinnerService.isShowSpinner()) {
      const newMoveEvent = new MouseEvent('mousemove', {
        clientX: this.clientX + this.clientX * widthChange,
        clientY: this.clientY + this.clientY * heightChange,
      });
      document.dispatchEvent(newMoveEvent);
    }
  }

  // // Медленнее:
  // constructor() {
  //   afterNextRender(() => {
  //     this.getMouseMoveSubscription();
  //   });
  // }
  // declare private mouseMoveSubscription: Subscription;
  // private getMouseMoveSubscription(): Subscription {
  //   try {
  //     const mouseMove$: Observable<Event> = fromEvent(window, 'mousemove').pipe(throttleTime(10));
  //     return mouseMove$.subscribe((event) => {
  //       this.setCoordsWindowPosition(event as MouseEvent);
  //     });
  //   } catch (error: any) {
  //     error.cause = 'red';
  //     throw error;
  //   }
  // }
  // mouseX = signal<number>(0);
  // mouseY = signal<number>(0);
  // private setCoordsWindowPosition(event: MouseEvent): void {
  //   try {
  //     this.mouseX.set(event.clientX);
  //     this.mouseY.set(event.clientY);
  //     console.log(this.mouseX(), this.mouseY());
  //   } catch (error: any) {
  //     error.cause = 'red';
  //     throw error;
  //   }
  // }

  // ngOnDestroy() {
  //   if (this.mouseMoveSubscription) {
  //     this.mouseMoveSubscription.unsubscribe();
  //   }
  // }
}
