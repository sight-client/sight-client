/* "viewer" - достаточно объемный объект, поэтому создавать из него "WritableSignal" нецелесообразно затратно. 
Кроме того, "WritableSignal" оповещает о своем изменении только при замене своего значения, 
что в случае с переменной объекта является потерей старой ссылки, что равнозначно пересозданию. 
Метод "WritableSignal.update()", не смотря на то, что позволяет выборочно изменять содержимое реактивного объекта, 
тем не менее, также полностью обновляет его ссылку (старый объект уже не равен новому). 
Поэтому, в целях получения реактивности дефолтных свойств "viewer" (например, clampToGround) необходимо применять ее адресно: 
создавать сигналы соответствующие таким свойствам, как методы данного класса, изменять сигналы из потребителя услуг (сеттерами)
и, отслеживая эти изменения в effect (computed в свойствах viewer, увы, не работает), обеспечить параллельное изменение 
привязанного свойства viewer'а. Для кастомных же свойств (например, newPickedEntity) можно использовать сигналы прямо в объекте viewer. */
/* В случае необходимости использования сигнала объекта в качестве отслеживаемого дублирующего свойства, 
а также при нежелании полностью переписывать такой объект в методе "WritableSignal.set()", 
целесообразно использовать метод "WritableSignal.update()". Пример с объектом и двумя свойствами под изменение: 
$viewerService.viewer.test.update((previousState: WritableSignal<any>) => {
   return {
     ...previousState, testKeyOne: newValOne, testKeyTwo: newValTwo
   }
});
*/

import { computed, effect, Injectable, signal, WritableSignal } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';
import * as Humanify from '@/common/lib/humanify.lib';

import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';

export interface CustomViewer extends Cesium.Viewer {
  newPickedEntity?: WritableSignal<Cesium.Entity | undefined>;
  newPickedEntityId?: WritableSignal<string | undefined>;
  forcedPickedEntity?: WritableSignal<Cesium.Entity | undefined>;
  forcedPickedEntityId?: WritableSignal<string | undefined>;
  clampToGround?: boolean;
  dropError?: Cesium.Event;
  // test?: WritableSignal<any>;
}

export type SceneModeLiterals = '3D' | '2D' | 'Columbus';

// Применение сервиса - на уровне planet.ts
@Injectable()
export class ViewerService {
  constructor(private $SetProgressSpinnerService: SetProgressSpinnerService) {
    effect(() => {
      this.clampToGroundSignal();
      if (this.viewer?.clampToGround !== undefined) {
        this.viewer.clampToGround = this.clampToGroundSignal();
      }
    });
    // ----------------------------------------------------------- //
    const sceneModeDescription: SceneModeLiterals | unknown = localStorage.getItem('sceneMode');
    if (sceneModeDescription === '3D') {
      this._nowSceneMode.set(Cesium.SceneMode.SCENE3D);
    } else if (sceneModeDescription === '2D') {
      this._nowSceneMode.set(Cesium.SceneMode.SCENE2D);
    } else if (sceneModeDescription === 'Columbus') {
      this._nowSceneMode.set(Cesium.SceneMode.COLUMBUS_VIEW);
    } else {
      this._nowSceneMode.set(Cesium.SceneMode.SCENE3D);
    }
  }
  // Реактивные свойства для нового viewer
  // Сигналы, которые viewer не позволяет использовать в своем объекте
  public clampToGroundSignal = signal<boolean>(true);
  public setClampToGround(newVal: boolean): void {
    this.clampToGroundSignal.set(newVal);
  }
  private _nowSceneMode = signal<Cesium.SceneMode>(Cesium.SceneMode.SCENE3D);
  get nowSceneMode() {
    return this._nowSceneMode;
  }
  public setNowSceneMode(newVal: Cesium.SceneMode): void {
    this._nowSceneMode.set(newVal);
  }
  // Сигнал для контроля конфликта entity.label и entity.billboard при активных SCENE2D и COLUMBUS_VIEW
  private _nowSceneModeDescription = computed<SceneModeLiterals>(() => {
    if (this._nowSceneMode() === Cesium.SceneMode.SCENE3D) {
      return '3D';
    }
    if (this._nowSceneMode() === Cesium.SceneMode.SCENE2D) {
      return '2D';
    }
    if (this._nowSceneMode() === Cesium.SceneMode.COLUMBUS_VIEW) {
      return 'Columbus';
    }
    return '3D';
  });
  get nowSceneModeDescription() {
    return this._nowSceneModeDescription;
  }

