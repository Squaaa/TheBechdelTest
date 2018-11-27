/*
 * IconChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

BubbleChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    console.log(this.data);
    this.displayData = []; // see data wrangling

    this.initVis();
}

BubbleChart.prototype.initVis = function() {
    var vis = this;

    vis.width = 500;
    vis.height = 300;

    vis.svg = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("height", vis.height)
        .attr("width", vis.width)
        .append("g")
        .attr("transform", "translate(0,0)");

    vis.wrangleData();
};

BubbleChart.prototype.wrangleData = function(){
    var vis = this;

    vis.displayData = vis.data;

    vis.updateVis();
}

BubbleChart.prototype.updateVis = function(){
    var vis = this;

    var wordCountMax = d3.max(vis.displayData, function (d) {return d.words });
    var radiusScale = d3.scaleSqrt().domain([1, wordCountMax]).range([1, 40]);

    var forceXSplitRole = d3.forceX(d => vis.width * (d.role === "lead" ? 0.3 : 0.7))
        .strength(0.2);
    var forceXSplitGender = d3.forceX(d => vis.width * (d.gender === "female" ? 0.3 : 0.7))
        .strength(0.2);

    var forceXCombine = d3.forceX((vis.width)/2).strength(0.1);

    var forceCollide = d3.forceCollide(function(d){
        return radiusScale(d.words) + 1
    }).iterations(10);

    var simulation = d3.forceSimulation()
        .force("x", forceXCombine)
        .force("y", d3.forceY((vis.height / 3) + 10).strength(0.15))
        .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
        .force("collide", forceCollide)
        .nodes(vis.displayData)
        .on('tick', ticked);

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return d['character'] + "</br># of Words Spoken: "  + d['words'];
        });

    vis.svg.call(tool_tip);

    vis.displayData.forEach(d => d.words = +d.words);

    var circles = vis.svg.selectAll(".character")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "character")
        .attr("cx", function(d) {
            return d.x
        })
        .attr("cy", function(d) {
            return d.y
        })
        .attr("r", function(d){
            if (d.words) {
                return radiusScale(d.words)
            }
            return 0;
        })
        .style("fill", function (d) {
            return d.gender === "female" ? "#9b59b6" : "#ccc";
        });

    circles.on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);

    var onClick = function(){
        simulation
            .force("x", atRight ? forceXSplitRole : forceXCombine)
            .alpha(0.7)
            .restart();
        setAtRight(!atRight);
    };

    var atRight = true;

    var rect = vis.svg.append("rect")
        .attr("x", 7)
        .attr("y", 7)
        .attr("rx", 22)
        .attr("ry", 22)
        .style("fill", "lightgray")
        .attr("width", 64)
        .attr("height", 40)
        .on("click", onClick)

    var circle = vis.svg.append("circle")
        .attr("cx", 27)
        .attr("cy", 27)
        .attr("r", 16)
        .style("fill", "white")
        .on("click", onClick)


    var setAtRight = function(newValue) {
        atRight = newValue;
        circle.transition().duration(250)
            .attr("cx", (atRight? (27) : (51)))
            .style("fill", "white");
        rect.transition().duration(250)
            .style("fill", atRight? "lightgray" : "#55efc4");
    };

    var onClick2 = function(){
        simulation
            .force("x", atRight2 ? forceXSplitGender : forceXCombine)
            .alpha(0.7)
            .restart();
        setAtRight2(!atRight2);
    };

    var atRight2 = true;

    var rect2 = vis.svg.append("rect")
        .attr("x", 77)
        .attr("y", 7)
        .attr("rx", 22)
        .attr("ry", 22)
        .style("fill", "lightgray")
        .attr("width", 64)
        .attr("height", 40)
        .on("click", onClick2)

    var circle2 = vis.svg.append("circle")
        .attr("cx", 97)
        .attr("cy", 27)
        .attr("r", 16)
        .style("fill", "white")
        .on("click", onClick2)


    var setAtRight2 = function(newValue) {
        atRight2 = newValue;
        circle2.transition().duration(250)
            .attr("cx", (atRight2? (97) : (121)))
            .style("fill", "white");
        rect2.transition().duration(250)
            .style("fill", atRight2? "lightgray" : "#55efc4");
    };

    function ticked() {
        circles
            .attr("cx", function(d) {
                return d.x
            })
            .attr("cy", function(d) {
                return d.y
            })
    }

}

