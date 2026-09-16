import { Injectable, signal, HostListener } from '@angular/core';
import * as Cesium from 'cesium';
import {
  exhaustMap,
  fromEvent,
  // fromEventPattern,
  map,
  Observable,
  Subscription,
  // switchMap,
} from 'rxjs';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CoordSystems } from '@/common/lib/coord-sistems.lib';
import type { CRS } from '@/common/lib/coord-sistems.lib';
import { DeviceService } from '@global/services/device-service/device.service';

@Injectable()
export class MouseCoordsService {
  constructor(
    private $viewerService: ViewerService,
    private $deviceService: DeviceService,
  ) {
    this._isMobile = this.$deviceService.checkMobile();
  }

  private _isMobile: boolean = false;
  get isMobile() {
    return this._isMobile;
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: Event) {
    this.canvas = this.$viewerService?.viewer?.scene?.canvas;
    this.canvasCenterX = this.canvas.scrollWidth / 2;
    this.canvasCenterY = this.canvas.scrollHeight / 2;
  }

  // Стартует вместе с viewer'ом и инструментами правой панели в директиве app-cesium.directive.ts
  public async startMouseCoordsService(): Promise<void> {
    this.canvas = this.$viewerService?.viewer?.scene?.canvas;
    if (!this.canvas) throw new Error('Scene canvas is undefined!');
    this.canvasCenterX = this.canvas.scrollWidth / 2;
    this.canvasCenterY = this.canvas.scrollHeight / 2;
    await this.setUnderMouseEntity();
    if (!this._isMobile) {
      this.mouseMoveSubscription = this.getMouseMoveSubscription();
      // this.cameraChangedSubscription = this.getcameraChangedSubscription();
      // Отменить в случае использования подписки cameraChangedSubscription
      this.$viewerService.viewer.camera.changed.addEventListener(() =>
        // для точного колбэка - viewer.camera.moveEnd (например, на мобильных устройствах, с применением центральной точки вместо курсора)
        this.cursorOnViewerCanvas.set(false),
      );
    } else {
      this.getCartesianFromCursor(undefined, true);
      this.touchMoveSubscription = this.getTouchMoveSubscription();
      // viewer.camera.changed listener не срабатывает первый и последующий каждый четвертый раз
      this.$viewerService.viewer.camera.moveEnd.addEventListener(
        this.getCartesianFromCursor.bind(this),
      );
    }
    // this.$viewerService.viewer.camera.changed.addEventListener(this.clearCoords.bind(this));
  }

  // Создание cesium-сущности под курсором мыши для получения его координат.
  // Используется в tools и mouse-coords-info
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
      const mouseMove$: Observable<Event> = fromEvent(this.watchedContainer, 'mousemove');
      // NOTICE: конструкцию не менять! (см. пояснения у this.setUnderMouseEntityPosition)
      return mouseMove$
        .pipe(
          // auditTime(100), // МЕШАЕТ ИНСТРУМЕНТАМ РАБОТЫ С КАРТОЙ (например, нарушается плавность mouse move построения, позиционирование точек)
          map((event: unknown) => {
            if (event instanceof MouseEvent) {
              const newPosition = this.getCartesianFromCursor(event);
              if (newPosition === undefined) return undefined;
              this.setUnderMouseEntityPosition(newPosition);
              return newPosition;
            } else return undefined;
          }),
          exhaustMap(async (newPosition: Cesium.Cartesian3 | undefined) => {
            if (newPosition === undefined) return undefined;
            await this.setUnderMouseEntityCoords(newPosition); // в том числе точный расчет высоты и ее внедрение в entity.position
          }),
        )
        .subscribe();
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  // declare private cameraChangedSubscription: Subscription;
  // private getcameraChangedSubscription(): Subscription {
  //   try {
  //     if (!this.watchedContainer)
  //       throw new Error('Planet container is not defined. Mouse scroll subscription was failed!');
  //     const cameraChanged$: Observable<Event> = fromEventPattern(
  //       (handler) => this.$viewerService.viewer.camera.changed.addEventListener(handler),
  //       (handler) => this.$viewerService.viewer.camera.changed.removeEventListener(handler),
  //     );
  //     // NOTICE: конструкцию не менять! (см. пояснения у this.setUnderMouseEntityPosition)
  //     return cameraChanged$
  //       .pipe(
  //         // auditTime(100), // МЕШАЕТ ИНСТРУМЕНТАМ РАБОТЫ С КАРТОЙ (например, нарушается плавность mouse move построения, позиционирование точек)
  //         map((event: unknown) => {
  //           if (event instanceof MouseEvent) {
  //             const newPosition = this.getCartesianFromCursor(event);
  //             if (newPosition === undefined) return undefined;
  //             this.setUnderMouseEntityPosition(newPosition);
  //             return newPosition;
  //           } else return undefined;
  //         }),
  //         exhaustMap(async (newPosition: Cesium.Cartesian3 | undefined) => {
  //           if (newPosition === undefined) return undefined;
  //           await this.setUnderMouseEntityCoords(newPosition); // в том числе точный расчет высоты и ее внедрение в entity.position
  //         }),
  //       )
  //       .subscribe(
  //         // !!! Отрабатывает, но координата не меняется
  //         () => console.log('camera changed event'),
  //       );
  //   } catch (error: any) {
  //     error.cause = 'red';
  //     throw error;
  //   }
  // }

