
/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */


BarChart2016 = function(_parentElement, _data, _casticonchart, _crewiconchart){
    this.parentElement = _parentElement;
    this.data = _data;
    this.casticonchart = _casticonchart;
    this.crewiconchart = _crewiconchart;

    this.initVis();
}

BarChart2016.prototype.initVis = function() {
    var vis = this;

    this.data.sort(function(a, b) {
       return a.boxOffice - b.boxOffice;
    });

    vis.margin = {top: 25, right: 25, bottom: 50, left: 90},
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
    var y = d3.scaleBand()
        .range([vis.height, 0])
        .padding(0.1);

    var x = d3.scaleLinear()
        .range([0, vis.width]);

    x.domain([0, d3.max(vis.data, function (d) { return d.boxOffice })]);
    y.domain(vis.data.map(function(d) { return d.title.substring(0, 15); }));

    vis.svg.selectAll(".bar")
        .data(vis.data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("width", function(d, i) {return x(d.boxOffice); } )
        .attr("y", function(d) { return y(d.title.substring(0, 15)); })
        .attr("height", y.bandwidth())
        .attr("fill", function (d) {
            return !d.bechdel ? "#d32727" : "#74b9ff";
        })
        .on("click", function (d) {
            document.getElementById("top-10-movie-title").innerHTML = "#" + d['rank'] + " " + d['title'];
            document.getElementById("top-10-movie-revenue").innerHTML = "Box Office Revenue: $" + d['boxOffice'] + "000000";
            document.getElementById("top-10-movie-bechdel").innerHTML = d['analysis'];
            document.getElementById("top-10-movie-video").innerHTML = d['clips'];
                vis.casticonchart.data = d['castData'];
            vis.casticonchart.wrangleData();
            vis.crewiconchart.data = d['crewData'];
            vis.crewiconchart.wrangleData();
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
        });;

    // add the x Axis
    vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(x));

    vis.svg.append("text")
        .attr("class", "x-axis")
        .attr("transform",  "translate(0," + vis.height + ")")
        .attr("y", 35)
        .attr("x", vis.width / 4)
        .text("Box Office Revenue (Millions)");


    // add the y Axis
    vis.svg.append("g")
        .call(d3.axisLeft(y));

};

