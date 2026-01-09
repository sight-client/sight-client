/* Почему Custom.Viewer используется именно так (особенности Angular): */
/* "viewer" - достаточно объемный объект, поэтому создавать из него "WritableSignal" нецелесообразно затратно. 
Кроме того, "WritableSignal" оповещает о своем изменении только при замене своего значения, 
что в случае с переменной объекта является потерей старой ссылки, что равнозначно пересозданию. 
Метод "WritableSignal.update()", не смотря на то, что позволяет выборочно изменять содержимое реактивного объекта, 
тем не менее, также полностью обновляет его ссылку (старый объект уже не равен новому). 
Поэтому, в целях получения реактивности дефолтных свойств "viewer" (например, clampToGround) необходимо применять ее адресно: 
создавать сигналы соответствующие таким свойствам, как методы данного класса, изменять сигналы из потребителя услуг местными сеттерами
и, отслеживая эти изменения в effect (computed в свойствах viewer, увы, не работает), обеспечить параллельное изменение 
привязанного свойства viewer'а. Для кастомных же свойств (например, pickedEntity) можно использовать сигналы прямо в объекте viewer. */
/* Notice. В случае необходимости использования сигнала объекта в качестве отслеживаемого дублирующего свойства, 
а также при нежелании полностью переписывать такой объект в методе "WritableSignal.set()", 
целесообразно использовать метод "WritableSignal.update()". Пример с объектом и двумя свойствами под изменение: 
$viewerService.viewer.test.update((previousState: WritableSignal<any>) => {
   return {
     ...previousState, testKeyOne: newValOne, testKeyTwo: newValTwo
   }
});
*/

import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import * as Cesium from 'cesium';

export interface CustomViewer extends Cesium.Viewer {
  pickedEntity?: WritableSignal<Cesium.Entity | undefined>;
  pickedEntityId?: WritableSignal<string | undefined>;
  clampToGround?: boolean;
  defaultTerrainProvider?: Cesium.EllipsoidTerrainProvider;
  dropError?: Cesium.Event;
  measure?: {
    drawLayer: Cesium.CustomDataSource;
  };
}
// На текущий момент применение сервиса ограничено глобальным модулем planet.ts (большинство остальных - аналогично)
// @Injectable({
//   providedIn: 'root',
// })
@Injectable()
export class ViewerService {
  constructor() {
    effect(() => {
      this.clampToGroundSignal();
      if (this.viewer?.clampToGround !== undefined) {
        this.viewer.clampToGround = this.clampToGroundSignal();
      }
    });
    // --------------------------------------------------------- //
    if (localStorage.getItem('sceneMode') === '3D') {
      this.startSceneMode = Cesium.SceneMode.SCENE3D;
    } else if (localStorage.getItem('sceneMode') === '2D') {
      this.startSceneMode = Cesium.SceneMode.SCENE2D;
    } else if (localStorage.getItem('sceneMode') === 'Columbus') {
      this.startSceneMode = Cesium.SceneMode.COLUMBUS_VIEW;
    } else {
      this.startSceneMode = Cesium.SceneMode.SCENE3D;
    }
  }
  // Реактивные свойства для нового viewer
  // Сигналы, которые viewer не позволяет напрямую использовать в своем объекте
  public clampToGroundSignal = signal<boolean>(true);
  public setClampToGround(newVal: boolean): void {
    this.clampToGroundSignal.set(newVal);
  }
  // Сигналы, созданые в getNewViewer()
  public setPickedEntity(newVal: Cesium.Entity | undefined): void {
    if (this?.viewer?.pickedEntity) this.viewer.pickedEntity.set(newVal);
    if (this?.viewer?.pickedEntityId) this.viewer.pickedEntityId.set(newVal?.id);
  }
  // Статика
  private startSceneMode: Cesium.SceneMode = Cesium.SceneMode.SCENE3D;
  public startCamDestination = new Cesium.Cartesian3(
    // вид на РФ
    4182188.3323534606,
    3232962.257671274,
    7728738.899076799,
    // вид на весь глобус
    // 15181365.06731483,
    // 12293627.033615991,
    // 23247855.672561906,
  );

  // Создание объекта нового viewer
  /* Данный обход типов позволяет сильно уменьшить дублирование проверок на "viewer !== undefined" и ни на что не влияет, 
  если правильно применять необходимые проверки на "!undefined" (в опционально цепочке по месту). Все равно, имеется постоянная 
  необходимость обращаться к уже созданным свойствам "viewer" из других компонентов НЕ РАНЕЕ фазы их жизненного цикла "afterNextRender" */
  public viewer: CustomViewer = {} as CustomViewer;
  public viewerHasLoaded = signal<boolean>(false); // сигнал для всех сервисов, ожидающих загрузки Cesium.Viewer

