/*
 * StackedBarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the data
 */

StackedBarChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.displayData = []; // see data wrangling

    this.initVis();
}

StackedBarChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 50, bottom: 90, left: 50};

    vis.width = 600 - vis.margin.left - vis.margin.right,
        vis.height = 450 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.1)
        .paddingOuter(0.1);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(function(d){
            if(Math.floor(d) != d)
            {
                return;
            }
            return d;
        });

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Y-axis label
    vis.svg.append("text")
        .attr("class", "y-axis")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("x", 0 - (vis.height / 2))
        .style("text-anchor", "middle")
        .text("Number of movies");

    vis.wrangleData();

};

StackedBarChart.prototype.wrangleData = function(){
    var vis = this;

    var nestedData = d3.nest()
        .key(function(d) { return d.genre; })
        .rollup(function(v) { return {
            count: v.length,
            pass: d3.sum(v, function(d) { return d.bechdel; }),
            fail: v.length - d3.sum(v, function(d) { return d.bechdel; })
        }; })
        .entries(vis.filteredData);

    var genreData = []

    for (i=0; i<nestedData.length; i++) {
        genreData.push({
            genre: nestedData[i].key,
            count: nestedData[i].value.count,
            pass: nestedData[i].value.pass,
            fail: nestedData[i].value.fail
        })
    }

    genreData.sort(function(a,b) {
        return b.count - a.count;
    })

    vis.displayData = genreData;

    // Update the visualization
    vis.updateVis();
}

StackedBarChart.prototype.updateVis = function(){
    var vis = this;

    vis.x.domain(vis.displayData.map(function(d) {return d.genre}));

    vis.y.domain([
        0,
        d3.max(vis.displayData, function(d) {return d.count})
    ]);

    // Create fail bars
    var fail = vis.svg.selectAll("rect.fail")
        .data(vis.displayData, function(d) {return d.genre});

    fail.enter().append("rect")
        .attr("class", "fail")
        .merge(fail)
        .transition()
        .duration(800)
        .style("fill", "red")
        .attr("x", function(d) {
            return vis.x(d.genre);
        })
        .attr("y", function(d) {
            return vis.y(d.fail);
        })
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d) {
            return vis.height - vis.y(d.fail);
        });

    fail.exit().remove();

    // Create pass bars
    var pass = vis.svg.selectAll("rect.pass")
        .data(vis.displayData, function(d) {return d.genre});

    pass.enter().append("rect")
        .attr("class", "pass")
        .merge(pass)
        .transition()
        .duration(800)
        .style("fill", "blue")
        .attr("x", function(d) {
            return vis.x(d.genre);
        })
        .attr("y", function(d) {
            return vis.y(d.pass + d.fail);
        })
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d) {
            return vis.height - vis.y(d.pass);
        });

    pass.exit().remove();

    // Create axes
    vis.svg.select(".x-axis")
        .transition()
        .duration(800)
        .call(vis.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    vis.svg.select(".y-axis")
        .transition()
        .duration(800)
        .call(vis.yAxis);
}

StackedBarChart.prototype.onSelectionChange = function(selectionStart, selectionEnd){
    var vis = this;

    // Filter original unfiltered data depending on selected time period (brush)
    vis.filteredData = vis.data.filter(function(d){
        return d.year >= selectionStart && d.year <= selectionEnd;
    });

    vis.wrangleData();
}