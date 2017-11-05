import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { GaugeChartComponent } from "./gauge-chart/gauge-chart";
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';
@NgModule({
	declarations: [
		UtilitySpendingComponent,
		GaugeChartComponent,
    	ArcTweenChartComponent
	],
	imports: [CommonModule, NgxChartsModule],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent
	]
})
export class ComponentsModule {}
