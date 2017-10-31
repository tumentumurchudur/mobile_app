import { Component } from '@angular/core';

/**
 * Generated class for the GaugeChartComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'gauge-chart',
  templateUrl: 'gauge-chart.html'
})
export class GaugeChartComponent {
  private view: any[] = [360, 360];
  private data: any[];

  constructor() {
    this.data = [
      {
        "name": "Germany",
        "value": 8940000
      },
      {
        "name": "USA",
        "value": 5000000
      },
      {
        "name": "France",
        "value": 7200000
      }
    ];
  }

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };

  onSelect(event) {
    console.log(event);
  }

}
