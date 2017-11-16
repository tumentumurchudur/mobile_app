import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IonicModule } from 'ionic-angular';

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';
import { NavigationBarComponent } from './navigation-bar/navigation-bar';
import { TimeSpanComponent } from "./time-span/time-span";
import { LineChartComponent } from './line-chart/line-chart';

@NgModule({
	declarations: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanComponent,
    LineChartComponent
	],
	imports: [CommonModule, IonicModule],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanComponent,
    LineChartComponent
	]
})
export class ComponentsModule {}
