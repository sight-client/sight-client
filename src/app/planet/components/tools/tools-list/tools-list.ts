import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  DrawingService,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';
import { ToolsListKmlService } from '@/components/tools/tools-list/services/tools-list-kml-service/tools-list-kml.service';
import { ToolsListReportService } from '@/components/tools/tools-list/services/tools-list-report-service/tools-list-report.service';

import { ToolsListEntityInfo } from '@/components/tools/tools-list/common/components/tools-list-entity-info/tools-list-entity-info';
import { FormsModule } from '@angular/forms';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
// import {
//   getUserNameGlobal,
//   UserDataService,
// } from '@global/services/user-data-service/user-data.service';

@Component({
  selector: 'tools-list',
  providers: [ToolsListKmlService, ToolsListReportService],
  imports: [
    ToolsListEntityInfo,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './tools-list.html',
  styleUrl: './tools-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsList implements OnInit {
  declare private drawLayer: Cesium.DataSource;
  constructor(
    protected $viewerService: ViewerService,
    // protected $userDataService: UserDataService,
    protected $drawingService: DrawingService,
    protected $toolsListService: ToolsListService,
    protected $toolsListKmlService: ToolsListKmlService,
    protected $toolsListReportService: ToolsListReportService,
  ) {}

  protected getRusDrawingToolName = getRusDrawingToolName;

  protected changeLinesCounter(changes: number) {
    this.$toolsListService.changeLineCounter(changes);
  }

  selectCollection: number | undefined = undefined;
  dropDownList: boolean = false;
  listCollections: any = [];
  nameCollectionInp: string = '';
  collectionIdFromDb: number | undefined = undefined;

  ngOnInit(): void {
    const dataSource: Cesium.DataSource | undefined =
      this?.$viewerService.viewer.dataSources?.getByName('drawLayer')?.[0];
    if (dataSource) {
      this.drawLayer = dataSource;
    } else {
      console.log(chalk.red("Data source hasn't found in ToolsListService"));
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
