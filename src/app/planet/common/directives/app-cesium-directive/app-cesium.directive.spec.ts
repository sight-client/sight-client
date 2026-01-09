import { AppCesiumDirective } from './app-cesium.directive';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { MeasureService } from '@/common/services/measure-service/measure.service';

describe('AppCesiumDirective', () => {
  it('should create an instance', () => {
    const directive = new AppCesiumDirective(
      ViewerService as any,
      MouseCoordsService as any,
      MeasureService as any,
    );
    expect(directive).toBeTruthy();
  });
});
