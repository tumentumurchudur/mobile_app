import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IonicModule } from 'ionic-angular';

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';

@NgModule({
	declarations: [
		UtilitySpendingComponent,
    ArcTweenChartComponent
	],
	imports: [CommonModule, IonicModule],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent
	]
})
export class ComponentsModule {}
