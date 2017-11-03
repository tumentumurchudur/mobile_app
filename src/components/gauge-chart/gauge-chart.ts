import { Component, Input } from '@angular/core';

@Component({
  selector: 'gauge-chart',
  templateUrl: 'gauge-chart.html'
})
export class GaugeChartComponent {
  private view: any[] = [360, 360];

  @Input() data: any[];
  @Input() units: string = "test";
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() textValue: 0;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };

  onSelect(event) {
    console.log(event);
  }

}
