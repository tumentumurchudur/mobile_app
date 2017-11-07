import { Component, OnInit, Input, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'arc-tween-chart',
  templateUrl: 'arc-tween-chart.html'
})
export class ArcTweenChartComponent implements OnInit {
  @Input() outerArcValue: number | null;
  @Input() innerArcValue: number | null;
  @Input() totalValue: number | null;

  // Specify background, outer and inner arc colors respectively.
  @Input() colors: string[] = ["#ddd", "green", "red"];
  @Input() middleValue: string | null;
  @Input() middleLabel: string | null;
  @Input() innerRingThickness: number = 8;
  @Input() outerRingThickness: number = 25;
  @Input() diameter: number = 250;

  private element: any;

  //these are all *relative* units, which will scale to fill the SVG.
  private margin: any = { left: 20, right: 20, top: 10, bottom: 10 };

  private viewBoxWidth = this.margin.left + this.diameter + this.margin.right;
  private viewBoxHeight = this.margin.top + this.diameter + this.margin.bottom;

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnInit() {
    this.draw();
  }

  draw() {
    const svg = d3.select(this.element).select("svg")
      .attr("viewBox", "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight);

    const vis = d3.select(this.element).select("svg").select("g")
      .attr("transform", "translate(" + (this.margin.left + this.diameter / 2) + ","
        + (this.margin.top + this.diameter / 2) + ")");

    // Outer arc
    const arc = d3.arc()
      .outerRadius(this.diameter / 2)
      .innerRadius(this.diameter / 2 - this.outerRingThickness)
      .startAngle(0);

    // Inner arc
    const innerArc = d3.arc()
      .outerRadius(this.diameter / 3)
      .innerRadius(this.diameter / 3 - this.innerRingThickness)
      .startAngle(0);

    const τ = 2 * Math.PI;

    // Add the background arc, from 0 to 100% (τ).
    const background = vis.append("path")
      .datum({ endAngle: τ })
      .style("fill", this.colors[0] || "#ddd")
      .attr("d", arc);

    // Add the foreground arc.
    const outerValue = this.outerArcValue / this.totalValue;
    const outerArcPath = vis.append("path")
      .datum({ endAngle: 0 })
      .style("fill", this.colors[1] || "orange")
      .attr("d", arc)
      .transition()
      .delay(500)
      .duration(1000)
      .call(arcTween, outerValue * τ, arc);

    // Calculates the inner arc value.
    const innerValue = this.innerArcValue / this.totalValue;
    const innerArcPath = vis.append("path")
      .datum({ endAngle: 0 })
      .style("fill", this.colors[2] || "red")
      .attr("d", innerArc)
      .transition()
      .delay(1000)
      .duration(1000)
      .call(arcTween, innerValue * τ, innerArc);

    // Creates a tween on the specified transition's "d" attribute, transitioning
    // any selected arcs from their current angle to the specified new angle.
    function arcTween(transition, newAngle, arc) {
      transition.attrTween("d", (d) => {
        const interpolate = d3.interpolate(d.endAngle, newAngle);

        return function(t) {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      });
    }
  }

}
