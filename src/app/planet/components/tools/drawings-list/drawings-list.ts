import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  DrawingService,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';
import { DrawingsListKmlService } from '@/components/tools/drawings-list/services/drawings-list-kml-service/drawings-list-kml.service';
import { DrawingsListReportService } from '@/components/tools/drawings-list/services/drawings-list-report-service/drawings-list-report.service';

import { DrawingsListEntityInfo } from '@/components/tools/drawings-list/common/components/drawings-list-entity-info/drawings-list-entity-info';
import { FormsModule } from '@angular/forms';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
// import {
//   UserDataService,
// } from '@global/services/user-data-service/user-data.service';

@Component({
  selector: 'drawings-list',
  providers: [DrawingsListKmlService, DrawingsListReportService],
  imports: [
    DrawingsListEntityInfo,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './drawings-list.html',
  styleUrl: './drawings-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingsList implements OnInit {
  declare private drawLayer: Cesium.DataSource;
  constructor(
    protected $viewerService: ViewerService,
    // protected $userDataService: UserDataService,
    protected $drawingService: DrawingService,
    protected $drawingsListService: DrawingsListService,
    protected $drawingsListKmlService: DrawingsListKmlService,
    protected $drawingsListReportService: DrawingsListReportService,
  ) {}

  protected getRusDrawingToolName = getRusDrawingToolName;

  protected changeLinesCounter(changes: number) {
    this.$drawingsListService.changeLineCounter(changes);
  }

  selectCollection: number | undefined = undefined;
  dropDownList: boolean = false;
  listCollections: unknown[] = [];
  nameCollectionInp: string = '';
  collectionIdFromDb: number | undefined = undefined;

  ngOnInit(): void {
    const dataSource: Cesium.DataSource | undefined =
      this?.$viewerService.viewer.dataSources?.getByName('drawLayer')?.[0];
    if (dataSource) {
      this.drawLayer = dataSource;
    } else {
      console.info("Data source hasn't found in DrawingsListService");
    }
  }

  // Полная очитска карты
  clearingMap() {
    this.$drawingService.clearDrawingsDataSource();
    this.nameCollectionInp = '';
    this.selectCollection = undefined;
    this.collectionIdFromDb = undefined;
  }
}
