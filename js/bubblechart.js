/*
 * IconChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

var currSplitGender = false;
var currSplitRole = false;

BubbleChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    console.log(this.data);
    this.displayData = []; // see data wrangling

    this.initVis();
}

BubbleChart.prototype.initVis = function() {
    var vis = this;

    vis.width = 800;
    vis.height = 300;

    vis.svg = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("height", vis.height)
        .attr("width", vis.width)
        .append("g")
        .attr("transform", "translate(0,0)");

    var genderLabel = ["Gender"];
    vis.svg.selectAll("text.gender-label")
        .data(genderLabel)
        .enter()
        .append("text")
        .attr("class", ".gender-label")
        .attr("x", 0)
        .attr("y", 15)
        .text(function (d) { return d });

    var wordsLabel = ["Number of Words Spoken"];
    vis.svg.selectAll("text.words-label")
        .data(wordsLabel)
        .enter()
        .append("text")
        .attr("class", ".words-label")
        .attr("x", 0)
        .attr("y", 110)
        .text(function (d) { return d });

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
    vis.radiusScale = d3.scaleSqrt().domain([1, wordCountMax]).range([1, 50]);

    var forceXSplitRole = d3.forceX(d => vis.width * (d.role === "lead" ? 0.57 : 0.85))
        .strength(0.2);
    var forceXSplitGender = d3.forceX(d => vis.width * (d.gender === "female" ? 0.57 : 0.85))
        .strength(0.2);

    var forceXCombine = d3.forceX((vis.width) * 0.65).strength(0.1);

    var forceCollide = d3.forceCollide(function(d){
        return vis.radiusScale(d.words) + 1
    }).iterations(10);

    if (!vis.simulation) {
        vis.simulation = d3.forceSimulation(vis.displayData)
            .force("x", forceXCombine)
            .force("y", d3.forceY((vis.height * 0.65) + 10).strength(0.15))
            .force("center", d3.forceCenter(vis.width * 0.6, vis.height * 0.5))
            .alphaTarget(1)
            .on('tick', ticked);
        vis.circles = vis.svg.selectAll(".character");

    }

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return "Character: " + d['character'] + "</br># of Words Spoken: "  + d['words'];
        });

    vis.svg.call(tool_tip);

    vis.displayData.forEach(d => d.words = +d.words);

    vis.circles = vis.circles.data(vis.displayData);

    var t = d3.transition()
        .duration(750);

    vis.circles.exit()
        .style("fill", "#aaa")
        .transition(t)
        .attr("r", 1e-6)
        .remove();

    vis.circles
        .transition(t)
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

    vis.circles = vis.circles.enter().append("circle")
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
        }).merge(vis.circles);

    vis.simulation.nodes(vis.displayData).force("collide", forceCollide.iterations(100));

    vis.circles.on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);

    function ticked() {
        vis.circles
            .attr("cx", function(d) {
                return d.x
            })
            .attr("cy", function(d) {
                return d.y
            })
    }

    // SPLIT LABELS

    vis.splitRoleCategories = ["Lead", "Supporting"];
    vis.splitGenderCategories = ["Female", "Male"];

    var splitRoleLabels = vis.svg.selectAll("text.split-role")
        .data(vis.splitRoleCategories);

    splitRoleLabels.enter().append("text")
        .merge(splitRoleLabels)
        .attr("class", "split-role")
        .style("opacity", currSplitRole ? 100 : 0)
        .attr("x", function (d, i) {
            if (i === 0) {
                return vis.width * 0.4;
            }
            if (i === 1) {
                return vis.width * 0.65;
            }
            return 0;
        })
        .attr("y", 15)
        .text(function (d) { return d; });

    splitRoleLabels.exit().remove();

    var splitGenderLabels = vis.svg.selectAll("text.split-gender")
        .data(vis.splitGenderCategories);

    splitGenderLabels.enter().append("text")
        .merge(splitGenderLabels)
        .attr("class", "split-gender")
        .style("opacity", currSplitGender ? 100 : 0)
        .attr("x", function (d, i) {
            if (i === 0) {
                return vis.width * 0.4;
            }
            if (i === 1) {
                return vis.width * 0.65;
            }
            return 0;
        })
        .attr("y", 15)
        .text(function (d) { return d; });

    splitGenderLabels.exit().remove();

    $('input[type=radio][name=split]').change(function() {
        if (this.value === 'none') {
            vis.simulation
                .force("x", forceXCombine)
                .alpha(0.7)
                .restart();
            currSplitRole = false;
            currSplitGender = false;
            vis.svg.selectAll("text.split-role").style("opacity", 0);
            vis.svg.selectAll("text.split-gender").style("opacity", 0);
        }
        else if (this.value === 'gender') {
            vis.simulation
                .force("x", forceXSplitGender)
                .alpha(0.7)
                .restart();
            currSplitRole = false;
            currSplitGender = true;
            vis.svg.selectAll("text.split-role").style("opacity", 0);
            vis.svg.selectAll("text.split-gender").style("opacity", 100);
        }
        else if (this.value === 'role') {
            vis.simulation
                .force("x", forceXSplitRole)
                .alpha(0.7)
                .restart();
            currSplitRole = true;
            currSplitGender = false;
            vis.svg.selectAll("text.split-role").style("opacity", 100);
            vis.svg.selectAll("text.split-gender").style("opacity", 0);
        }
    });

    // LEGEND

    vis.dataCategories = ["Male", "Female"];

    vis.legend = vis.svg.selectAll("rect.legend")
        .data(vis.dataCategories);

    vis.legend.enter().append("rect")
        .attr("class", "legend")
        .attr("width", 15)
        .attr("height", 15)
        .merge(vis.legend)
        .attr("x", 0)
        .attr("y", function(d, i) {return i * 20 + 30})
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
            return i * 20 + 43;
        })
        .text(function (d) {
            return d + " (Characters " + getGenderCharacterPercentage(d) +
                "%, Dialogue " + getGenderDialoguePercentage(d) + "%)"
        });

    legendLabels.exit().remove();

    var valueDiff = wordCountMax - wordCountMin;
    var valueRange = [valueDiff / 10, valueDiff * 2 / 5, valueDiff * 9 / 10];

    var legendCircles = vis.svg.selectAll("circle.size-legend")
        .data(valueRange);

    var sizeLabels = vis.svg.selectAll("text.size-legend")
        .data(valueRange);

    var legendCirclesRadius = valueRange.map(d => vis.radiusScale(d));

    legendCircles.enter()
        .append("circle")
        .attr("class", "size-legend")
        .merge(legendCircles)
        .attr("r", function (d) {
            return vis.radiusScale(d);
        })
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("cx", 50)
        .attr("cy", function (d) {
            return 240 - vis.radiusScale(d);
        });

    sizeLabels.enter()
        .append("text")
        .attr("class", "size-legend")
        .merge(sizeLabels)
        .text(function(d) {
            return Math.round(wordCountMin + d).toString();
        })
        .attr("x", 35)
        .attr("y", function (d, i) {
            return 237 - 2 * legendCirclesRadius[i];
        });

    legendCircles.exit().remove();
    sizeLabels.exit().remove();
};

