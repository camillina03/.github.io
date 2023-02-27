
margin = { top: 40, right: 20, bottom: 5, left: 120 },
    width = 900,
    height = 700;
outerWidth = width + margin.left + margin.right;
outerHeight = height + margin.bottom + margin.top;
innerWidth = width - margin.left - margin.right;
innerHeight = height - margin.top - margin.bottom;

var nLayers = 2;// number of layers
var datiBarchart;
var countries = [];
var formatPercent = d3.format(".0%");
var formatNumber = d3.format("");

var colors = ['#ff7f50', '#6495ed'];
var sortBy = "numeric";
var order = "army";
var numericScale = [];
var percentageScale = [];


function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {

        data.forEach(d => {
            d.nationality = +d.nationality;
            d.civilian = +d.civilian;
            d.army = +d.army;
            d.total = +d.total;
            d.civilianP = + d.cvilianP;
            d.armyP = +d.armyP;
            d.totalP = + d.totalP;


        });
    }



    countries = datiBarchart.nationality; //number of sample

    var keys = datiBarchart.columns.slice(3, 5);
    var groups = datiBarchart.columns.slice(1, 3);

    var stacked = d3.stack().keys(keys)
    var stackedSeries = stacked(datiBarchart);

    var xStackMax = d3.max(stackedSeries, function (layer) { return d3.max(layer, function (d) { return d[1]; }); });

    var xGroupMax = d3.max(stackedSeries, function (set) { return d3.max(set, function (d) { return d[1] - d[0]; }); });




    yAbsolute = d3.scaleBand()
        .domain(datiBarchart.map((d) => d.nationality))
        .rangeRound([0, innerHeight]).padding(0.1);


    colorScaleStacked = d3.scaleOrdinal()
        .domain(keys)
        .range(colors)

    colorScaleGrouped = d3.scaleOrdinal()
        .domain(groups)
        .range(colors)

    xPercentage = d3.scaleLinear()
        .rangeRound([0, innerWidth]);

    xNumerical = d3.scaleLinear()
        .rangeRound([0, innerWidth])

    xAxisS = d3.axisBottom(xPercentage)
        .tick(20)
        .tickPadding(2);

    xAxisG = d3.axisBottom(xNumerical)
        .ticks(5)
        .tickPadding(2);;


    yAxis = d3.axisLeft(yAbsolute)
        .tick(10);

    var svg = d3.select("#stackedGroup")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ')')



    var layer = svg.selectAll(".layer")
        .data(stackedSeries)
        .enter().append("g")
        // .attr("class", "layer")
        .attr("id", function (d) { return d.key; })
        .style("fill", function (d, i) { return colorScaleStacked(i); });


    var rect = layer.selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("y", function (d, i) { return yAbsolute(i); })
        .attr("x", function (d) { return xPercentage(d[0]) })
        .attr("width", 0)
        .attr("height", yAbsolute.bandwidth());

    rect.transition()
        .delay(function (d, i) { return i * 10; })
        .attr("x", function (d) { return xNumerical(d[1]); })
        .attr("width", function (d) { return xNumerical(d[0]) - xNumerical(d[1]); });

    svg.append("g")
        // .attr("class", "y axis")
        .attr("transform", "translate(0," + height + ")")
        .call(yAxis);

    svg.append("g")
        // .attr("class", "x axis")
        .attr("transform", "translate(" + -90 + ",0)")
        .style("font-size", "10px")
        .call(xAxisS);

    d3.selectAll("input").on("change", change);
}

function change() {
    var dataFile = document.getElementById('stackedGroup').value;
    d3.csv('data/' + dataFile + '.csv', update);
    if (this.value === "numericgrouped") transitionGrouped();
    else if (this.value === "percent") transitionPercent();

}

function transitionGrouped() {

    xNumerical.domain([0, xGroupMax])

    rect
        .transiton()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", (d, i) = y(i) + y.bandWidth() / nLayers * d[2])
        .attr("height", y.bandWidth() / nLayers)
        .transition()
        .attr("x", (d) => xScale(d[1] - d[0]))
        .attr("width", (d) => xScale(0) - xScale(d[1] - d[0]));


    xAxis.tickFormat(formatNumber);

    svg.selectAll(".x.axis").transition()
        .delay(500)
        .duration(500)
        .call(xAxis)

}


function transitionStacked() {
    xPercentage.domain([0, xStackMax]);

    rect.transition()
        .duration(500)
        .delay(function (d, i) { return i * 10; })
        .attr("x", function (d) { return xScale(d[1]); })
        .attr("width", function (d) { return yScale(d[0]) - yScale(d[1]); })
        .transition()
        .attr("y", function (d, i) { return yAbsolute(i); })
        .attr("height", yAbsolute.bandwidth());

    xAxis.tickFormat(formatNumber)
    svg.selectAll(".x.axis").transition()
        .delay(500)
        .duration(500)
        .call(xAxis)
}


function transitionPercent() {
    y.domain([0, 1]);

    rect.transition()
        .duration(500)
        .delay(function (d, i) { return i * 10; })
        .attr("x", function (d) { return d.totalP })
        .attr("width", width)
        .transition()
        .attr("y", function (d, i) { return yAbsolute(i); })
        .attr("width", yAbsolute.bandwidth());

    xAxis.tickFormat(formatPercent)

    svg.selectAll(".x.axis").transition()
        .delay(500)
        .duration(500)
        .call(xAxis)

}


