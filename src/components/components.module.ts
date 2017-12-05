import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IonicModule } from "ionic-angular";
import { HttpClientModule } from "@angular/common/http";
import { InlineSVGModule } from "ng-inline-svg";

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';
import { NavigationBarComponent } from './navigation-bar/navigation-bar';
import { TimeSpanSelectorComponent } from "./timespan-selector/timespan-selector";
import { LineChartComponent } from './line-chart/line-chart';

@NgModule({
	declarations: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanSelectorComponent,
    LineChartComponent
	],
	imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
    InlineSVGModule
  ],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanSelectorComponent,
    LineChartComponent
	]
})
export class ComponentsModule {}