  // Сигналы созданы в getNewViewer()
  public setNewPickedEntity(newVal: Cesium.Entity | undefined): void {
    if (this?.viewer?.newPickedEntity) this.viewer.newPickedEntity.set(newVal);
    if (this?.viewer?.newPickedEntityId) this.viewer.newPickedEntityId.set(newVal?.id);
    this.setForcedPickedEntity(newVal);
  }
  public setForcedPickedEntity(newVal: Cesium.Entity | undefined): void {
    if (this?.viewer?.forcedPickedEntity) this.viewer.forcedPickedEntity.set(newVal);
    if (this?.viewer?.forcedPickedEntityId) this.viewer.forcedPickedEntityId.set(newVal?.id);
    this._forcedEntityPickingEffectFlag.set(!this._forcedEntityPickingEffectFlag());
  }

  // ------------------------------------------------- //
  public startCamDestination = new Cesium.Cartesian3(
    // вид на РФ
    3959560.375765544,
    3060863.8909900715,
    7315436.412837542,
    // вид на весь глобус
    // 15181365.06731483,
    // 12293627.033615991,
    // 23247855.672561906,
  );
  // ------------------------------------------------- //

  // Создание объекта нового viewer
  /* Данный обход линтеринга TS позволяет сильно уменьшить дублирование проверок на "viewer !== undefined" и ни на что не влияет, 
  если правильно применять необходимые проверки на "!undefined" (в опционально цепочке по месту). Все равно, имеется постоянная 
  необходимость обращаться к уже созданным свойствам "viewer" из других компонентов НЕ РАНЕЕ фазы их жизненного цикла "afterNextRender" */
  public viewer: CustomViewer = {} as CustomViewer;
  public viewerHasLoaded = signal<boolean>(false);
  public firstBaseLayerRenderFinished = signal<boolean>(false);

