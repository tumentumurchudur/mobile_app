import { Component, Input, OnInit, ElementRef } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.html'
})
export class LineChartComponent implements OnInit {
  @Input() width: number = 300;
  @Input() height: number = 240;
  @Input() data: any[] = [];
  @Input() lineColor: string = "orange";
  @Input() dotColor: string = "orange";
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
    const width = this.width - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;

    const svg = d3.select(this.element).select("svg")
      .attr("width", this.width + this.margin.left)
      .attr("height", this.height + this.margin.top)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // set the domain and ranges for x axis
    const x = d3.scaleTime()
      .domain(d3.extent(this.data, d => d.date))
      .range([0, width]);

    // set the domain and ranges for y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.close)])
      .range([height, 0]);

    // define the line
    const line = this._makeLineFunc(x, y, "close");
    const line2 = this._makeLineFunc(x, y, "open");
    const line3 = this._makeLineFunc(x, y, "neutral");

    // add line path using line()
    const path = this._addPath(line, "line1", null);
    const path2 = this._addPath(line2, "line2", "green");
    const path3 = this._addPath(line3, "line3", "red");

    // add dots
    const circles = this._addDots(svg, x, y, "close");
    const circles2 = this._addDots(svg, x, y, "open");
    const circles3 = this._addDots(svg, x, y, "neutral");

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(500)
      .attr("stroke-dashoffset", 0);

    const totalLength2 = path2.node().getTotalLength();

    path2
      .attr("stroke-dasharray", totalLength2 + " " + totalLength2)
      .attr("stroke-dashoffset", totalLength2)
      .transition()
      .delay(500)
      .duration(500)
      .attr("stroke-dashoffset", 0);

    const totalLength3 = path3.node().getTotalLength();

    path3
      .attr("stroke-dasharray", totalLength3 + " " + totalLength3)
      .attr("stroke-dashoffset", totalLength3)
      .transition()
      .delay(1000)
      .duration(500)
      .attr("stroke-dashoffset", 0);

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

  private _makeLineFunc(x: (date: any) => any, y: (val: number) => any, col: string): any {
    return d3.line()
      .x(d => x(d.date))
      .y(d => y(d[col]));
  }

  private _addPath(line: (data: any) => any, id: string, color: string | null) {
    return d3.select(this.element).select("#" + id)
      .attr("d", line(this.data))
      .attr("transform", "translate(20, 10)")
      .attr("stroke", color || "orange")
      .attr("stroke-width", "2");
  }

  private _addDots(svg: any, x: any, y: any, col: string) {
    return svg.selectAll("dot")
      .data(this.data)
      .enter().append("svg:circle")
      .attr("transform", "translate(20, 10)")
      .attr("r", 3)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d[col]))
      .style("fill", this.dotColor || "orange");
  }

}
