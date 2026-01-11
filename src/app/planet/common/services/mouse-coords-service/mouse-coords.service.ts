import { Injectable, signal } from '@angular/core';
import * as Cesium from 'cesium';
import { fromEvent, map, Observable, Subscription } from 'rxjs';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CoordSystems } from '@/common/lib/coord-sistems.lib';
import type { CRS } from '@/common/lib/coord-sistems.lib';
import { DeviceService } from '@global/services/device-service/device.service';

@Injectable()
export class MouseCoordsService {
  constructor(
    private $viewerService: ViewerService,
    private $deviceService: DeviceService,
  ) {}

  // Стартует вместе с viewer'ом и инструментами правой панели в директиве app-cesium.directive.ts
  public async startMouseCoordsService(): Promise<void> {
    this.canvas = this.$viewerService?.viewer?.scene?.canvas;
    if (!this.canvas) throw new Error('Scene canvas is undefined!');
    this.canvasCenterX = this.canvas.scrollWidth / 2;
    this.canvasCenterY = this.canvas.scrollHeight / 2;
    await this.setUnderMouseEntity();
    if (!this.$deviceService.isMobile) {
      this.mouseMoveSubscription = this.getMouseMoveSubscription();
      this.$viewerService.viewer.camera.changed.addEventListener(() =>
        this.cursorOnViewerCanvas.set(false),
      );
    } else {
      this.touchMoveSubscription = this.getTouchMoveSubscription();
      // viewer.camera.changed listener не срабатывает первый и последующий каждый четвертый раз
      this.$viewerService.viewer.camera.moveEnd.addEventListener(
        this.getCursorOnSurface.bind(this),
      );
    }
    // this.$viewerService.viewer.camera.changed.addEventListener(this.clearCoords.bind(this));
  }