  // viewer получает первое значение из run-viewer.directive.ts однократно при первом рендеринге planet.html
  public getNewViewer(container: Element | string) {
    try {
      this.viewer = new Cesium.Viewer(container, {
        /* Виджет для воспроизведения анимации */
        animation: false,
        /* Стандартный виджет для выбора слоев. Используется, как основа, в нашем customBaselLayerPicker. */
        baseLayerPicker: false,
        /* Кнопка разворота на весь экран */
        fullscreenButton: false,
        /* Кнопка для переключения в VR-режим */
        geocoder: false,
        /* Кнопка возврата к виду по умолчанию (у нас - взята из навигационного миксина) */
        homeButton: false,
        /* Информационное окно для описания нанесенных на слои сущностей */
        infoBox: false,
        /* Вид отображения глобуса: 3D, 2D, перспектива */
        sceneModePicker: false /* позже подключаем непосредственно в сооответствющем vue-модуле */,
        /* Виджет для отображения индикатора на выбранном объекте (как в старых RTS) - некорректно работает на мультиполигонах, но можно использовать на 3D-моделях */
        selectionIndicator: false,
        /* Виджет для управления временем отображения сцены */
        timeline: false,
        /* Мануал по управлению навигацией по глобусу */
        navigationHelpButton: false /* позже подключаем непосредственно в сооответствющем vue-модуле */,
        /* Установка на просмотр карты в 2D, 2,5D, 3D - по умолчанию */
        sceneMode: this._nowSceneMode(),
        /* При true геометрия будет отображаться только в 3D-режиме (для экономии памяти GPU) */
        scene3DOnly: false,
        /* true - для запуска симуляции по умолчанию (имеет приоритет перед viewer#clockViewModel) */
        shouldAnimate: true,
        // imageryProvider: newSentinelProvider(),
        /* Подложка рельефа на поверхность элипсоида (пирамида тайлов). Оставлено значение по умолчанию. */
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        /* Размытие активного элемента на холсте */
        blurActiveElementOnCanvasFocus: true,
        /* Проекция карты для использования в режимах 2D и columbus */
        mapProjection: new Cesium.GeographicProjection(),
        // mapProjection: new Cesium.WebMercatorProjection()
        /* Сглаживание MSAA. По умолчанию равно 4 (большие значения увеличат нагрузку на производительность) */
        msaaSamples: 4,
        /* Если true, создаст соответствующий виджет */
        projectionPicker: false,
        /* Включение явного рендеринга с целью повышения производительности (сложно реализовать в коде) */
        requestRenderMode: false,
        /* Тени от объектов */
        shadows: false,
        /* Тени от рельефа */
        terrainShadows: Cesium.ShadowMode.DISABLED,
        // terrainShadows: Cesium.ShadowMode.ENABLED,
        /* Голубое небо и свечение вокруг лимбо Земли */
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        /* Предоставляет изображения для отображения на элипсоиде. Здесь подключена сетка тайлов. Устаревши способ.
        Данная опция отсутствует в нынешней документации для Cesium.Viewer.ConstructorOptions (есть в Cesium.Viewer.Scene).
        Однако, установка начальной подложки по конструктору (с помощью baseLayer - см. ниже) в настоящем контексте дает 
         заметную глазу задержку смены провайдера на первичный (например, OSM). Указаны стандартные установки GridImageryProvider: */
        //@ts-ignore (не по конструктору, но пока оптимальо)
        imageryProvider: new Cesium.GridImageryProvider({
          // tilingScheme: new Cesium.GeographicTilingScheme(),
          // ellipsoid: Cesium.Ellipsoid.WGS84,
          // cells: 8,
          // color: new Cesium.Color(1.0, 1.0, 1.0, 0.4),
          // glowColor: new Cesium.Color(0.0, 1.0, 0.0, 0.05),
          // glowWidth: 6,
          // backgroundColor: new Cesium.Color(0.0, 0.5, 0.0, 0.2),
          // tileWidth: 256,
          // tileHeight: 256,
          // canvasSize: 256,
        }),
        // Установка по конструктору Viewer'а 2026
        // baseLayer: new Cesium.ImageryLayer(
        //   new Cesium.GridImageryProvider(),
        // ),
      });

      // Контрольная проверка
      if (!Object.keys(this.viewer)) throw new Error("at getNewViewer(): viewer wasn't create");

      /* Кастомные свойства для альтернативы дефолтному инфобоксу */
      this.viewer.newPickedEntity = signal<Cesium.Entity | undefined>(undefined);
      this.viewer.newPickedEntityId = signal<string | undefined>(undefined);
      this.viewer.forcedPickedEntity = signal<Cesium.Entity | undefined>(undefined);
      this.viewer.forcedPickedEntityId = signal<string | undefined>(undefined);

      /* Кастомный параметр прикрепления к земле (используется, например, в инструментах работы с картой) */
      this.viewer.clampToGround = true;

      /* Миксин, который добавляет поддержку перетаскивания для файлов CZML */
      // Add basic drag and drop support and pop up an alert window on error.
      this.viewer.extend(Cesium.viewerDragDropMixin, {
        dropTarget: this.viewer.container,
        clearOnDrop: false,
        flyToOnDrop: true,
        clampToGround: true,
      });
      if (this.viewer?.dropError) {
        this.viewer.dropError.addEventListener((_dropHandler__viewerArg, source, error) => {
          // console.log(error);
          // window.alert(error);
          console.log('Error processing ' + source + ':' + error);
          window.alert('Error processing ' + source + ':' + error);
        });
      }

      /* Установка начального вида вьюера (при загрузке и по соответствующей кнопке в навигационном миксине) */
      this.viewer.camera.setView({
        destination: this.startCamDestination,
        orientation: {
          heading: 6.283185307179586,
          pitch: -1.5707963267948966, // 90 degrees
          roll: 0,
        } as Cesium.HeadingPitchRollValues,
      });

      /* Уменьшает количество усеченных полигонов. Включение позволит увеличить производительность. */
      this.viewer.scene.logarithmicDepthBuffer = false;

      /* Экономит память за счет игнорирования обработки рельефа вне поля зрения */
      this.viewer.scene.globe.backFaceCulling = true;

      /* Освещение глобуса источником света сцены (тень на глобусе) */
      this.viewer.scene.globe.enableLighting = false;

      /* Отображение атмосферы при наблюдении с расстояния от lightingFadeInDistance и lightingFadeOutDistanse */
      this.viewer.scene.globe.showGroundAtmosphere = true;

      /* Зум колесиком мыши */
      this.viewer.scene.screenSpaceCameraController.enableZoom = true;
      this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1.0;
      this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 100000000.0;

      // Disable camera collision to allow it to go underground or below a 3D Tileset surface
      /* При false игнорируются maximumZoomDistance и minimumZoomDistance (колесика мыши) */
      this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;

      /* Проверка на перекрытие объектов ландшафтом.
      Неадекватно ведет себя с минимальным camera.pitch (угол наклона к поверхности).
      В true не переключать! Вместо этого использовать локальную настройку disableDepthTestDistance: undefined - для сокрытия за рельефом || Number.POSITIVE_INFINITY - для видимости через рельеф. */
      this.viewer.scene.globe.depthTestAgainstTerrain = false;

      /* Скрыть лого Цесиума (левый нижний угол) */
      (this.viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

      // Свечение бликов
      this.viewer.scene.postProcessStages.bloom.enabled = false;

      // // /* Устанавливает значение по умолчанию для привязки к земле geoJSON-данных (default value: false). Нигде не используется */
      // // // Cesium.GeoJsonDataSource.clampToGround = true;

      // // /* Эффект постобработки, имитирующий блики света на объективе камеры */
      // // viewer.scene.postProcessStages.add(
      // //   Cesium.PostProcessStageLibrary.createLensFlareStage(),
      // // );

      // // /* Миксин для помощи в отладке */
      // // viewer.extend(Cesium.viewerCesiumInspectorMixin, {});

      // При включении полигоны, являющиеся примитивами, просвечиваются через земной шар.
      // const oldPrimitiveUpdate: Function = Cesium.Primitive.prototype.update;
      // Cesium.Primitive.prototype.update = function (frameState?: Cesium.Scene): void {
      //   if (frameState) {
      //     // this.appearance._renderState.depthTest.enabled = false;
      //     this.appearance.renderState.depthTest.enabled = false;
      //     oldPrimitiveUpdate.call(this, frameState);
      //   }
      // };

      /* Пользовательский хук (с cesium-форума), чтобы полилинии и примитивы рисовались всегда поверх */
      // override Cesium.PolylineCollection.prototype.update for depthTest polylines and polygons
      const oldPolylineUpdate: Function = Cesium.PolylineCollection.prototype.update;
      Cesium.PolylineCollection.prototype.update = function newUpdate(
        // Информация о состоянии текущего кадра
        frameState?: Cesium.Scene,
      ): void {
        if (frameState) {
          const oldMorphTime: number = frameState?.morphTime;
          if (oldMorphTime !== undefined) {
            // Текущее время морф-перехода между 2D/Columbus View и 3D, где 0.0 — 2D или Columbus View, а 1.0 — 3D.
            frameState.morphTime = 0.0;
            oldPolylineUpdate.call(this, frameState);
            frameState.morphTime = oldMorphTime;
          }
        }
      };
      const oldPrimitiveUpdate: Function = Cesium.Primitive.prototype.update;
      Cesium.Primitive.prototype.update = function (frameState?: Cesium.Scene): void {
        if (frameState) {
          // this.appearance._renderState.depthTest.enabled = false;
          this.appearance.renderState.depthTest.enabled = false;
          oldPrimitiveUpdate.call(this, frameState);
        }
      };

      /* Отключит дефолтное приближение к сущностям по двойному клику ЛКМ (мешает, например, на точечных объектах, плюс, фокусит камеру) */
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );
      /* Кастомная замена */
      this.viewer.screenSpaceEventHandler.setInputAction(
        this.flyToEntityWhithItPicking.bind(this),
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );

      /* Отключит дефолтный выбор сущностей по ЛКМ (если в проекте не нужен подобный вызов дефолтного viewer.infobox) */
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      /* Кастомная замена */
      this.viewer.screenSpaceEventHandler.setInputAction(
        this.setNewPickedEntityByClickOnScene.bind(this),
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );

      // Оповещение зависящих от Cesium.Viewer сервисов
      this.viewerHasLoaded.set(true);

      // Оповещение об окончании рендера первичной базовой подложки (трудоемкая отрисовка при общей стартовой нагрузке)
      const firstRenderHandler = (event: number): void => {
        if (event === 0 && this.firstBaseLayerRenderFinished() === false) {
          this.firstBaseLayerRenderFinished.set(true);
          this.viewer.scene.globe.tileLoadProgressEvent.removeEventListener(firstRenderHandler); // проверено
        }
      };
      this.viewer.scene.globe.tileLoadProgressEvent.addEventListener(firstRenderHandler);

      // Предотвращение ухода камеры под подложку при использовании znenz navigation mixin (3d, в том числе рельеф, контролирует свойство viewer.scene.screenSpaceCameraController.enableCollisionDetection)
      this.viewer.scene.camera.changed.addEventListener(this.controlCameraView);
    } catch (error: unknown) {
      throw error;
    }
  }

