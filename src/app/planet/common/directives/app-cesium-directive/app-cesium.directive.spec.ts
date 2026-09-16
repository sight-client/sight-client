import { AppCesiumDirective } from './app-cesium.directive';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';

describe('AppCesiumDirective', () => {
  it('should create an instance', () => {
    const directive = new AppCesiumDirective(
      ViewerService as any,
      MouseCoordsService as any,
      ToolsService as any,
      ToolsListService as any,
    );
    expect(directive).toBeTruthy();
  });
});
