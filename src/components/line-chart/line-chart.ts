import { Component, Input, OnInit, ElementRef } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.html'
})
export class LineChartComponent implements OnInit {
  @Input() width: number = 300;
  @Input() height: number = 240;

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
      .attr("width", this.width + 10)
      .attr("height", this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      // .attr("viewBox", "0 0 " + width + " " + height);

    // parse the date / time
    // const parseTime = d3.timeParse("%d-%b-%y");

    // // set the ranges
    // const x = d3.scaleTime().range([0, width]);
    // const y = d3.scaleLinear().range([height, 0]);

    // // define the line
    // const line = d3.line()
    //   .x(function(d) { return x(d.date); })
    //   .y(function(d) { return y(d.close); });


    // const data = [
    //   { date: "1-May-12", close: 58.13 },
    //   { date: "30-Apr-12", close: 53.98 },
    //   { date: "27-Apr-12", close: 61.25 }
    // ];

    // format the data
    // data.forEach(function(d) {
    //   d.date = parseTime(d.date);
    //   d.close = +d.close;
    // });

    // // Scale the range of the data
    // x.domain(d3.extent(data, function(d) { return d.date; }));
    // y.domain([0, d3.max(data, function(d) { return d.close; })]);


    // TODO: Remove once implemented.
    const data = d3.range(11).map(function() {
      return Math.random() * 10
    });

    const x = d3.scaleLinear()
      .domain([0, 10])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    const line = d3.line()
      .x((d,i) => {
        return x(i);
      })
      .y((d) => {
        return y(d);
      });

    // gridlines in x axis function
    function make_x_gridlines() {
      return d3.axisBottom(x).ticks(5)
    }

    // gridlines in y axis function
    function make_y_gridlines() {
      return d3.axisLeft(y).ticks(5)
    }

  // add the X gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(20," + height + ")")
    .call(make_x_gridlines()
      .tickSize(-height)
      .tickFormat("")
    );

  // add the Y gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(20, 0)")
    .call(make_y_gridlines()
      .tickSize(-width)
      .tickFormat("")
    );

    const path = svg.append("path")
      .attr("d", line(data))
      .attr("transform", "translate(20,0)")
      .attr("stroke", "orange")
      .attr("stroke-width", "2")
      .attr("fill", "none");

    const circles = svg.selectAll("dot")
      .data(data)
      .enter().append("svg:circle")
      .attr("transform", "translate(20,0)")
      .attr('class', 'circ')
      .attr("r", 5)
      .attr("cx", (d, i) => x(i))
      .attr("cy", (d, i) => y(d))
      .style("fill", "orange");

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0);

    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y).ticks(5);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(20,0)")
      .call(yAxis);

    // draw x axis with labels and move to the bottom of the chart area
    svg.append("g")
      .attr("class", "x-axis axis")  // two classes, one for css formatting, one for selection below
      .attr("transform", "translate(20," + height + ")")
      .call(xAxis);
  }

}
