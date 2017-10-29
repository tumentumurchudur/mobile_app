import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { UtilitySpendingComponent } from './containers/utility-spending/utility-spending';
@NgModule({
	declarations: [UtilitySpendingComponent],
	imports: [CommonModule],
	exports: [UtilitySpendingComponent]
})
export class ComponentsModule {}