  private controlCameraView = () => {
    try {
      // const camHeading = this.viewer.camera.heading;
      // const cameraPitch: number = Number(this.viewer.scene.camera.pitch);
      // const camRoll = this.viewer.camera.roll;
      // console.log(camHeading, cameraPitch, camRoll);
      // Принудительный контроль высоты камеры по параметру "pitch" (> 0.12 - уход под подложку при отсутствии рельефа)
      const cameraCoords = this.viewer.scene.camera.positionCartographic;
      const camHeight: number = Number(cameraCoords.height);
      if (this.viewer.scene.camera.pitch > 0.12) {
        this.cameraBlokcerHandler(camHeight, 0, 0.12);
      }
      // Принудительный контроль высоты камеры по параметру "height"
      if (camHeight < 1) this.cameraBlokcerHandler(1, 0);
      // Deprecated
      // // Принудительный контроль высоты камеры по параметру "pitch" (> 0.12 - уход под подложку при отсутствии рельефа)
      // if (this.viewer.scene.camera.pitch > 0.12) {
      //   this.cameraBlokcerHandler(1000, 0.1, 0.12);
      // } else {
      //   // Принудительный контроль высоты камеры по параметру "height"
      //   const cameraCoords = this.viewer.scene.camera.positionCartographic;
      //   const camHeight: number = Number(cameraCoords.height);
      //   if (camHeight < 1) this.cameraBlokcerHandler(1000, 0.1);
      // }
    } catch (error: unknown) {
      console.log(error);
    }
  };

