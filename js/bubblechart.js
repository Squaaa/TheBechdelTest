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
    vis.height = 350;

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

    var wordCountMin = d3.min(vis.displayData, function (d) {return d.words });
    var wordCountMax = d3.max(vis.displayData, function (d) {return d.words });
    vis.radiusScale = d3.scaleSqrt().domain([1, wordCountMax]).range([1, 40]);

    var forceXSplitRole = d3.forceX(d => vis.width * (d.role === "lead" ? 0.3 : 0.7))
        .strength(0.2);
    var forceXSplitGender = d3.forceX(d => vis.width * (d.gender === "female" ? 0.3 : 0.7))
        .strength(0.2);

    var forceXCombine = d3.forceX((vis.width) * 2/5).strength(0.1);

    var forceCollide = d3.forceCollide(function(d){
        return vis.radiusScale(d.words) + 1
    }).iterations(10);

    var simulation = d3.forceSimulation()
        .force("x", forceXCombine)
        .force("y", d3.forceY((vis.height / 3) + 10).strength(0.15))
        .force("center", d3.forceCenter(vis.width * 2 / 5, vis.height * 2 / 5))
        .force("collide", forceCollide)
        .nodes(vis.displayData)
        .on('tick', ticked);

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return "Character: " + d['character'] + "</br># of Words Spoken: "  + d['words'];
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
                return vis.radiusScale(d.words)
            }
            return 0;
        })
        .style("fill", function (d) {
            return d.gender === "female" ? "#9b59b6" : "#ccc";
        });

    circles.on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);

    var onRoleClick = function(){
        simulation
            .force("x", splitRole ? forceXCombine : forceXSplitRole)
            .alpha(0.7)
            .restart();
        setRoleAtRight(!splitRole);
    };

    vis.splitRoleCategories = ["Lead", "Supporting"];
    vis.splitGenderCategories = ["Female", "Male"];

    var splitRoleLabels = vis.svg.selectAll("text.split-role")
        .data(vis.splitRoleCategories)
        .enter().append("text")
        .attr("class", "split-role")
        .style("opacity", 0)
        .attr("x", function (d, i) {
            if (i === 0) {
                return vis.width / 6;
            }
            if (i === 1) {
                return vis.width / 2 + 25;
            }
            return 0;
        })
        .attr("y", vis.height - 75)
        .text(function (d) { return d; });

    var splitGenderLabels = vis.svg.selectAll("text.split-gender")
        .data(vis.splitGenderCategories)
        .enter().append("text")
        .attr("class", "split-gender")
        .style("opacity", 0)
        .attr("x", function (d, i) {
            if (i === 0) {
                return vis.width / 6;
            }
            if (i === 1) {
                return vis.width / 2 + 25;
            }
            return 0;
        })
        .attr("y", vis.height - 75)
        .text(function (d) { return d; });

    var splitRole = false;
    var splitGender = false;

    var rectRole = vis.svg.append("rect")
        .attr("x", 7)
        .attr("y", vis.height - 57)
        .attr("rx", 22)
        .attr("ry", 22)
        .style("fill", "lightgray")
        .attr("width", 64)
        .attr("height", 40)
        .on("click", onRoleClick)

    var circleRole = vis.svg.append("circle")
        .attr("cx", 27)
        .attr("cy", vis.height - 37)
        .attr("r", 16)
        .style("fill", "white")
        .on("click", onRoleClick)


    var setRoleAtRight = function(newValue) {
        circleRole.transition().duration(250)
            .attr("cx", (newValue? (51) : (27)))
            .style("fill", "white");
        rectRole.transition().duration(250)
            .style("fill", newValue? "#55efc4" : "lightgray");
        splitRoleLabels.style("opacity", newValue? 100 : 0);
        if(splitGender) {
            setGenderAtRight(false);
        }
        splitRole = newValue;
    };

    var onGenderClick = function(){
        simulation
            .force("x", splitGender ? forceXCombine : forceXSplitGender)
            .alpha(0.7)
            .restart();
        setGenderAtRight(!splitGender);
    };

    var rectGender = vis.svg.append("rect")
        .attr("x", vis.width / 2)
        .attr("y", vis.height - 57)
        .attr("rx", 22)
        .attr("ry", 22)
        .style("fill", "lightgray")
        .attr("width", 64)
        .attr("height", 40)
        .on("click", onGenderClick);

    var circleGender = vis.svg.append("circle")
        .attr("cx", vis.width / 2 + 20)
        .attr("cy", vis.height - 37)
        .attr("r", 16)
        .style("fill", "white")
        .on("click", onGenderClick);


    var setGenderAtRight = function(newValue) {
        circleGender.transition().duration(250)
            .attr("cx", (newValue? (vis.width / 2 + 44) : (vis.width / 2 + 20)))
            .style("fill", "white");
        rectGender.transition().duration(250)
            .style("fill", newValue? "#55efc4" : "lightgray");
        splitGenderLabels.style("opacity", newValue? 100 : 0);
        if (splitRole) {
            setRoleAtRight(false);
        }
        splitGender = newValue;
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

    vis.dataCategories = ["Male", "Female"];

    vis.legend = vis.svg.selectAll("rect.legend")
        .data(vis.dataCategories);

    vis.legend.enter().append("rect")
        .attr("class", "legend")
        .attr("width", 15)
        .attr("height", 15)
        .merge(vis.legend)
        .attr("x", 0)
        .attr("y", function(d, i) {return i * 20})
        .attr("fill", function(d){
            if (d === "Male") {
                return "#ccc";
            }
            if (d === "Female") {
                return "#9b59b6";
            }
            return "black";
        });

    vis.legend.exit().remove();

    var getGenderCharacterPercentage = function (d) {
        var count = 0;
        vis.displayData.forEach(function (e) {
            if (e['gender'] && e['gender'].toLowerCase() === d.toLowerCase()) {
                count++;
            }
        });
        return Math.round(100 * count / vis.displayData.length);
    };

    var getGenderDialoguePercentage = function (d) {
        var count = 0;
        var total = 0;
        vis.displayData.forEach(function (e) {
            if (e['words']) {
                total += e['words'];
                if (e['gender'] && e['gender'].toLowerCase() === d.toLowerCase()) {
                    count += e['words'];
                }
            }
        });
        return Math.round(100 * count / total);
    };

    var legendLabels = vis.svg.selectAll("text.legend")
        .data(vis.dataCategories);

    legendLabels.enter().append("text")
        .attr("class", "legend")
        .merge(legendLabels)
        .attr("x", 20)
        .attr("y", function (d, i) {
            return i * 20 + 13;
        })
        .text(function (d) {
            return d + " (Characters " + getGenderCharacterPercentage(d) +
                "%, Dialogue " + getGenderDialoguePercentage(d) + "%)"
        });

    legendLabels.exit().remove();

    vis.toggleCategories = ["Split by Role", "Split by Gender"];

    var toggleLabels = vis.svg.selectAll("text.toggle")
        .data(vis.toggleCategories);

    toggleLabels.enter().append("text")
        .attr("class", "toggle")
        .merge(toggleLabels)
        .attr("x", function (d, i) {
            if (i === 0) {
                return 7 + 75;
            }
            if (i === 1) {
                return vis.width / 2 + 75;
            }
            return 0;
        })
        .attr("y", vis.height - 32)
        .text(function (d) { return d; });

    toggleLabels.exit().remove();

    var valueDiff = wordCountMax - wordCountMin;
    var valueRange = [valueDiff / 4, valueDiff / 2, valueDiff * 3 / 4];

    var legendCircles = vis.svg.selectAll("circle.size-legend")
        .data(valueRange);

    var sizeLabels = vis.svg.selectAll("text.size-legend")
        .data(valueRange);

    var padding = 60;

    legendCircles.enter()
        .append("circle")
        .attr("class", "size-legend")
        .merge(legendCircles)
        .attr("r", function (d) {
            return vis.radiusScale(d);
        })
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("cx", vis.width - 100)
        .attr("cy", function (d, index) {
            return (index) * padding + 20;
        });

    sizeLabels.enter()
        .append("text")
        .attr("class", "size-legend")
        .merge(sizeLabels)
        .text(function(d) {
            return Math.round(wordCountMin + d).toString();
        })
        .attr("x", vis.width - 50)
        .attr("y", function (d, index) {
            return (index) * padding + 20;
        });

    legendCircles.exit().remove();
    sizeLabels.exit().remove();
};

