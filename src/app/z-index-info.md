Лимит значений z-index в текущем проекте: 999.

Модуль planet:
Интервал под cesium: 1 - 99.
Интервал под остальной UI (далее занимать по необходимости): 100 - 999.

<!-- 1 - #cesiumContainer - не выставлять (окно ошибок цесиума будет под UI) -->

2 - .mouse-coords-cursor-field
100 - #sightUiContainer, .cesium-viewer-fullscreenContainer
101 - .coords-container-main, .navigationMixinDiv, .theme-changer-wrapper, .camera-height-wrapper, #distanceLegendDiv, .scene-mode-changer-button, .measuring-tools-tabs-panel, .header-buttons-container
102- .measuring-tools-container
103 - .measuring-tools-modal
997 - mat-spinner (cursor-progress-spiner.ts)
998 - .routing-spinner
999 - .routing-error-banner-wrapper
