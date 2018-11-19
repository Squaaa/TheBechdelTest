/*
 * ScatterPlot - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

ScatterPlot = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.displayData = []; // see data wrangling

    this.initVis();
}

ScatterPlot.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 50, bottom: 40, left: 90};

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleLinear()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.domesticGross; }));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain(d3.extent(vis.data, function(d) { return d.budget; }));

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("text")
        .attr("transform",
            "translate(" + (vis.width/2) + " ," +
            (vis.height + vis.margin.top + 8) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Domestic Gross");

    vis.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - vis.margin.left)
        .attr("x", 0 - (vis.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Budget");



    vis.wrangleData();

};

ScatterPlot.prototype.wrangleData = function(){
    var vis = this;

    // In the first step no data wrangling/filtering needed
    vis.displayData = vis.filteredData;

    // Update the visualization
    vis.updateVis();
}

ScatterPlot.prototype.updateVis = function(){
    var vis = this;

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return d.title + " (" + d.year + ")";
        });

    vis.svg.call(tool_tip);

    var circle = vis.svg.selectAll("circle")
        .data(vis.displayData);

    circle.enter()
        .append("circle")
        .merge(circle)
        .attr("fill", function(d){
            if(d.bechdel === true){
                return "blue";
            }
            return "red";
        })
        .attr("stroke-opacity", 0)
        .attr("r", 2)
        .attr("cy", function(d) {
            return vis.y(d.budget);
        })
        .attr("cx", function(d) {
            return vis.x(d.domesticGross);
        })
        .attr("stroke", "black")
        .on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);

    circle.exit().remove();

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
}

ScatterPlot.prototype.onSelectionChange = function(selectionStart, selectionEnd){
    var vis = this;

    // Filter original unfiltered data depending on selected time period (brush)
    vis.filteredData = vis.data.filter(function(d){
        return d.year >= selectionStart && d.year <= selectionEnd;
    });

    vis.wrangleData();
}