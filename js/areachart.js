/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the data
 */

StackedAreaChart = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.displayData = []; // see data wrangling

    this.initVis();
}

StackedAreaChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 50, bottom: 30, left: 140};

    vis.width = 1100 - vis.margin.left - vis.margin.right,
        vis.height = 250 - vis.margin.top - vis.margin.bottom;

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

    // Initialize stacked area layout
    vis.area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return vis.x(d.data.year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    // Initialize brushing component
    vis.currentBrushRegion = null;

    vis.brush = d3.brushX()
        .extent([[0,0],[vis.width, vis.height]])
        .on("brush", function(){
            // User just selected a specific region
            vis.currentBrushRegion = d3.event.selection;
            vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.eventHandler).trigger("selectionChanged", vis.currentBrushRegion);
        });

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

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

    // Y-axis label
    vis.yLabel = vis.svg.append("text")
        .attr("class", "y-axis")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("x", 0 - (vis.height / 2))
        .style("text-anchor", "middle");

    vis.wrangleData();

};

StackedAreaChart.prototype.wrangleData = function(){
    var vis = this;

    var yValue = d3.select("#select-box").property("value");
    var parameters = [];

    if (yValue === "number") {
        parameters = ["pass", "fail"];
    } else if (yValue === "proportion") {
        parameters = ["propPass", "propFail"];
    } else if (yValue === "budget") {
        parameters = ["passBudget", "failBudget"];
    } else {
        parameters = ["passGross", "failGross"];
    }

    vis.nestedBechdelCount = d3.nest()
        .key(function(d) { return d.year; })
        .rollup(function(v) { return {
            count: v.length,
            pass: d3.sum(v, function(d) { return d.bechdel; }),
            fail: v.length - d3.sum(v, function(d) { return d.bechdel; }),
            propPass: d3.sum(v, function(d) { return d.bechdel; }) / v.length,
            propFail: (v.length - d3.sum(v, function(d) { return d.bechdel; })) / v.length,
            passBudget: d3.sum(v, function(d) {
                if (d.bechdel) {
                    return d.budget;
                }
                return 0;
            }),
            failBudget: d3.sum(v, function(d) {
                if (!d.bechdel) {
                    return d.budget;
                }
                return 0;
            }),
            passGross: d3.sum(v, function(d) {
                if (d.bechdel) {
                    return d.domesticGross;
                }
                return 0;
            }),
            failGross: d3.sum(v, function(d) {
                if (!d.bechdel) {
                    return d.domesticGross;
                }
                return 0;
            })
        }; })
        .entries(vis.data);

    vis.bechdelData = []
    for (i=0; i<vis.nestedBechdelCount.length; i++) {
        vis.bechdelData.push({
            year: vis.nestedBechdelCount[i].key,
            pass: vis.nestedBechdelCount[i].value[parameters[0]],
            fail: vis.nestedBechdelCount[i].value[parameters[1]]
        })
    }

    vis.bechdelData = vis.bechdelData.reverse();

    vis.dataCategories = ["fail", "pass"];
    var stack = d3.stack()
        .keys(vis.dataCategories);

    vis.stackedData = stack(vis.bechdelData);

    vis.displayData = vis.stackedData;

    // Update the visualization
    vis.updateVis();
}

StackedAreaChart.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    vis.x.domain(d3.extent(vis.bechdelData, function(d) { return d.year; }));
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            return e[1];
        });
    })
    ]);

    // Legend color blocks
    var legend = vis.svg.selectAll("rect.legend")
        .data(vis.dataCategories);

    legend.enter().append("rect")
        .attr("class", "legend")
        .attr("width", 15)
        .attr("height", 15)
        .merge(legend)
        .transition()
        .duration(800)
        .attr("x", -vis.margin.left)
        .attr("y", function(d, i) {return i * 25})
        .attr("fill", function(d){
            if (d === "pass") {
                return "blue";
            }
            return "red";
        })

    legend.exit().remove();

    // Legend labels
    var labels = vis.svg.selectAll("text.legend")
        .data(vis.dataCategories.slice().reverse());

    labels.enter().append("text")
        .attr("class", "legend")
        .merge(labels)
        .transition()
        .duration(800)
        .attr("x", -vis.margin.left + 20)
        .attr("y", function(d, i) {return i * 25 + 10})
        .text(function(d) {return d});

    labels.exit().remove();

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .transition()
        .duration(800)
        .style("fill", function(d) {
            if (d.key == "pass") {
                return "blue";
            }
            return "red";
        })
        .attr("d", function(d) {
            return vis.area(d);
        });

    categories.exit().remove();

    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush")
        .attr("clip-path", "url(#clip)")
        .call(vis.brush);


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis")
        .transition()
        .duration(800)
        .call(vis.yAxis);
}