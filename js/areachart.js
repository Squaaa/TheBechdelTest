/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

StackedAreaChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    console.log(this.data);

    this.initVis();
}

StackedAreaChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 30, bottom: 30, left: 30};

    vis.width = 900 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Path clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.nestedBechdelCount = d3.nest()
        .key(function(d) { return d.year; })
        .rollup(function(v) { return {
            count: v.length,
            pass: d3.sum(v, function(d) { return d.bechdel; }),
            fail: v.length - d3.sum(v, function(d) { return d.bechdel; })
        }; })
        .entries(vis.data);

    vis.bechdelData = []
    for (i=0; i<vis.nestedBechdelCount.length; i++) {
        vis.bechdelData.push({
            year: vis.nestedBechdelCount[i].key,
            pass: vis.nestedBechdelCount[i].value.pass,
            fail: vis.nestedBechdelCount[i].value.fail
        })
    }

    vis.bechdelData = vis.bechdelData.reverse();


    var dataCategories = ["pass", "fail"];
    var stack = d3.stack()
        .keys(dataCategories);

    vis.stackedData = stack(vis.bechdelData);

    // Initialize stacked area layout
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.data.year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width])
        .domain(d3.extent(vis.bechdelData, function(d) { return d.year; }));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(d3.format("d"));

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.wrangleData();

};

StackedAreaChart.prototype.wrangleData = function(){
    var vis = this;

    // In the first step no data wrangling/filtering needed
    vis.displayData = vis.stackedData;

    // Update the visualization
    vis.updateVis();
}

StackedAreaChart.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            return e[1];
        });
    })
    ]);

    //var dataCategories = colorScale.domain();

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function(d,i) {
            if (d.key == "pass") {
                return "blue";
            }
            return "red";
        })
        .attr("d", function(d) {
            return vis.area(d);
        });


    categories.exit().remove();


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
}