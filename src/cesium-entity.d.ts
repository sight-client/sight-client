import type { DrawingToolName } from './app/planet/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { MeasuringToolName } from './app/planet/components/tools/measuring-tools/services/measure-service/measure.service';
import type { CameraToolName } from './app/planet/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';

declare module 'cesium' {
  interface Entity {
    toolName?: DrawingToolName | MeasuringToolName | CameraToolName;
    /** KML hierarchy. Cesium reads this during exportKml; an empty array is required, not undefined. */
    _children?: Entity[];
  }

  interface ScreenSpaceEventHandler {
    _initializer?:
      | DrawingToolName
      | MeasuringToolName
      | CameraToolName
      | 'entityRubber'
      | 'flyAroundWithoutPoint';
  }
}
