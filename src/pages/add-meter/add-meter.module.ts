import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMeterPage } from './add-meter';

@NgModule({
  declarations: [
    AddMeterPage,
  ],
  imports: [
    IonicPageModule.forChild(AddMeterPage),
  ],
})
export class AddMeterPageModule {}
