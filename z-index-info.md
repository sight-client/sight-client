Лимит значений z-index в текущем проекте: 999.

Модуль planet:
Интервал под cesium: 1 - 99.
Интервал под остальной UI (далее занимать по необходимости): 100 - 999.

<!-- 1 - #cesiumContainer - не выставлять (окно ошибок цесиума будет под UI) -->

2 - .mouse-coords-cursor-field
100 - #sightUiContainer, .cesium-viewer-fullscreenContainer
101 - .header-buttons-container, .tool-panel-button, .tool-chevron-button, .coords-container-main, .navigationMixinDiv, .camera-height-wrapper, #distanceLegendDiv, .floating-windows-tabs-panel
102 - .main-floating-windows-container
103 - .floating-window
104 - .floating-window (активное)
105 - .tools-panel-group-hidden-raised
997 - mat-spinner (cursor-progress-spinner.ts)
998 - .routing-spinner
999 - .routing-error-banner-wrapper
1001 - CursorProgressSpinner template
