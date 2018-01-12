import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IonicModule } from "ionic-angular";
import { HttpClientModule } from "@angular/common/http";

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
import { ArcTweenChartComponent } from './arc-tween-chart/arc-tween-chart';
import { NavigationBarComponent } from './navigation-bar/navigation-bar';
import { TimeSpanSelectorComponent } from "./timespan-selector/timespan-selector";
import { LineChartComponent } from './line-chart/line-chart';
import { AddMeterFormComponent } from './add-meter-form/add-meter-form';
import { AppSpinnerComponent } from './app-spinner/app-spinner';
import { EditMeterFormComponent } from './edit-meter-form/edit-meter-form';
import { NeighborhoodComparisonComponent } from './neighborhood-comparison/neighborhood-comparison';
import { RetryButtonComponent } from './retry-button/retry-button';

@NgModule({
	declarations: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanSelectorComponent,
    LineChartComponent,
    AddMeterFormComponent,
    AppSpinnerComponent,
    EditMeterFormComponent,
    NeighborhoodComparisonComponent,
    RetryButtonComponent
	],
	imports: [
    CommonModule,
    IonicModule,
    HttpClientModule
  ],
	exports: [
		UtilitySpendingComponent,
    ArcTweenChartComponent,
    NavigationBarComponent,
    TimeSpanSelectorComponent,
    LineChartComponent,
    AddMeterFormComponent,
    AppSpinnerComponent,
    EditMeterFormComponent,
    NeighborhoodComparisonComponent,
    RetryButtonComponent
	]
})
export class ComponentsModule {}
