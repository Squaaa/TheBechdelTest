/*
 * IconChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

IconChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    this.initVis();
}

IconChart.prototype.initVis = function() {
    var vis = this;

    vis.width = 500;
    vis.height = 300;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .append("g");

    var dataCategories = ["Male", "Female"];

    vis.legend = vis.svg.selectAll("rect.legend")
        .data(dataCategories);

    vis.legend.enter().append("rect")
        .attr("class", "legend")
        .attr("width", 15)
        .attr("height", 15)
        .merge(vis.legend)
        .attr("x", function(d, i) {return i * 100})
        .attr("y", 0)
        .attr("fill", function(d){
            if (d === "Male") {
                return "red";
            }
            if (d === "Female") {
                return "blue";
            }
            return "black";
        });

    vis.legend.exit().remove();

    vis.labels = vis.svg.selectAll("text.legend")
        .data(dataCategories);

    vis.wrangleData();
};

IconChart.prototype.wrangleData = function(){
    var vis = this;

    // In the first step no data wrangling/filtering needed
    // vis.displayData = vis.stackedData;
    vis.displayData = vis.data.filter(function (d) {
        return d['gender'] === "male" || d['gender'] === "female";
    });

    // Update the visualization
    vis.updateVis();
}

IconChart.prototype.updateVis = function(){
    var vis = this;

    let rowLength = Math.ceil(Math.sqrt(2 * vis.displayData.length));
    let radius = 250 / rowLength;

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            var html = d['name'];
            if (d['characterType']) {
                html += "</br>" + d['characterType']
            }
            if (d['department']) {
                html += "</br>" + d['department']
            }
            return html;
        });

    vis.svg.call(tool_tip);

    var circle = vis.svg.selectAll("circle")
        .data(vis.displayData);

    circle.enter().append("circle")
        .merge(circle)
        .attr("fill", function (d) {
            if (d['gender'] === "male") {
                return "red";
            }
            if (d['gender'] === "female") {
                return "blue";
            }
            return "black";
        })
        .attr("r", 0.8 * radius)
        .attr("cx", function (d, i) { return radius + (i % rowLength) * (2 * radius); })
        .attr("cy", function (d, i) { return 50 + Math.floor(i / rowLength) * (2 * radius); })
        .on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);

    circle.exit().remove();

    var getGenderPercentage = function(d) {
        var count = 0;
        vis.displayData.forEach(function (e) {
            if (e['gender'] === d.toLowerCase()) {
                count++;
            }
        });
        return Math.round(100 * count / vis.displayData.length);
    };

    vis.labels.enter().append("text")
        .attr("class", "legend")
        .merge(vis.labels)
        .attr("x", function(d, i) {return i * 100 + 20})
        .attr("y", 12)
        .text(function(d) { return d + " (" + getGenderPercentage(d) + "%)" });

    vis.labels.exit().remove();
}
