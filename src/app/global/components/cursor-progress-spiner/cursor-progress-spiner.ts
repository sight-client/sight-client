import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SetCursorProgressSpinerService } from '@global/services/set-cursor-progress-spiner-service/set-cursor-progress-spiner.service';

@Component({
  selector: 'cursor-progress-spiner',
  imports: [MatProgressSpinnerModule],
  template: `
    @if ($setCursorProgressSpinerService.isShowSpiner()) {
      <mat-spinner
        [style.left.px]="mouseX"
        [style.top.px]="mouseY"
        style="position: fixed; z-index: 997; width: 15px; height: 15px"
      ></mat-spinner>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorProgressSpiner {
  constructor(protected $setCursorProgressSpinerService: SetCursorProgressSpinerService) {}
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
    if (this.$setCursorProgressSpinerService.isShowSpiner()) {
      this.clientX = event.clientX;
      this.clientY = event.clientY;
      this.mouseX = event.clientX + this.difX;
      this.mouseY = event.clientY + this.difY;
    }
  }
  // Notice: добавить точности расчетов в будущем
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
    if (this.$setCursorProgressSpinerService.isShowSpiner()) {
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
