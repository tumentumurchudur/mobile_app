import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { GaugeChartComponent } from "./gauge-chart/gauge-chart";
import { ArchChartComponent } from './arch-chart/arch-chart';
@NgModule({
	declarations: [
		UtilitySpendingComponent,
		GaugeChartComponent,
		ArchChartComponent
	],
	imports: [CommonModule, NgxChartsModule],
	exports: [
		UtilitySpendingComponent,
		ArchChartComponent
	]
})
export class ComponentsModule {}
