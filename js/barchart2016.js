
/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */


BarChart2016 = function(_parentElement, _data, _crewiconchart, _bubblechart){
    this.parentElement = _parentElement;
    this.data = _data;
    this.crewiconchart = _crewiconchart;
    this.bubblechart = _bubblechart;

    this.initVis();
}

BarChart2016.prototype.initVis = function() {
    var vis = this;

    this.data.sort(function(a, b) {
       return a.boxOffice - b.boxOffice;
    });

    vis.margin = {top: 25, right: 25, bottom: 50, left: 110},
        vis.width = 500 - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Make The Legend
    var dataCategories = ["Pass", "Fail"];

    vis.legend = vis.svg.selectAll("rect.legend")
        .data(dataCategories);

    vis.legend.enter().append("rect")
        .attr("class", "legend")
        .attr("width", 15)
        .attr("height", 15)
        .merge(vis.legend)
        .attr("x", function(d, i) {return i * 100})
        .attr("y", -21)
        .attr("fill", function(d){
            if (d === "Pass") {
                return "#74b9ff";
            }
            if (d === "Fail") {
                return "#d32727";
            }
        });

    vis.legend.exit().remove();

    vis.labels = vis.svg.selectAll("text.legend")
        .data(dataCategories);

    vis.labels.enter().append("text")
        .attr("class", "legend")
        .merge(vis.labels)
        .attr("x", function(d, i) {return i * 100 + 20})
        .attr("y", -9)
        .text(function(d) { return d });

    vis.labels.exit().remove();

    // Init the scales
    vis.y = d3.scaleBand()
        .range([vis.height, 0])
        .padding(0.1);

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.x.domain([0, d3.max(vis.data, function (d) { return d.boxOffice })]);
    vis.y.domain(vis.data.map(function(d) {
        var cutoff = d.title.indexOf(':')
        if (cutoff > -1) {
            return d.title.substring(0, cutoff)
        } else if (d.title === "Fantastic Beasts and Where to Find Them") {
            return "Fantastic Beasts"
        }
        return d.title;
    }));

    vis.svg.selectAll(".bar")
        .data(vis.data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("width", function(d) {return vis.x(d.boxOffice); } )
        .attr("y", function(d) {
            var cutoff = d.title.indexOf(':')
            if (cutoff > -1) {
                return vis.y(d.title.substring(0, cutoff));
            } else if (d.title === "Fantastic Beasts and Where to Find Them") {
                return vis.y("Fantastic Beasts");
            }
            return vis.y(d.title);
        })
        .attr("height", vis.y.bandwidth())
        .attr("fill", "#d32727")
        .on("mouseover", function(d) {
            d3.select(this).attr("fill", function() {
                return (d3.select(this).attr("fill") === "#74b9ff") ? "#6097cf": "#b02e11"
            });
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", function() {
                return (d3.select(this).attr("fill") === "#74b9ff" || d3.select(this).attr("fill") === "#6097cf")
                    ? "#74b9ff": "#d32727"
            });
        })
        .on("click", function() {
            d3.select(this).attr("fill", function() {
                return (d3.select(this).attr("fill") === "#74b9ff" || d3.select(this).attr("fill") === "#6097cf")
                    ? "#d32727": "#74b9ff"
            });
        });

    // add the x Axis
    vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(vis.x));

    vis.svg.append("text")
        .attr("class", "x-axis")
        .attr("transform",  "translate(0," + vis.height + ")")
        .attr("y", 35)
        .attr("x", vis.width / 4)
        .text("Box Office Revenue (Millions)");


    // add the y Axis
    vis.svg.append("g")
        .call(d3.axisLeft(vis.y));

};

BarChart2016.prototype.revealBars = function() {
    var vis = this;

    vis.numberCorrect = 0;
    vis.correctMovies = [];
    vis.incorrectMovies = [];

    vis.svg.selectAll(".bar")
        .transition()
        .duration(1800)
        .attr("fill", function(d) {
            var userGuess = d3.select(this).attr("fill")
            if (d.bechdel) {
                var correctFill = "#74b9ff";
            } else {
                var correctFill = "#d32727";
            }
            if (userGuess === correctFill) {
                vis.numberCorrect += 1;
                vis.correctMovies.unshift(d.title);
            } else {
                vis.incorrectMovies.unshift(d.title);
            }
            return correctFill;
        })
        .each(function(d) {
            var width = +d3.select(this).attr("width");
            var yPosition = +d3.select(this).attr("y");
            var userGuess = d3.select(this).attr("fill")
            if (d.bechdel) {
                var correctFill = "#74b9ff";
            } else {
                var correctFill = "#d32727";
            }
            vis.svg.append("text")
                .attr("x", function () {
                    return (width + 10);
                })
                .attr("y", function () {
                    console.log(vis.y.bandwidth() / 2)
                    return (yPosition + vis.y.bandwidth() / 2 + 2);
                })
                .text(function () {
                    return (userGuess === correctFill) ? "\u2714" : "\u2718";
                });
        })
        .on("end", function() {
            checkAnswers();
        });

    vis.svg.selectAll(".bar")
        .on("click", function (d) {
            document.getElementById("q1").style.display='none';
            $("#top-10-detail-area").show();
            document.getElementById("top-10-movie-title").innerHTML = "#" + d['rank'] + " " + d['title'];
            document.getElementById("top-10-movie-revenue").innerHTML = "<b>Box Office Revenue</b>: $" +
                d['boxOffice'].toLocaleString() + "M";
            document.getElementById("top-10-movie-bechdel").innerHTML = d['analysis'];
            document.getElementById("top-10-movie-video").innerHTML = d['clips'];
            document.getElementById("2016-breakdown-title").innerHTML = "A Closer Look into " + d['title'];
            document.getElementById("movie-select-box").value = d['rank'].toString();
            vis.crewiconchart.data = d['crewData'];
            vis.crewiconchart.wrangleData();
            vis.bubblechart.data = d['dialogueData'];
            vis.bubblechart.wrangleData();
        })
        .on("mouseover", function(d) {
            d3.select(this).attr("fill", function () {
                return !d.bechdel ? "#b02e11" : "#6097cf";
            });
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", function () {
                return !d.bechdel ? "#d32727" : "#74b9ff";
            });
        });

}


