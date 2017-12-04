import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMeterPage } from './add-meter';
import { ComponentsModule } from "../../components/components.module";


@NgModule({
  declarations: [
    AddMeterPage
  ],
  imports: [
    IonicPageModule.forChild(AddMeterPage),
    ComponentsModule
  ],
})
export class AddMeterPageModule {}
