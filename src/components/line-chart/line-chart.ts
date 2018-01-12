import { Component, Input, ElementRef, OnChanges, ChangeDetectionStrategy, SimpleChanges } from "@angular/core";
import { ILineItem } from "../../interfaces";
import * as d3 from "d3";

@Component({
  selector: "line-chart",
  templateUrl: "line-chart.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements OnChanges {
  @Input() width: number = 330;
  @Input() height: number = 240;
  @Input() data: ILineItem[] = [];
  @Input() loading: boolean = false;
  @Input() animate: boolean = false;
  @Input() lineColors: string[] = ["#2075CB", "#EF8E0F", "#00B200"];
  @Input() dateFormat: string = "%m/%d";
  @Input() series: string[] = ["line1", "line2", "line3"];
  @Input() showAreaFill: boolean = true;
  @Input() showXAxisLabels: boolean = true;
  @Input() showYAxisLabels: boolean = true;
  @Input() noDataText: string = "No data";

  private element: any;
  private margin: any = { left: 10, right: 10, top: 10, bottom: 10 };

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    this._clear();

    if (!this.loading && this.data && this.data.length) {
      this._draw();
    }
  }

  private _draw(): void {
    const initialDelay = 100;
    const viewBoxWithMultiplier = 1.1;
    const width = this.width - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;

    // Position svg using given margins
    const svg = d3.select(this.element).select("svg")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .attr("viewBox", "0 0 " + this.width * viewBoxWithMultiplier + " " + this.height * viewBoxWithMultiplier);

    // Set the domain and range for values on the x-axis
    const x = d3.scaleTime()
      .domain(d3.extent(this.data, (d: ILineItem) => d.date))
      .range([0, width]);

    // Calculate max y value from the data array
    const maxYDomain = d3.max(this.data, d => Math.max(d.line1 || 0, d.line2 || 0, d.line3 || 0));

    // Set the domain and range for values on the y axis
    const y = d3.scaleLinear()
      .domain([0, maxYDomain])
      .range([height, 0]);

    // Iterate over series array and draw line charts.
    // series has pre-determined values [line1, line2, line3] for each line chart.
    this.series.forEach((colName, index) => {
      // make line function
      const lineFunc = this._getLineFunc(x, y, colName);

      // Iterate over data array and generate two arrays; solid and dotted lines.
      // dotted line is for averaged points.
      const dottedLineData = [];
      const solidLineData = this.data.map((d, i) => {
        let isDataPointAveraged;

        // Check if consumption data is averaged due to missing value.
        if (d.line1) {
          isDataPointAveraged = this._isDataPointAveraged(d.line1);

          if (!isDataPointAveraged) {
            // Adds a placeholder if data point is not averaged.
            dottedLineData.push({ date: this.data[i].date, line1: null, line2: null, line3: null });
          }
          // Data point is averaged
          else {
            // Check if prev value is averaged. If it is not averaged, then add it to
            // dottedLineData array, so a line can be drawn from it to current averaged data point.
            if (i > 0 && !this._isDataPointAveraged(this.data[i - 1].line1)) {
              const prevDataPoint = {
                date: this.data[i - 1].date,
                line1: this.data[i - 1].line1,
                line2: null,
                line3: null
              };

              dottedLineData.push(prevDataPoint);
            }

            // Push current averaged data point.
            dottedLineData.push({ date: d.date, line1: d.line1, line2: null, line3: null });

            // Check if next value is averaged. Draw a line from the averaged point to actual data point.
            if (i < this.data.length - 1 && !this._isDataPointAveraged(this.data[i + 1].line1)) {
              const nextDataPoint = {
                date: this.data[i + 1].date,
                line1: this.data[i + 1].line1,
                line2: null,
                line3: null
              };

              dottedLineData.push(nextDataPoint);
            }
          }
        }

        return {
          date: d.date,
          // Leave a hole if value of line1 is averaged.
          line1: isDataPointAveraged ? null : d.line1,
          line2: d.line2,
          line3: d.line3
        };
      });

      // add solid line paths.
      const path = this._addPath(svg, lineFunc, solidLineData, this.lineColors[index], "solid-line");

      // add dotted line paths for averaged data.
      const dottedLineHasData = dottedLineData.filter(d => d.line1 !== null).length > 0;
      if (dottedLineHasData) {
        this._addPath(svg, lineFunc, dottedLineData, this.lineColors[index], "dotted-line");
      }

      // add dots
      this._addDots(svg, x, y, colName, this.lineColors[index]);

      // animate lines.
      this._animatePath(path, initialDelay * (index + 1), 800);

      // add area under line chart
      if (this.showAreaFill) {
        svg.append("path")
          .attr("class", "area")
          .attr("d", this._getAreaFunc(x, y, height, this.data, ""))
          .attr("fill", () => this.lineColors[index])
          .attr("transform", "translate(20, 10)")
          .transition()
          .delay(800)
          .duration(350)
          .attr("d", this._getAreaFunc(x, y, height, this.data, colName));
      }
    });

    // x and y axis
    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickPadding(5)
      .tickSizeInner(-height)
      .tickFormat(d3.timeFormat(this.dateFormat));

    // Calculates the range of values for Y axis.
    let divider = "1";
    for (let i = 0; i < parseInt(maxYDomain).toString().length - 2; i++) {
      divider += "0";
    }

    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickPadding(5)
      .tickSizeInner(-width)
      .tickFormat(d => d / parseInt(divider));

    if (this.showXAxisLabels) {
      svg.append("g")
        .attr("transform", "translate(20," + (height + this.margin.top) + ")")
        .call(xAxis);
    }

    if (this.showYAxisLabels) {
      svg.append("g")
        .attr("transform", "translate(20, 10)")
        .call(yAxis);
    }
  }

  private _getLineFunc(x: (date: any) => any, y: (val: number) => any, colName: string): any {
    return d3.line()
      .x(d => x(d.date))
      .y(d => y(d[colName]))
      .defined(d => d[colName] !== null)
  }

  private _addPath(svg: any, lineFunc: (data: any) => any, lineData: ILineItem[], color: string, className: string) {
    return svg.append("path")
      .attr("class", className)
      .attr("d", lineFunc(lineData))
      .attr("transform", "translate(20, 10)")
      .attr("stroke", color)
      .attr("stroke-width", "2");
  }

  private _addDots(svg: any, x: any, y: any, colName: string, color: string) {
    return svg.selectAll("dot")
      .data(this.data)
      .enter().append("svg:circle")
      .attr("transform", "translate(20, 10)")
      .attr("r", 1.5)
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d[colName]))
      .style("stroke", color)
      .attr("fill", d => {
        // add a dot with border for line1 data points which is usage/consumption data.
        // For everything else, all dots should be filled in with given color.
        return colName === "line1" && this._isDataPointAveraged(d[colName]) ? "none" : color;
      });
  }

  private _animatePath(path: any, delay: number = 0, duration: number = 0) {
    const totalLength = path.node().getTotalLength();

    if (this.animate) {
      path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("stroke-dashoffset", 0);
    } else {
      path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .attr("stroke-dashoffset", 0);
    }
  }

  private _getAreaFunc(xScale, yScale, height, data, field) {
    return d3.area()
      .x(d => xScale(d.date))
      .y0(height)
      .y1(d => yScale(d[field] || 0))(data);
  };

  private _clear() {
    const svg = d3.select(this.element).select("svg")

    svg.selectAll("*").remove();
  }

  private _isDataPointAveraged(value: number | undefined): boolean {
    if (!value) {
      return false;
    }

    const decimalValue = value % 1;

    return parseFloat(decimalValue.toString()).toFixed(5) === "0.00099";
  }

}