  // viewer получает первое значение из app-cesium.directive.ts однократно при первом рендеринге planet.html
  public getNewViewer(container: Element | string) {
    try {
      this.viewer = new Cesium.Viewer(container, {
        /* Виджет для воспроизведения анимации */
        animation: false,
        /* Стандартный виджет для выбора слоев. Используется, как основа, в нашем customBaselLayerPicker. */
        baseLayerPicker: false,
        /* Кнопка разворота на весь экран */
        fullscreenButton: true,
        /* Кнопка для переключения в VR-режим */
        geocoder: false,
        /* Кнопка возврата к виду по умолчанию (у нас - в миксине znemz) */
        homeButton: false,
        /* Информационное окно для описания нанесенных на слои сущностей */
        infoBox: false,
        /* Виджет для отображения индикатора на выбранном объекте (как в старых RTS) - некорректно работает на мультиполигонах, но можно использовать на 3D-моделях */
        selectionIndicator: false,
        /* Виджет для управления временем отображения сцены */
        timeline: false,
        /* Мануал по управлению навигацией по глобусу */
        navigationHelpButton: false,
        /* Вид отображения глобуса: 3D, 2D, columbus */
        sceneModePicker: false,
        /* Установка на просмотр карты в 2D, 2,5D, 3D - по умолчанию */
        sceneMode: this.startSceneMode,
        /* При true геометрия будет отображаться только в 3D-режиме (для экономии памяти GPU) */
        scene3DOnly: false,
        /* true - для запуска симуляции по умолчанию (имеет приоритет перед viewer#clockViewModel) */
        shouldAnimate: true,
        /* Предоставляет тайлы для отображения на элипсоиде */
        imageryProvider: new Cesium.GridImageryProvider({
          /* defaults: */
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
        /* Подложка рельефа на поверхность элипсоида (пирамида тайлов). Оставлено значение по умолчанию. */
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        /* Размытие активного элемента на холсте */
        blurActiveElementOnCanvasFocus: true,
        /* Проекция карты для использования в режимах 2D и columbus */
        mapProjection: new Cesium.GeographicProjection(),
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
        /* Голубое небо и свечение вокруг лимбо Земли */
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        /* Свойства отрисовки движка ("Context and WebGL creation properties passed to Scene") */
        contextOptions: {
          // @ts-ignore
          id: 'cesiumCanvas',
          // webgl: {
          /* Если true - не будет происходить автоматическая очистка буфера отрисовки (минус производительность) */
          // preserveDrawingBuffer: true, /* по умолчанию false */
          // },
        },
      });

      if (!Object.keys(this.viewer)) throw new Error("at getNewViewer(): viewer wasn't create");

      /* Кастомные свойства для альтернативы дефолтному инфобоксу */
      this.viewer.pickedEntity = signal<Cesium.Entity | undefined>(undefined);
      this.viewer.pickedEntityId = signal<string | undefined>(undefined);

      /* Кастомный параметр прикрепления к земле (используется, например, в инструментах работы с картой) */
      this.viewer.clampToGround = true;

      /* Кастомный параметр для обнуления рельефа */
      this.viewer.defaultTerrainProvider = new Cesium.EllipsoidTerrainProvider();

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
          console.log('Error processing ' + source + ':' + error);
          window.alert('Error processing ' + source + ':' + error);
        });
      }

      /* Установка начального вида вьюера (при загрузке и по соответствующей кнопке в навигационном миксине) */
      this.viewer.camera.setView({
        destination: this.startCamDestination,
        orientation: {
          heading: 6.283185307179586,
          pitch: -1.5707963267948966,
          roll: 0,
        } as Cesium.HeadingPitchRollValues,
      });

      /* Перевод с английского title-атрибута стандартной кнопки Cesium */
      const fullScreenBtn: HTMLElement | null = document.querySelector('.cesium-fullscreenButton');
      if (fullScreenBtn) {
        fullScreenBtn.title = 'Развернуть на весь экран';
        fullScreenBtn.addEventListener('click', () => {
          if (fullScreenBtn.title === 'Exit full screen')
            fullScreenBtn.title = 'Выйти из полноэкранного режима';
          else fullScreenBtn.title = 'Развернуть на весь экран';
        });
      }

      /* Уменьшает количество усеченных полигонов. Включение позволит увеличить производительность. */
      this.viewer.scene.logarithmicDepthBuffer = false;

      /* Экономит память за счет игнорирования обработки рельефа вне поля зрения */
      this.viewer.scene.globe.backFaceCulling = true;

      /* Освещение глобуса источником света сцены (тень на глобусе) */
      this.viewer.scene.globe.enableLighting = false;

      /* Отображение атмосферы при наблюдении с расстояния от lightingFadeInDistance и lightingFadeOutDistanse */
      this.viewer.scene.globe.showGroundAtmosphere = true;

      // Disable camera collision to allow it to go underground
      /* При false игнорируются maximumZoomDistance и minimumZoomDistance (колесика мыши) */
      this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;

      /* Проверка на погружение объектов в ландшафт.
      По умолчанию false - объекты всегда над ландшафтом. true - забаговано и может дать обратныый эффект */
      this.viewer.scene.globe.depthTestAgainstTerrain = false;

      /* Скрыть лого Цесиума (левый нижний угол) */
      (this.viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

      // /* Эффект постобработки, имитирующий блики света на объективе камеры */
      // viewer.scene.postProcessStages.add(
      //   Cesium.PostProcessStageLibrary.createLensFlareStage(),
      // );

      // /* Миксин для помощи в отладке */
      // viewer.extend(Cesium.viewerCesiumInspectorMixin, {});

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
        this.flyToPointWhithItPicking.bind(this),
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );

      /* Отключит дефолтный выбор сущностей по ЛКМ (если в проекте не нужен подобный вызов дефолтного viewer.infobox) */
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      /* Кастомная замена */
      this.viewer.screenSpaceEventHandler.setInputAction(
        this.setPickedEntityByClickOnScene.bind(this),
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );

      this.viewerHasLoaded.set(true);
      // console.log('viewerHasLoaded:', this.viewerHasLoaded());
      // console.log(this.viewer);
    } catch (error: unknown) {
      throw error;
    }
  }

  /* Альтернатива глобальному лисенеру 2хЛКМ */
  // async/await применена по причине возврата Promise из методов Cesium (что не очевидно)
  public async flyToPointWhithItPicking(
    cartesian2FromClick: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  ): Promise<void> {
    try {
      const targetEntity: Cesium.Entity | undefined =
        this.setPickedEntityByClickOnScene(cartesian2FromClick);
      if (!targetEntity) {
        return;
        // throw new Error('at flyToPointWhithItPicking(): targetEntity is undefined');
      }
      if (targetEntity.position) {
        const targetCartesian3: Cesium.Cartesian3 | undefined = targetEntity.position.getValue();
        if (targetCartesian3) {
          const targetCartographic: Cesium.Cartographic =
            Cesium.Cartographic.fromCartesian(targetCartesian3);
          const calcLongitude: number = Cesium.Math.toDegrees(targetCartographic.longitude);
          const calcLatitude: number = Cesium.Math.toDegrees(targetCartographic.latitude);
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              calcLongitude,
              calcLatitude,
              this.viewer.camera.positionCartographic.height,
            ),
          });
        } else await this.viewer.flyTo(targetEntity);
      } else await this.viewer.flyTo(targetEntity);
    } catch (error: unknown) {
      throw error;
    }
  }

  // Используется, например, в measure.service.ts (для действий по ЛКМ)
  public entityPickingBlock: boolean = false;
  public onEntityPickingBlock(): void {
    this.entityPickingBlock = true;
  }
  public offEntityPickingBlock(): void {
    this.entityPickingBlock = false;
  }
  public pickedEntityIdChangedEvent: Event = new CustomEvent('pickedEntityIdChanged');

  /* Альтернатива глобальному лисенеру 1хЛКМ */
  public setPickedEntityByClickOnScene(
    cartesian2PositionFromClick: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  ): Cesium.Entity | undefined {
    try {
      if (this.entityPickingBlock === true) return;
      const pickedEntity: Cesium.Entity | undefined = this.pickEntityByClickOnScene(
        cartesian2PositionFromClick,
      );
      if (pickedEntity && pickedEntity instanceof Cesium.Entity) {
        console.log(pickedEntity);
        if (this.viewer.pickedEntity?.() !== pickedEntity) {
          this.viewer.pickedEntity?.set(pickedEntity);
          this.viewer.pickedEntityId?.set(pickedEntity?.id);
        }
        return pickedEntity;
      }
      return;
    } catch (error: unknown) {
      throw error;
    }
  }
  // Также используется в measure.service.ts
  public pickEntityByClickOnScene(
    cartesian2PositionFromClick: Cesium.ScreenSpaceEventHandler.PositionedEvent,
  ): Cesium.Entity | undefined {
    try {
      const picked: any | undefined = this.viewer.scene.pick(cartesian2PositionFromClick.position);
      if (Cesium.defined(picked)) {
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

  // async/await применена по причине возврата Promise из методов Cesium
  public async getHeight(pos: Cesium.Cartographic, mostDetailed: boolean = true): Promise<number> {
    let updPos: Cesium.Cartographic;
    if (mostDetailed) {
      if (this.viewer.terrainProvider.availability) {
        const positions: Cesium.Cartographic[] = [pos];
        [updPos] = await Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, positions);
        // @ts-ignore (conflict: .bir)
      } else if (this.viewer.terrainProvider.bir) {
        const positions: Cesium.Cartographic[] = [pos];
        [updPos] = await Cesium.sampleTerrain(
          this.viewer.terrainProvider,
          // @ts-ignore (conflict: .maxZoom)
          this.viewer.terrainProvider.maxZoom,
          positions,
        );
      } else {
        updPos = pos;
        updPos.height = 0;
      }
    } else {
      updPos = pos;
      if (this.viewer.camera.positionCartographic.height / 1000 < 1700)
        updPos.height = this.viewer.scene.globe.getHeight(updPos) || 0;
      else updPos.height = 0;
    }
    if (!updPos.height && updPos.height !== 0) updPos.height = 0;
    return updPos.height;
  }

  // async/await применена по причине возврата Promise из методов Cesium
  public async getHeights(
    positions: Cesium.Cartographic[],
    mostDetailed: boolean = true,
  ): Promise<Cesium.Cartographic[]> {
    if (mostDetailed && this.viewer.terrainProvider.availability) {
      await Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, positions);
      // @ts-ignore (conflict: .bir)
    } else if (mostDetailed && this.viewer.terrainProvider.bir) {
      await Cesium.sampleTerrain(
        this.viewer.terrainProvider,
        // @ts-ignore (conflict: .maxZoom)
        this.viewer.terrainProvider.maxZoom,
        positions,
      );
    } else if (this.viewer.camera.positionCartographic.height / 1000 < 1700)
      positions.forEach((pos) => {
        pos.height = this.viewer.scene.globe.getHeight(pos) as number;
      });
    else {
      positions.forEach((pos) => {
        pos.height = 0;
      });
    }
    positions.forEach((pos) => {
      pos.height = pos.height === undefined ? 0 : pos.height;
    });
    return positions;
  }

  public setImageryProvider(
    ImageryProvider: Cesium.ImageryProvider | Cesium.OpenStreetMapImageryProvider,
  ): void {
    try {
      if (ImageryProvider) this.viewer.imageryLayers.addImageryProvider(ImageryProvider);
    } catch (error: unknown) {
      throw error;
    }
  }

  public setTerrainProvider(TerrainProvider: Cesium.TerrainProvider): void {
    try {
      if (TerrainProvider) this.viewer.terrainProvider = TerrainProvider;
    } catch (error: unknown) {
      throw error;
    }
  }

  // // Deprecated:
  // // public pickEntityByClickOnWindow(clickEventFromClient: MouseEvent) {
  // //   clickEventFromClient.stopPropagation();
  // //   if (clickEventFromClient.button === 0) {
  // //     const cursorPosition = new Cesium.Cartesian2(
  // //       clickEventFromClient.clientX,
  // //       clickEventFromClient.clientY,
  // //     );
  // //     const picked = this.viewer.scene.pick(cursorPosition);
  // //     if (Cesium.defined(picked)) {
  // //       const entity = Cesium.defaultValue(picked.id, picked.primitive.id);
  // //       if (entity instanceof Cesium.Entity) {
  // //         return entity;
  // //       }
  // //     }
  // //   }
  // //   return undefined;
  // // }

  // // /* В отличие от flyToPointWhithItPicking фокусит камеру - нельзя двигать глобус при помощи ЛКМ, пока ViewerService.viewer.trackedEntity !== undefined,
  // // и, если сущность - точка, подлетит "нос-к-носуу"  */
  // // // @ts-ignore
  // // public flyToEntityWithFocus(someEntityId, somelayerName = 'measureLayer') {
  // //   const entity = this.getEntity(someEntityId, somelayerName);
  // //   if (entity) this.viewer.flyTo(entity);
  // // }
}
