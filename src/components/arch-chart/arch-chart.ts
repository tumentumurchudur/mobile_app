/// <reference path="../../typings/AmCharts.d.ts" />

import { Component } from '@angular/core';

/**
 * Generated class for the ArchChartComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'arch-chart',
  templateUrl: 'arch-chart.html'
})
export class ArchChartComponent {

  text: string;

  constructor() {
    console.log('Hello ArchChartComponent Component');
    this.text = 'Hello World';
  }

}
