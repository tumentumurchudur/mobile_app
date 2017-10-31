import { Component } from '@angular/core';

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