  // Создание cesium-сущности под курсором мыши для получения его координат.
  // Используется measure.service и mouse-coords-info
  public underMouseEntity = signal<Cesium.Entity | undefined>(undefined);
  public underMouseEntityHasLoaded = signal<boolean>(false);
  private async setUnderMouseEntity(): Promise<void> {
    try {
      const mousePositionDataSource = new Cesium.CustomDataSource('mousePosition');
      mousePositionDataSource.entities.add({
        id: 'mouse',
        // Скрыт и дублируется html-контейнером компонента mouse-coords-info с целью оптимизации (наблюдались фризы).
        label: {
          show: false,
          text: '',
          // font: '12px monospace',
          // pixelOffset: new Cesium.Cartesian2(85, 45),
          // backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.4),
          // showBackground: true,
        },
      });
      await this.$viewerService.viewer.dataSources.add(mousePositionDataSource);
      // Проверяем наверняка связь с вьюером. Теперь местная underMouseEntity() - это ссылка на свойство вьюера
      this.underMouseEntity.set(
        this.$viewerService.viewer.dataSources
          .getByName('mousePosition')[0]
          .entities.getById('mouse'),
      );
      if (this.underMouseEntity() !== undefined) this.underMouseEntityHasLoaded.set(true);
      else throw new Error('underMouseEntity is not defined');
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  // Элемент, в котором будут отслеживаться события (ссылка приходит из planet.ts по окончании его рендеринга - раньше запуска местных лисенеров)
  declare private watchedContainer: Element;
  getWatchedContainerRef(incomingEl: Element): void {
    this.watchedContainer = incomingEl;
  }

  // Подписка на движение курсора мыши по эллипсоиду (оформляется при старте сервиса)
  declare private mouseMoveSubscription: Subscription;
  private getMouseMoveSubscription(): Subscription {
    try {
      if (!this.watchedContainer)
        throw new Error('Planet container is not defined. Mouse move subscription was failed!');
      const mouseMove$: Observable<Event> = fromEvent(this.watchedContainer, 'mousemove'); // на 'wheel' нет смысла по
      return mouseMove$
        .pipe(
          // throttleTime(100), // МЕШАЕТ ИНСТРУМЕНТАМ РАБОТЫ С КАРТОЙ (например, нарушается позиционирование точек)
          map((event) => {
            return this.getCursorOnSurface(event as MouseEvent);
          }),
        )
        .subscribe((newPosition: Cesium.Cartesian3 | undefined) => {
          if (newPosition === undefined) return undefined;
          this.setUnderMouseEntityPosition(newPosition);
          this.setUnderMouseEntityCoords(newPosition);
        });
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  // Подписка на движение пальца (на точпаде) по эллипсоиду (оформляется при старте сервиса)
  declare private touchMoveSubscription: Subscription;
  private getTouchMoveSubscription(): Subscription {
    try {
      if (!this.watchedContainer)
        throw new Error('Planet container is not defined. Long touch subscription was failed!');
      const touchMove$: Observable<Event> = fromEvent(this.watchedContainer, 'touchmove');
      return touchMove$
        .pipe(
          // Пропускает только один результат в указанный промежуток времени
          // throttleTime(100),
          map((event) => {
            return this.getCursorOnSurface(event as TouchEvent);
          }),
        )
        .subscribe((newPosition: Cesium.Cartesian3 | undefined) => {
          if (newPosition === undefined) return undefined;
          this.setUnderMouseEntityPosition(newPosition);
          this.setUnderMouseEntityCoords(newPosition);
        });
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  // Уусловия показа поля с координатами (в левом нижнем углу)
  public cursorOnViewerCanvas = signal<boolean>(false);
  // В настоящий момент не требуется
  // public cursorOnCoordsContainer = signal<boolean>(false);
  // Условие, отключающее расчет координат при нахождении курсора на этом поле
  public calculationBlocker = signal<boolean>(false);
  // Фиксация положения курсора мыши для использования другого рода событиями
  private cursorX: number = 1;
  private cursorY: number = 1;
  // Холст Cesium.Viewer и его постоянные размеры (значения присвоины в конструкторе класса)
  declare private canvas: HTMLCanvasElement | undefined;
  declare private canvasCenterX: number;
  declare private canvasCenterY: number;
  // // Фиксация максимальных значений параметров изменяющегося по высоте контейнера
  // private minTop: number = 1000000;
  // private maxHeight: number = 1;

  private getCursorOnSurface(
    event: MouseEvent | TouchEvent | number,
  ): Cesium.Cartesian3 | undefined {
    try {
      // Резервная проверка на существование холста
      if (!this.canvas) {
        this.cursorOnViewerCanvas.set(false);
        console.log('Scene canvas is undefined!');
        return undefined;
      }
      if (event instanceof MouseEvent) {
        this.cursorX = event.pageX;
        this.cursorY = event.pageY;
        // Если курсор мыши - не на холсте цесиума (а на UI поверх него)...
        if (event.target !== this.canvas) {
          // Прекращаем расчеты
          this.calculationBlocker.set(true);
          // Скрываем поле с координатами возле курсора, решаем по поводу основного контейнера (в левом нижнем углу)
          this.cursorOnViewerCanvas.set(false);
          // В настоящий момент не требуется
          // const coordsMainContainer: Element | null =
          //   document.getElementsByClassName('coords-container-main')?.[0];
          // if (coordsMainContainer) {
          //   // Проверяем, находится ли курсор в максимально возможных габаритах контейнера с координатами
          //   let newTop: number = +window.getComputedStyle(coordsMainContainer).top.slice(0, -2);
          //   if (newTop < this.minTop) this.minTop = newTop;
          //   const top: number = this.minTop;
          //   let newHeight: number = +window.getComputedStyle(coordsMainContainer).height.slice(0, -2); // пересчитать через rect
          //   if (newHeight > this.maxHeight) this.maxHeight = newHeight;
          //   const height: number = this.maxHeight;
          //   const left: number = +window.getComputedStyle(coordsMainContainer).left.slice(0, -2);
          //   const width: number = +window.getComputedStyle(coordsMainContainer).width.slice(0, -2);
          //   const rightBorder: number = left + width;
          //   const bottomBorder: number = top + height;
          //   if (
          //     event.pageX > left &&
          //     event.pageX < rightBorder &&
          //     event.pageY > top &&
          //     event.pageY < bottomBorder
          //   ) {
          //     // Cохранеем видимость основного контейнера с координатами
          //     this.cursorOnCoordsContainer.set(true);
          //     return undefined;
          //   } else {
          //     // Скрываем и основной контейнер с координатами
          //     this.cursorOnCoordsContainer.set(false);
          //     return undefined;
          //   }
          // } else {
          //   // Когда нет ни контейнера для координат, ни курсора на холсте
          //   this.cursorOnCoordsContainer.set(false);
          //   return undefined;
          // }
        } else {
          // Продолжаем расчеты (курсор на холсте)
          this.cursorOnViewerCanvas.set(true);
          // this.cursorOnCoordsContainer.set(false);
          this.calculationBlocker.set(false);
        }
      } else {
        this.calculationBlocker.set(false);
        this.cursorOnViewerCanvas.set(true);
      }
      // Резервная проверка
      if (this.calculationBlocker()) return;

      /* Положение курсора мыши. Параметр должен быть выражен в мировых координатах (cartesian), 
      созданных из пиксельных x и y экрана клиента */
      let targetPoint;
      /* Если клиент не на планшете */
      if (!this.$deviceService.isMobile) {
        const x = this.cursorX - 0; // валидно, потому что #cesiumContainer всегда - на весь экран (если нет то "...  - this.canvas.getBoundingClientRect().left")
        const y = this.cursorY - 0;
        targetPoint = new Cesium.Cartesian2(x, y);
      } else {
        /* В случае с мобильным устройством курсор - это центральная точка (перекрестья), которая всегда находится по центру холста */
        targetPoint = new Cesium.Cartesian2(this.canvasCenterX, this.canvasCenterY);
      }
      // deprecated (страдает точность у поверхности при отсутствии кастомного рельефа)
      // /* Создаем луч от камеры до targetPoint (курсора мыши - аргумента в качестве windowPosition) */
      // const ray: Cesium.Ray | undefined = this.$viewerService.viewer.camera.getPickRay(targetPoint);
      // if (ray === undefined) throw new Error('target point is not correct');
      // /* Находим пересечение луча и отрендеренной поверхности гдобуса */
      // const cartesian: Cesium.Cartesian3 | undefined = this.$viewerService.viewer.scene.globe.pick(
      //   ray,
      //   this.$viewerService.viewer.scene,
      // );
      // Современное решение (проверено, значения совпадают):
      const cartesian: Cesium.Cartesian3 =
        this.$viewerService.viewer.scene.pickPosition(targetPoint);
      // Если курсор на холсте, но не на эллипсоиде
      if (cartesian === undefined) {
        this.clearCoords();
        return undefined;
      }
      if (this.$deviceService.isMobile) {
        this.setUnderMouseEntityPosition(cartesian);
        this.setUnderMouseEntityCoords(cartesian);
        return undefined;
      } else {
        return cartesian;
      }
    } catch (error: any) {
      this.calculationBlocker.set(false);
      error.cause = 'red';
      throw error;
    }
  }

  private setUnderMouseEntityPosition(cartesian: Cesium.Cartesian3): void {
    try {
      if (this.underMouseEntity() !== undefined && cartesian !== undefined) {
        // По документации Cesium.Entity.position может быть PositionProperty || Cartesian3 || CallbackPositionProperty
        // @ts-ignore
        this.underMouseEntity().position = cartesian;
      }
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  public selectedCrs = signal<CRS>('WGS-84');
  public async setSelectedCrs(newVal: CRS): Promise<void> {
    this.selectedCrs.set(newVal);
    if (
      this.underMouseEntity()?.position?.getValue() &&
      this.underMouseEntity()?.position?.getValue() instanceof Cesium.Cartesian3
    ) {
      await this.setUnderMouseEntityCoords(
        this.underMouseEntity()?.position?.getValue() as Cesium.Cartesian3,
      );
    }
  }

  public latitudeDescription = signal<string>('');
  public longitudeDescription = signal<string>('');
  public heightDescription = signal<string>('');
  private setNewCoordDescription(latitude: string, longitude: string, height: string): void {
    this.latitudeDescription.set(latitude);
    this.longitudeDescription.set(longitude);
    this.heightDescription.set(height);
  }

  private async setUnderMouseEntityCoords(cartesian: Cesium.Cartesian3): Promise<void> {
    if (this.underMouseEntity()) {
      const descrObj = await this.getPositionCoordsDescription(cartesian, this.selectedCrs());
      this.setNewCoordDescription(
        descrObj.latitudeDescription,
        descrObj.longitudeDescription,
        descrObj.heightDescription,
      );
      // По документации Cesium.Entity.label.text может быть Property || string
      // @ts-ignore
      this.underMouseEntity().label.text = descrObj.coordsDescription;
    }
  }

  public async getPositionCoordsDescription(
    cartesian: Cesium.Cartesian3,
    selectedCrs: CRS,
  ): Promise<{
    latitudeDescription: string;
    longitudeDescription: string;
    heightDescription: string;
    coordsDescription: string;
  }> {
    /* Преобразуем декартово (cartesian) представление в картографическое (cartographic) и получаем координаты */
    const cartographic =
      this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    // Если рельеф отключен вернет 0
    // + hEgm1999; //(if heights in source dtm is geodesic);
    const height = await this.$viewerService.getHeight(cartographic);
    // Используем полученные данные для пересчета в текущую систему координат
    const tCrsCoord = CoordSystems.fromCartographic(
      selectedCrs,
      {
        latitude: latitude,
        longitude: longitude,
        height: height,
      },
      '',
    );
    // Обновляем описание координат
    // Для компонента mouse-coords-info
    let latitudeDescription = '';
    let longitudeDescription = '';
    let heightDescription = '';
    // Для Cesium
    let coordsDescription: string = '';
    if (selectedCrs === 'СК-42 м') {
      latitudeDescription = `X: ${tCrsCoord.latitude.toFixed(1)} м`;
      longitudeDescription = `Y: ${tCrsCoord.longitude.toFixed(1)} м`;
      heightDescription = `H: ${tCrsCoord.height.toFixed(1)} м`;
      coordsDescription =
        `${latitudeDescription}\n` + `${longitudeDescription}\n` + `${heightDescription}`;
    } else {
      latitudeDescription = `B: ${tCrsCoord.latitude.toFixed(7)} ˚`;
      longitudeDescription = `L: ${tCrsCoord.longitude.toFixed(7)} ˚`;
      heightDescription = `H: ${tCrsCoord.height.toFixed(1)} м`;
      coordsDescription =
        `${latitudeDescription}\n` + `${longitudeDescription}\n` + `${heightDescription}`;
    }
    return {
      latitudeDescription,
      longitudeDescription,
      heightDescription,
      coordsDescription,
    };
  }

  private clearCoords(): void {
    if (this.latitudeDescription() !== '') this.latitudeDescription.set('');
    if (this.longitudeDescription() !== '') this.longitudeDescription.set('');
    if (this.heightDescription() !== '') this.heightDescription.set('');
    // @ts-ignore
    if (this.underMouseEntity()?.position) this.underMouseEntity().position = undefined;
    if (this.underMouseEntity()?.label?.text?.getValue() !== '')
      // @ts-ignore
      this.underMouseEntity().label.text = '';
  }

  ngOnDestroy() {
    if (this.mouseMoveSubscription) {
      this.mouseMoveSubscription.unsubscribe();
    }
    if (this.touchMoveSubscription) {
      this.touchMoveSubscription.unsubscribe();
    }
  }
}