  public cameraBlokcerHandler(
    height: number,
    duration: number = 1.0,
    pitch: number | undefined = undefined,
    heading?: number,
    roll?: number,
  ): void {
    try {
      if (typeof height !== 'number') return;
      const camLongitude = this.viewer.camera.positionCartographic.longitude;
      const camLatitude = this.viewer.camera.positionCartographic.latitude;
      const camHeading = heading || this.viewer.camera.heading;
      const camPitch = pitch || this.viewer.camera.pitch;
      const camRoll = roll || this.viewer.camera.roll;
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(camLongitude, camLatitude, height),
        maximumHeight: height,
        orientation: {
          heading: camHeading,
          pitch: camPitch,
          roll: camRoll,
        },
        duration: duration,
      });
    } catch (error: unknown) {
      console.log(error);
    }
  }

  // Флаг для блокировки конфликтных перемещений камеры во время вращения вокруг выбранной пользователем точки (инструмент "АднФкщгтв")
  public readonly cameraIsFlyingAround = signal<boolean>(false);
  public setCameraFlyingAroundFlag(newVal: boolean): void {
    if (typeof newVal === 'boolean') {
      this.cameraIsFlyingAround.set(newVal);
    } else console.log('Invalid newVal in setCameraFlyingAroundFlag');
  }

  /* Альтернатива глобальному лисенеру 2хЛКМ */
  // async/await применена по причине возврата Promise из методов Cesium
  public async flyToEntityWhithItPicking(
    cartesian2FromClick: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  ): Promise<void> {
    try {
      if (this.cameraIsFlyingAround() === true) {
        this.setCameraFlyingAroundFlag(false);
      }
      const targetEntity: Cesium.Entity | undefined =
        this.setNewPickedEntityByClickOnScene(cartesian2FromClick);
      if (!targetEntity || !(targetEntity instanceof Cesium.Entity)) {
        return;
        // throw new Error('at flyToEntityWhithItPicking(): targetEntity is undefined');
      }
      await this.flyTo(targetEntity);
    } catch (error: unknown) {
      throw error;
    }
  }

  public async flyTo(
    target:
      | number[]
      | Cesium.Entity
      | Cesium.EntityCollection
      | Cesium.DataSource
      | Cesium.Entity[]
      | Cesium.Cesium3DTileset
      | undefined,
    whole?: boolean,
  ): Promise<void> {
    try {
      if (!target) return;

      // Сбрасываем флаг вращения камеры, если он активен
      if (this.cameraIsFlyingAround?.() === true) {
        this.setCameraFlyingAroundFlag(false);
      }

      // Прямоугольник (Массив чисел)
      // Проверяем, что это массив и его первый элемент — число
      if (Array.isArray(target) && typeof target[0] === 'number') {
        const rect = target as number[]; // Явное приведение для безопасности компилятора
        this.viewer.camera.flyTo({
          destination: Cesium.Rectangle.fromCartographicArray([
            Cesium.Cartographic.fromDegrees(rect[0], rect[1]),
            Cesium.Cartographic.fromDegrees(rect[2], rect[3]),
          ]),
          duration: 2,
        });
        return;
      }

      // Одиночный Cesium.Entity
      if (target instanceof Cesium.Entity) {
        if (whole === true || !target.position) {
          await this.viewer.flyTo(target);
          return;
        }

        const targetCartesian3 = target.position.getValue(this.viewer.clock.currentTime);
        if (!targetCartesian3) {
          await this.viewer.flyTo(target);
          return;
        }

        // Ваша кастомная логика расчета камеры для Entity с сохранением ракурса
        const targetCartographic = Cesium.Cartographic.fromCartesian(targetCartesian3);
        const calcLongitude = Cesium.Math.toDegrees(targetCartographic.longitude);
        const calcLatitude = Cesium.Math.toDegrees(targetCartographic.latitude);
        const nowCameraHeight = this.viewer.camera.positionCartographic.height;
        const newCameraPos = Cesium.Cartesian3.fromDegrees(
          calcLongitude,
          calcLatitude,
          nowCameraHeight,
        );

        const nowCameraHeading = this.viewer.camera.heading;
        const nowCameraRoll = this.viewer.camera.roll;
        const direction = new Cesium.Cartesian3();

        Cesium.Cartesian3.subtract(targetCartesian3, newCameraPos, direction);
        Cesium.Cartesian3.normalize(direction, direction);

        const enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(newCameraPos);
        const localDirection = new Cesium.Cartesian3();
        const inverseEnu = Cesium.Matrix4.inverse(enuTransform, new Cesium.Matrix4());

        Cesium.Matrix4.multiplyByPointAsVector(inverseEnu, direction, localDirection);
        const pitch = Math.asin(localDirection.z);

        this.viewer.camera.flyTo({
          destination: newCameraPos,
          maximumHeight: nowCameraHeight,
          orientation: {
            heading: nowCameraHeading,
            pitch: pitch,
            roll: nowCameraRoll,
          },
        });
        return;
      }

      // Коллекции (EntityCollection, DataSource, Array) и 3DTileset
      // Исключаем number[] из оставшихся типов, чтобы viewer.flyTo принял аргумент без ошибок
      if (!Array.isArray(target) || (target.length > 0 && target[0] instanceof Cesium.Entity)) {
        await this.viewer.flyTo(
          target as
            | Cesium.Entity
            | Cesium.EntityCollection
            | Cesium.DataSource
            | Cesium.Entity[]
            | Cesium.Cesium3DTileset,
        );
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  // Используются, например, в скрвисах инструментов работы с картой (для действий по ЛКМ)
  private _entityPickingBlock = signal<boolean>(false);
  get entityPickingBlock() {
    return this._entityPickingBlock;
  }
  public onEntityPickingBlock(): void {
    this._entityPickingBlock.set(true);
    // console.log('onEntityPickingBlock');
  }
  public offEntityPickingBlock(): void {
    this._entityPickingBlock.set(false);
    // console.log('offEntityPickingBlock');
  }

  /* Альтернатива глобальному лисенеру 1хЛКМ */
  public setNewPickedEntityByClickOnScene(
    cartesian2PositionFromClick: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  ): Cesium.Entity | undefined {
    try {
      if (this._entityPickingBlock() === true) return;
      const newPickedEntity: Cesium.Entity | undefined = this.pickEntityByClickOnScene(
        cartesian2PositionFromClick.position,
      );
      if (newPickedEntity && newPickedEntity instanceof Cesium.Entity) {
        if (this.viewer.newPickedEntity?.() !== newPickedEntity) {
          this.setNewPickedEntity(newPickedEntity);
        }
        this.setForcedPickedEntity(newPickedEntity);
        this._forcedEntityPickingEffectFlag.set(!this._forcedEntityPickingEffectFlag());
        console.log(newPickedEntity);
        return newPickedEntity;
      } else return undefined;
    } catch (error: unknown) {
      throw error;
    }
  }

  // Если сущность уже была записана в сигнал forcedPickedEntity, он не оповестит наблюдателей об отработки хэндлера для ЛКМ.
  // Поэтому, для форсированного отслеживания используется специальный флаг (применять по месту).
  private _forcedEntityPickingEffectFlag = signal<boolean>(false); // "обманка" для эффекта
  get forcedEntityPickingEffectFlag() {
    return this._forcedEntityPickingEffectFlag;
  }

  // Такжк используется в drawing.service.ts
  public pickEntityByClickOnScene(position: Cesium.Cartesian2): Cesium.Entity | undefined {
    try {
      const picked: any | undefined = this.viewer.scene.pick(position);
      if (Cesium.defined(picked)) {
        // const entity: Cesium.Entity = Cesium.defaultValue(picked.id, picked.primitive.id); // deprecated
        const entity: Cesium.Entity = picked?.id ? picked.id : picked.primitive?.id;
        if (entity && entity instanceof Cesium.Entity) {
          return entity;
        }
      }
      return;
    } catch (error: unknown) {
      throw error;
    }
  }

  private tileCache = new Map();
  // async/await применена по причине возврата Promise из методов Cesium
  public async getHeight(cartographic: Cesium.Cartographic): Promise<number> {
    const provider = this.viewer.terrainProvider;
    // Проверка, что провайдер готов и имеет данные о доступности
    if (!(provider instanceof Cesium.CesiumTerrainProvider)) return 0;
    let level;
    if (provider.availability) {
      // Вычисляет макс. уровень для конкретной долготы/широты
      level = provider.availability.computeMaximumLevelAtPosition(cartographic);
    } else {
      // Фолбек, если метаданные еще не подтянулись
      level = 10;
    }
    const tilingScheme = provider.tilingScheme;
    const tileXY = tilingScheme.positionToTileXY(cartographic, level);
    const cacheKey = `${level}-${tileXY.x}-${tileXY.y}`;
    // ПРОВЕРКА КЕША
    if (this.tileCache.has(cacheKey)) {
      const cached = this.tileCache.get(cacheKey);
      if (cached === 'NOT_FOUND') return 0;
      try {
        const terrainData = await cached;
        return this.interpolate(terrainData, tilingScheme, tileXY, cartographic, level);
      } catch (error: unknown) {
        return 0;
      }
    }
    const promise = provider.requestTileGeometry(tileXY.x, tileXY.y, level);
    this.tileCache.set(cacheKey, promise);
    try {
      const terrainData = await promise;
      if (terrainData) {
        return this.interpolate(terrainData, tilingScheme, tileXY, cartographic, level);
      } else {
        this.tileCache.set(cacheKey, 'NOT_FOUND');
        return 0;
      }
    } catch (error: unknown) {
      console.warn(`Тайл ${cacheKey} (Level ${level}) недоступен.`);
      this.tileCache.set(cacheKey, 'NOT_FOUND');
      return 0;
    }
  }

  private interpolate(
    terrainData: Cesium.TerrainData,
    tilingScheme: Cesium.GeographicTilingScheme,
    tileXY: Cesium.Cartesian2,
    cartographic: Cesium.Cartographic,
    level: number,
  ): number {
    const rect = tilingScheme.tileXYToRectangle(tileXY.x, tileXY.y, level);
    return terrainData.interpolateHeight(rect, cartographic.longitude, cartographic.latitude);
  }

  public readonly distanceSegmentLengthM: number = 100;
  public async calculatePosDistances(
    positions: Array<Cesium.Cartesian3>,
    detailed?: boolean,
    distanceSegmentLengthM?: number,
    withHumanify?: boolean,
  ): Promise<string | number> {
    // console.log(positions);
    // console.trace();
    let distance: number = 0;
    // if (!detailed) console.log('!detailed');
    // else if (detailed && !this.viewer.terrainProvider.availability)
    //   console.log('!viewer.terrainProvider.availability');
    // else if (detailed && this.viewer.terrainProvider.availability) console.log('most detailed');
    if (detailed && !this.viewer.terrainProvider.availability) {
      alert('Рельеф отключен!');
      throw new Error(
        'viewer.terrainProvider.availability is undefined in calculatePosDistances fn',
      );
    }
    try {
      if (!positions?.length) {
        if (withHumanify) return Humanify.distanceM(0);
        else return 0;
      }
      const WGS84Array = MeasuresLib.transformCartesianArrayToWGS84Array(positions);
      for (let i = 0; i < WGS84Array.length - 1; i++) {
        const p1Cartographic: Cesium.Cartographic = MeasuresLib.transformWGS84ToCartographic(
          WGS84Array[i],
        );
        const p2Cartographic: Cesium.Cartographic = MeasuresLib.transformWGS84ToCartographic(
          WGS84Array[i + 1],
        );
        if (!detailed || !this.viewer.terrainProvider.availability) {
          // Расстояние по гипотенузе (линейно, но с учетом дуги эллипсоида).
          const geodesic: Cesium.EllipsoidGeodesic = new Cesium.EllipsoidGeodesic();
          geodesic.setEndPoints(p1Cartographic, p2Cartographic);
          let s: number = geodesic.surfaceDistance;
          s = Math.sqrt(s ** 2 + (p2Cartographic.height - p1Cartographic.height) ** 2);
          distance += s;
        } else {
          this.$SetProgressSpinnerService.setSpinnerOn();
          // Если нужен точный расчет по всем неровностям рельефа, необходимо дробить отрезок на множество частей и проводить расчет по нему с поднятием данных по высотам
          const geodesic = new Cesium.EllipsoidGeodesic(p1Cartographic, p2Cartographic);
          const n = distanceSegmentLengthM ? distanceSegmentLengthM : this.distanceSegmentLengthM; // длина сегмента в метрах
          const totalSurfaceDistance = geodesic.surfaceDistance;
          const segments = Math.ceil(totalSurfaceDistance / n);
          const samples: Array<Cesium.Cartographic> = [];
          for (let i = 0; i <= segments; i++) {
            const fraction = i / segments;
            const sampleCartographic = geodesic.interpolateUsingFraction(
              fraction,
              new Cesium.Cartographic(),
            );
            samples.push(sampleCartographic);
          }
          await Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, samples).then(
            (raisedPoints: Array<Cesium.Cartographic>) => {
              for (let i = 0; i < raisedPoints.length - 1; i++) {
                const p1 = Cesium.Cartesian3.fromRadians(
                  raisedPoints[i].longitude,
                  raisedPoints[i].latitude,
                  raisedPoints[i].height,
                );
                const p2 = Cesium.Cartesian3.fromRadians(
                  raisedPoints[i + 1].longitude,
                  raisedPoints[i + 1].latitude,
                  raisedPoints[i + 1].height,
                );
                distance += Cesium.Cartesian3.distance(p1, p2);
              }
            },
          );
        }
      }
      if (withHumanify) return Humanify.distanceM(distance);
      else return distance;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (withHumanify) return Humanify.distanceM(distance);
      else return distance;
    } finally {
      this.$SetProgressSpinnerService.setSpinnerOff();
    }
  }

  // Notice (Станавов Г.):
  // If ellipsoidTerrainProvider, then we get heights
  // from level 18 with good precise for drawing tools,
  // cause sampleTerrainMostDetailed() always rejects with ellipsoidTerrainProvider.
  // For example if you add a point at level 1 with cartesian
  // from globe.pick(ray, viewer.scene) (in reject case)
  // and then zoom to level 16 you'll see the point under surface.

  public setTerrainProvider(terrainProvider: Cesium.TerrainProvider): void {
    try {
      if (terrainProvider) this.viewer.terrainProvider = terrainProvider;
      // Новый рельеф, чистим кеш
      this.tileCache = new Map();
    } catch (error: unknown) {
      throw error;
    }
  }

  public setImageryProvider(
    imageryProvider: Cesium.ImageryProvider,
    id?: number,
    alpha?: number,
  ): void {
    try {
      if (imageryProvider) {
        // const layer = new Cesium.ImageryLayer(imageryProvider, {
        //   alpha: alpha,
        // });
        // this.viewer.imageryLayers.add(layer, id);
        this.viewer.imageryLayers.addImageryProvider(imageryProvider);
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  public removeImageryProvider(id: number): void {
    try {
      const layer = this.viewer.imageryLayers.get(id);
      this.viewer.imageryLayers.remove(layer);
    } catch (error: unknown) {
      throw error;
    }
  }
}
