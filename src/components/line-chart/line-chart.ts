import { Component, Input, OnInit, ElementRef } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.html'
})
export class LineChartComponent implements OnInit {
  @Input() width: number = 300;
  @Input() height: number = 240;
  @Input() data: any = null;

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
    const padding = 10;

    const svg = d3.select(this.element).select("svg")
      .attr("width", this.width + padding)
      .attr("height", this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .attr("viewBox", "0 0 " + this.width + " " + this.height);

    // set the domain and ranges
    const x = d3.scaleTime()
      .domain(d3.extent(this.data, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.close)])
      .range([height, 0]);

    // define the line
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.close));

    // grid lines in x and y axis
    const xGridLines = () => d3.axisBottom(x);
    const yGridLines = () => d3.axisLeft(y);

    // add the X grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + this.margin.left * 2 + "," + height + ")")
      .call(xGridLines()
        .tickSize(-height)
        .tickFormat("")
      );

    // add the Y grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + this.margin.left * 2 + ", 0)")
      .call(yGridLines()
        .tickSize(-width)
        .tickFormat("")
      );

    // add line path using line()
    const path = svg.append("path")
      .attr("d", line(this.data))
      .attr("transform", "translate(" + this.margin.left * 2 + ",0)")
      .attr("stroke", "orange")
      .attr("stroke-width", "2")
      .attr("fill", "none");

    // add dots
    const circles = svg.selectAll("dot")
      .data(this.data)
      .enter().append("svg:circle")
      .attr("transform", "translate(" + this.margin.left * 2 + ",0)")
      .attr("class", "circ")
      .attr("r", 3)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.close))
      .style("fill", "orange");

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);

    // x and y axis
    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickFormat(d3.timeFormat("%m/%d"));

    const yAxis = d3.axisLeft(y).ticks(5);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + this.margin.left * 2 + ",0)")
      .call(yAxis);

    svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(" + this.margin.left * 2 + "," + height + ")")
      .call(xAxis);
  }

}
