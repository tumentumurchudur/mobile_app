import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { GaugeChartComponent } from "./gauge-chart/gauge-chart";
@NgModule({
	declarations: [UtilitySpendingComponent, GaugeChartComponent],
	imports: [CommonModule, NgxChartsModule],
	exports: [UtilitySpendingComponent]
})
export class ComponentsModule {}
