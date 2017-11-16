import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { ILineItem } from '../../interfaces';
import * as d3 from "d3";

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.html'
})
export class LineChartComponent implements OnInit {
  @Input() width: number = 330;
  @Input() height: number = 240;
  @Input() data: ILineItem[] = [];
  @Input() lineColors: string[] = ["orange", "red", "green"];
  @Input() dotColors: string[] = ["orange", "red", "green"];
  @Input() dateFormat: string = "%m/%d";

  private element: any;
  private margin: any = { left: 10, right: 10, top: 10, bottom: 10 };

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnInit() {
    this._draw();
  }

  private _draw() {
    const viewBoxWithMultiplier = 1.1;
    const width = this.width - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;

    const svg = d3.select(this.element).select("svg")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .attr("viewBox", "0 0 " + this.width * viewBoxWithMultiplier + " " + this.height * viewBoxWithMultiplier);

    // set the domain and ranges for x axis
    const x = d3.scaleTime()
      .domain(d3.extent(this.data, (d: ILineItem) => d.date))
      .range([0, width]);

    // set the domain and ranges for y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, (d: ILineItem) => Math.max(d.line1, d.line2, d.line3))])
      .range([height, 0]);

    // define line functions.
    const lineFunc1 = this._makeLineFunc(x, y, "line1");
    const lineFunc2 = this._makeLineFunc(x, y, "line2");
    const lineFunc3 = this._makeLineFunc(x, y, "line3");

    // add line paths using the line functions.
    const path1 = this._addPath(lineFunc1, "path1", this.lineColors[0]);
    const path2 = this._addPath(lineFunc2, "path2", this.lineColors[1]);
    const path3 = this._addPath(lineFunc3, "path3", this.lineColors[2]);

    // add dots
    const circles1 = this._addDots(svg, x, y, "line1", this.dotColors[0]);
    const circles2 = this._addDots(svg, x, y, "line2", this.dotColors[1]);
    const circles3 = this._addDots(svg, x, y, "line3", this.dotColors[2]);

    // renders and animates lines.
    this._animatePath(path1, 100, 500);
    this._animatePath(path2, 200, 500);
    this._animatePath(path3, 300, 500);

    // x and y axis
    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickPadding(5)
      .tickSizeInner(-height)
      .tickFormat(d3.timeFormat(this.dateFormat));

    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickPadding(5)
      .tickSizeInner(-width);

    svg.append("g")
      .attr("transform", "translate(20, 10)")
      .call(yAxis);

    svg.append("g")
      .attr("transform", "translate(20," + (height + this.margin.top) + ")")
      .call(xAxis);
  }

  private _makeLineFunc(x: (date: any) => any, y: (val: number) => any, colName: string): any {
    return d3.line()
      .x(d => x(d.date))
      .y(d => y(d[colName]));
  }

  private _addPath(lineFunc: (data: any) => any, id: string, color: string) {
    return d3.select(this.element).select("#" + id)
      .attr("d", lineFunc(this.data))
      .attr("transform", "translate(20, 10)")
      .attr("stroke", color)
      .attr("stroke-width", "2");
  }

  private _addDots(svg: any, x: any, y: any, colName: string, color: string) {
    return svg.selectAll("dot")
      .data(this.data)
      .enter().append("svg:circle")
      .attr("transform", "translate(20, 10)")
      .attr("r", 3)
      .attr("cx", (d: ILineItem) => x(d.date))
      .attr("cy", (d: ILineItem) => y(d[colName]))
      .style("fill", color);
  }

  private _animatePath(path: any, delay: number = 0, duration: number = 0) {
    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("stroke-dashoffset", 0);
  }

}
