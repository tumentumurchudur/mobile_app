import { Component, OnInit, Input, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'arc-tween-chart',
  templateUrl: 'arc-tween-chart.html'
})
export class ArcTweenChartComponent implements OnInit {
  /**
   * Outer arc value.
   *
   * @type {(number | null)}
   * @memberof ArcTweenChartComponent
   */
  @Input() outerArcValue: number | null;

  /**
   * Inner arc value.
   *
   * @type {(number | null)}
   * @memberof ArcTweenChartComponent
   */
  @Input() innerArcValue: number | null;

  /**
   * Both outer and inner arc values are calculated as
   * percentages of this total value.
   *
   * For example: inner arc value = 15, outer arc value = 25 and total = 60
   * calc inner arc = 15 / 60 = .25 (25%) and calc outer arc = 25 / 60 = .42(42%) respectively.
   *
   *
   * @type {(number | null)}
   * @memberof ArcTweenChartComponent
   */
  @Input() totalValue: number | null;

  /**
   * Specify background, outer and inner arc colors respectively.
   *
   * @type {string[]}
   * @memberof ArcTweenChartComponent
   */
  @Input() colors: string[] = ["#ddd", "green", "red"];

  /**
   * Center value.
   *
   * @type {(string | null)}
   * @memberof ArcTweenChartComponent
   */
  @Input() centerValue: string | null;

  /**
   * Center label which comes after the value.
   *
   * @type {(string | null)}
   * @memberof ArcTweenChartComponent
   */
  @Input() centerLabel: string | null;

  /**
   * Thickness of inner arc in pixels.
   *
   * @type {number}
   * @memberof ArcTweenChartComponent
   */
  @Input() innerRingThickness: number = 6;

  /**
   * Thickness of outer arc in pixels.
   *
   * @type {number}
   * @memberof ArcTweenChartComponent
   */
  @Input() outerRingThickness: number = 22;

  /**
   * Diameter of the outer arc.
   *
   * @type {number}
   * @memberof ArcTweenChartComponent
   */
  @Input() diameter: number = 250;

  /**
   * Image src.
   *
   * @type {string}
   * @memberof ArcTweenChartComponent
   */
  @Input() image: string = "";

  /**
   * Space between the arcs in pixels.
   *
   * @memberof ArcTweenChartComponent
   */
  @Input() gapBetweenArcs = 3;

  /**
   * Specify whether chart is animated or not.
   *
   * @type {boolean}
   * @memberof ArcTweenChartComponent
   */
  @Input() animate: boolean = true;

  private element: any;

  //these are all *relative* units, which will scale to fill the SVG.
  private margin: any = { left: 20, right: 20, top: 10, bottom: 10 };

  private viewBoxWidth = this.margin.left + this.diameter + this.margin.right;
  private viewBoxHeight = this.margin.top + this.diameter + this.margin.bottom;

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  /**
   * Life cycle hook.
   * Initialize the component after Angular first displays
   * the data-bound properties and sets the directive/component's input properties.
   * Called once, after the first ngOnChanges()
   *
   * @memberof ArcTweenChartComponent
   */
  ngOnInit() {
    this.draw();
  }

  /**
   * Renders chart to the DOM.
   *
   * @memberof ArcTweenChartComponent
   */
  draw() {
    const viewBoxWithMultiplier = 1.2;
    const svg = d3.select(this.element).select("svg")
      .attr("viewBox", "0 0 " + this.viewBoxWidth * viewBoxWithMultiplier + " " + this.viewBoxHeight);

    const vis = d3.select(this.element).select("svg").select("g")
      .attr("transform", "translate(" + (this.margin.left + this.diameter / 2) * viewBoxWithMultiplier + ","
        + (this.margin.top + this.diameter / 2) + ")");

    // Outer arc
    const arc = d3.arc()
      .outerRadius(this.diameter / 2)
      .innerRadius(this.diameter / 2 - this.outerRingThickness)
      .startAngle(0);

    // Inner arc
    const innerArc = d3.arc()
      .outerRadius(this.diameter / 2 - this.outerRingThickness - this.gapBetweenArcs)
      .innerRadius(this.diameter / 2 - this.outerRingThickness - this.innerRingThickness - this.gapBetweenArcs)
      .startAngle(0);

    const τ = 2 * Math.PI;

    // Add the background arc, from 0 to 100% (τ).
    const background = vis.append("path")
      .datum({ endAngle: τ })
      .style("fill", this.colors[0] || "#ddd")
      .attr("d", arc);

    // Add the foreground arc.
    const outerValue = this.outerArcValue / this.totalValue;
    const innerValue = this.innerArcValue / this.totalValue;
    let outerArcPath: any;
    let innerArcPath: any;

    if (this.animate) {
      outerArcPath = vis.append("path")
        .datum({ endAngle: 0 })
        .style("fill", this.colors[1] || "orange")
        .attr("d", arc)
        .transition()
        .delay(500)
        .duration(800)
        .call(arcTween, outerValue * τ, arc);

      innerArcPath = vis.append("path")
        .datum({ endAngle: 0 })
        .style("fill", this.colors[2] || "red")
        .attr("d", innerArc)
        .transition()
        .delay(100)
        .duration(800)
        .call(arcTween, innerValue * τ, innerArc);
    } else {
      outerArcPath = vis.append("path")
        .datum({ endAngle: outerValue * τ })
        .style("fill", this.colors[1] || "orange")
        .attr("d", arc);

      innerArcPath = vis.append("path")
        .datum({ endAngle: innerValue * τ })
        .style("fill", this.colors[2] || "red")
        .attr("d", innerArc);
    }

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
