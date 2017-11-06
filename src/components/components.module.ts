import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';

@NgModule({
	declarations: [
		UtilitySpendingComponent,
    ArcTweenChartComponent
	],
	imports: [CommonModule],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent
	]
})
export class ComponentsModule {}