  // Подписка на движение пальца (на точпаде) по эллипсоиду (оформляется при старте сервиса)
  declare private touchMoveSubscription: Subscription;
  private getTouchMoveSubscription(): Subscription {
    try {
      if (!this.watchedContainer)
        throw new Error('Planet container is not defined. Long touch subscription was failed!');
      const touchMove$: Observable<Event> = fromEvent(this.watchedContainer, 'touchmove');
      return touchMove$
        .pipe(
          map((event: unknown) => {
            if (event instanceof TouchEvent) {
              const newPosition = this.getCartesianFromCursor(event);
              if (newPosition === undefined) return undefined;
              this.setUnderMouseEntityPosition(newPosition);
              return newPosition;
            } else return undefined;
          }),
          exhaustMap(async (newPosition: Cesium.Cartesian3 | undefined) => {
            if (newPosition === undefined) return undefined;
            await this.setUnderMouseEntityCoords(newPosition); // в том числе точный расчет высоты и ее внедрение в entity.position
          }),
        )
        .subscribe();
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  // Уусловия показа поля с координатами (в левом нижнем углу)
  public cursorOnViewerCanvas = signal<boolean>(false);
  // В настоящий момент не требуется
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

  private getCartesianFromCursor(
    event?: MouseEvent | TouchEvent | number,
    firstTimeOnMobile?: boolean,
  ): Cesium.Cartesian3 | undefined {
    try {
      // Резервная проверка на существование холста
      if (!this.canvas) {
        this.cursorOnViewerCanvas.set(false);
        console.log('Scene canvas is undefined!');
        return undefined;
      }
      const targetPoint: Cesium.Cartesian2 | undefined = this.getCursorXY(event);
      let cartesian: Cesium.Cartesian3 | undefined = undefined;
      if (targetPoint?.x && targetPoint?.y)
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
        cartesian = this.$viewerService?.viewer?.scene?.pickPosition(targetPoint);
      // Если курсор на холсте, но не на эллипсоиде
      if (targetPoint === undefined || cartesian === undefined) {
        this.clearCoords();
        if (firstTimeOnMobile) {
          setTimeout(() => this.getCartesianFromCursor(undefined, true), 1000); // когда эллипсоид еще не успел отрендериться
        }
        return undefined;
      }
      // Для viewer.camera.moveEnd || firstTimeOnMobile === true (при котором так же event === undefined)
      if (!event || typeof event === 'number') {
        this.setUnderMouseEntityPosition(cartesian);
        this.setUnderMouseEntityCoords(cartesian);
        return undefined;
      }
      return cartesian;
    } catch (error: any) {
      this.calculationBlocker.set(false);
      error.cause = 'red';
      throw error;
    }
  }

  public getCursorXY(event?: MouseEvent | TouchEvent | number): Cesium.Cartesian2 | undefined {
    try {
      // console.log(event?.type);
      // console.log(event);
      // Резервная проверка на существование холста
      if (!this.canvas) {
        this.cursorOnViewerCanvas.set(false);
        console.log('Scene canvas is undefined!');
        return undefined;
      }
      if ((event instanceof TouchEvent && event.type === 'touchmove') || this._isMobile) {
        return new Cesium.Cartesian2(this.canvasCenterX, this.canvasCenterY);
      }
      if (
        event instanceof MouseEvent
        //  || event instanceof TouchEvent
      ) {
        // if (event instanceof MouseEvent) {
        this.cursorX = event.pageX;
        this.cursorY = event.pageY;
        // }
        // if (event instanceof TouchEvent && event.touches?.length) {
        //   const touch = event.touches[0] || event.changedTouches[0];
        //   this.cursorX = touch.pageX;
        //   this.cursorY = touch.pageY;
        // }
        // Если курсор мыши - не на холсте цесиума (а на UI поверх него)...
        if (event.target !== this.canvas) {
          // Прекращаем расчеты
          this.calculationBlocker.set(true);
          // Скрываем поле с координатами возле курсора
          this.cursorOnViewerCanvas.set(false);
        } else {
          // Продолжаем расчеты (курсор на холсте)
          this.cursorOnViewerCanvas.set(true);
          this.calculationBlocker.set(false);
        }
      } else {
        // если нет объекта event, считаем, что метод вызван колбэком Cesium-события
        if (this.calculationBlocker() === true) this.calculationBlocker.set(false);
        if (this.cursorOnViewerCanvas() === false) this.cursorOnViewerCanvas.set(true);
      }
      // Резервная проверка (для соответствия с UI глобальных координат)
      if (this.calculationBlocker()) return undefined;
      /* Положение курсора мыши. Параметр должен быть выражен в мировых координатах (cartesian), 
      созданных из пиксельных x и y экрана клиента */
      const x = this.cursorX - 0; // валидно, потому что #cesiumContainer всегда - на весь экран (если нет то "...  - this.canvas.getBoundingClientRect().left")
      const y = this.cursorY - 0;
      return new Cesium.Cartesian2(x, y); // target point
    } catch (error: any) {
      this.calculationBlocker.set(false);
      error.cause = 'red';
      throw error;
    }
  }

  // NOTICE: пока без учета максимальной точности в подборе высоты (без применения this.$viewer.getHeight()) - реализовано ниже (в this.setUnderMouseEntityCoords()).
  // this.$viewer.getHeight() - затратная операция и, если ее дожидаться, то теряется плавность построений на холсте, зависящих от this.underMouseEntity().position.
  // Поэтому, в подписке this.underMouseEntity().position устанавливается в .pipe.map, а точная высота (с самого нижнего слоя рельефа)
  // добавляется уже в setUnderMouseEntityCoords в .pipe.map.exhaustMap (ожидает выполненния ассинхронной операции, пропуская выполнение внеочередных (не копится пул выполнений), последний в очереди запрос также будет выполне).
  private setUnderMouseEntityPosition(cartesian: Cesium.Cartesian3): void {
    try {
      const underMouseEntity = this.underMouseEntity();
      if (underMouseEntity !== undefined && cartesian !== undefined) {
        underMouseEntity.position = new Cesium.ConstantPositionProperty(cartesian);
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
      // На этом моменте this.mostDetailedHeightUnderCursor получит актуальное значение
      const descrObj = await this.getPositionCoordsDescription(cartesian, this.selectedCrs());
      this.setNewCoordDescription(
        descrObj.latitudeDescription,
        descrObj.longitudeDescription,
        descrObj.heightDescription,
      );
      const underMouseEntity = this.underMouseEntity();
      if (underMouseEntity?.label !== undefined && descrObj?.coordsDescription !== undefined) {
        underMouseEntity.label.text = new Cesium.ConstantProperty(descrObj.coordsDescription);
      }

      // ---------------------------------------------------------------- //

      // Set most deep height on under cursor entity's position
      const cartesianUnderCursor: Cesium.Cartesian3 | undefined =
        this.underMouseEntity()?.position?.getValue();
      if (cartesianUnderCursor !== undefined && cartesianUnderCursor instanceof Cesium.Cartesian3) {
        const cartographictUnderCursor: Cesium.Cartographic =
          Cesium.Cartographic.fromCartesian(cartesianUnderCursor);
        // Расхождение, т.к. heightUnderCursor берется с текущего уровня тайлов рельефа (зависит от высоты камеры)
        // console.log(cartographictUnderCursor.height, this.mostDetailedHeightUnderCursor);
        if (
          this.mostDetailedHeightUnderCursor &&
          cartographictUnderCursor.height !== this.mostDetailedHeightUnderCursor
        ) {
          const newCartographic = new Cesium.Cartographic(
            cartographictUnderCursor.longitude,
            cartographictUnderCursor.latitude,
            this.mostDetailedHeightUnderCursor,
          );
          const newCursorPosition: Cesium.Cartesian3 =
            Cesium.Cartographic.toCartesian(newCartographic);
          if (underMouseEntity !== undefined && newCursorPosition !== undefined) {
            underMouseEntity.position = new Cesium.ConstantPositionProperty(newCursorPosition);
          }
          // console.log(
          //   Cesium.Cartographic.fromCartesian(newCursorPosition).height,
          //   this.mostDetailedHeightUnderCursor,
          // );
        }
      }
    }
  }

  public mostDetailedHeightUnderCursor: number = 0;
  public async getPositionCoordsDescription(
    cartesian: Cesium.Cartesian3,
    selectedCrs: CRS,
  ): Promise<{
    latitudeDescription: string;
    longitudeDescription: string;
    heightDescription: string;
    coordsDescription: string;
  }> {
    if (cartesian === undefined)
      return {
        latitudeDescription: 'нет данных',
        longitudeDescription: 'нет данных',
        heightDescription: 'нет данных',
        coordsDescription: 'нет данных',
      };
    /* Преобразуем декартово (cartesian) представление в картографическое (cartographic) и получаем координаты */
    const cartographic =
      this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    // Если рельеф отключен вернет 0
    // + hEgm1999; //(if heights in source dtm is geodesic);
    const height = await this.$viewerService.getHeight(cartographic);
    this.mostDetailedHeightUnderCursor = height;
    // Используем полученные данные для пересчета в текущую систему координат
    const tCrsCoord = CoordSystems.fromWGS84Cartographic(
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
    const underMouseEntity = this.underMouseEntity();
    if (underMouseEntity !== undefined) {
      underMouseEntity.position = undefined;
      if (underMouseEntity?.label?.text) {
        underMouseEntity.label.text = new Cesium.ConstantProperty('');
      }
    }
  }

  public async getMouseEntity(mostDetailedHeightFlag: boolean = true): Promise<Cesium.Entity> {
    // DEPRECATED: высота с самого нижнего тайла добавляется ассинхронно, точность координаты (при включенном рельефе) может быть потеряна
    // return this.underMouseEntity() as Cesium.Entity || this._viewer.dataSources
    //   .getByName('mousePosition')[0]
    //   .entities.getById('mouse') as Cesium.Entity;

    const quickUnderMouseEntity = this.underMouseEntity();
    if (!(quickUnderMouseEntity instanceof Cesium.Entity)) {
      throw new Error('FAILED getMouseEntity() EXECUTION');
    }
    try {
      if (mostDetailedHeightFlag === false) return quickUnderMouseEntity;
      const cartesianUnderCursor: Cesium.Cartesian3 | undefined =
        quickUnderMouseEntity?.position?.getValue();
      if (
        cartesianUnderCursor === undefined ||
        !(cartesianUnderCursor instanceof Cesium.Cartesian3)
      )
        // throw new Error('Invalid position from under mouse entity');
        return quickUnderMouseEntity;
      const cartographictUnderCursor: Cesium.Cartographic =
        Cesium.Cartographic.fromCartesian(cartesianUnderCursor);
      const mostDetailedHeightUnderCursor =
        await this.$viewerService.getHeight(cartographictUnderCursor);
      // console.log(cartographictUnderCursor.height, mostDetailedHeightUnderCursor);
      if (
        mostDetailedHeightUnderCursor &&
        cartographictUnderCursor.height !== mostDetailedHeightUnderCursor
      ) {
        const newCartographic = new Cesium.Cartographic(
          cartographictUnderCursor.longitude,
          cartographictUnderCursor.latitude,
          mostDetailedHeightUnderCursor,
        );
        const newCursorPosition: Cesium.Cartesian3 =
          Cesium.Cartographic.toCartesian(newCartographic);
        const modifiedUnderMouseEntity = quickUnderMouseEntity;
        modifiedUnderMouseEntity.position = new Cesium.ConstantPositionProperty(newCursorPosition);
        // console.log(
        //   Cesium.Cartographic.fromCartesian(newCursorPosition).height,
        //   mostDetailedHeightUnderCursor,
        // );
        return modifiedUnderMouseEntity;
      } else {
        return quickUnderMouseEntity;
      }
    } catch (error: unknown) {
      console.log(error);
      return quickUnderMouseEntity || new Cesium.Entity();
    }
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
