import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IonicModule } from 'ionic-angular';

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';
import { NavigationBarComponent } from './navigation-bar/navigation-bar';
import { TimeSpanSelectorComponent } from "./timespan-selector/timespan-selector";
import { LineChartComponent } from './line-chart/line-chart';
import { AddMeterFormComponent } from './add-meter-form/add-meter-form';

@NgModule({
	declarations: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanSelectorComponent,
    LineChartComponent,
    AddMeterFormComponent
	],
	imports: [CommonModule, IonicModule],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanSelectorComponent,
    LineChartComponent,
    AddMeterFormComponent
	]
})
export class ComponentsModule {}
