//Global variables
var svgGlobal;
var datasetDefault;

var keys;
var groups;
var offset = 5;

var xScale;
var yAbsolute;
var y1Scale;
var colorScale;

var svgGlobal;
var rectGlobal;
var gGlobal;

var range = [100, 1000, 50000, 500000, 1000000, 1000000, 20000000]

var formatPercent = d3.format(".0%")
var formatNumber = d3.format("");
var colors = ['#ff7f50', '#6495ed']
var dataCSV;



function createBarchart(data) {

    // createBarchart(datasetDefault);

    // d3.selectAll("labelChart").on("change", changeChart);
    // d3.selectAll("labelOrder").on("change", changeOrder);

    margin = { top: 40, right: 20, bottom: 5, left: 120 },
        width = 800,
        height = 750;
    outerWidth = width + margin.left + margin.right;
    outerHeight = height + margin.bottom + margin.top;
    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom;

    var groups = data.columns.slice(1, 3)


    xScale = d3.scaleSqrt()
        .rangeRound([0, innerWidth])

    var xGroupMax = d3.max(data, function (d) {
        if (d.civilian > d.army)
            return d.civilian;
        else return d.army;
    });

    xScale.domain([0, xGroupMax])

    yAbsolute = d3.scaleBand()
        .domain(data.map(function (d) { return d.nationality }))
        .rangeRound([0, innerHeight])
        .padding(0.1)
        .paddingInner(0.05)
        .align(0.2);


    y1Scale = d3.scaleBand()
        .domain(groups)
        .rangeRound([yAbsolute.bandwidth(), 0])
        .padding(0.02)



    colorScale = d3.scaleOrdinal()
        .domain(groups)
        .range(colors);


    xAxis = d3.axisBottom(xScale)
        .ticks(12)
        .tickFormat(x =>
            x == 0 ? x : x / 1000000 + "M")

    yAxis = d3.axisLeft(yAbsolute)

    var svg = d3.select("#barchart")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append('g')
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ')')

    svgGlobal = svg;

    d3.csv("../datasets/csv/army-citizien.csv").then(
        function (data) {
            data.forEach(function (d) {
                d.nationality = d.nationality;
                d.civilian = +d.civilian;
                d.army = +d.army;
                d.total = +d.total;
                d.civilianP = +d.cvilianP;
                d.armyP = +d.armyP;
            });

            dataCSV = data;

            //select 10 meaningful country in the dataset as default data when the page is loaded
            datasetDefault = dataCSV.filter
                (d => d.nationality == "France"
                    || d.nationality == "Italy"
                    || d.nationality == "Poland"
                    || d.nationality == "United States"
                    || d.nationality == "United Kindom"
                    || d.nationality == "Soviet Union"
                    || d.nationality == "Japan"
                    || d.nationality == "China"
                    || d.nationality == "Germany"
                    || d.nationality == "Dutch East Indies");


            var g = svg.append("g")
                .selectAll("g")
                .data(data)
                .join('g')
                .attr("transform", d => "translate(0," + yAbsolute(d.nationality) + ")")
            // var g = svg.append("g")
            //     .selectAll("g")
            //     .data(stacked(data))
            //     .enter().append("g")
            //     .attr("fill", function (d) { return colorScale(d.key); })

            gGlobal = g;
            svg.append("g")
                .call(yAxis)

            svg.append("g")
                .attr("transform", "translate(0," + innerHeight + ")")
                .style("font-size", "10px")
                .call((xAxis));


            var rect = g.selectAll("rect")
                .data(d => groups.map(group => ({ group, value: d[group] })))
                .join("rect")

                .attr("y", (d, i) => y1Scale(d.group))
                .attr("height", (y1Scale.bandwidth()))

                .attr("x", d => xScale(0))
                // var range=[100,1000,50000,500000,1000000,1000000,20000000]

                .attr("width", function (d) {
                    return xScale(d.value) - xScale(0);
                })
                .attr("fill", (d, i) => colorScale(i));


            // var rect = g.selectAll("rect")
            //     .data(function (d) { return d; })
            //     .enter().append("rect")
            //     .attr("y", function (d) { return yAbsolute(d.dataationality); })
            //     .attr("xScale", function (d) { return xScale(d[0]) })
            //     .attr("width", function (d) { return xScale(d[1]) - xScale(d[0]); })
            //     .attr("height", yAbsolute.bandwidth())



            rectGlobal = rect;
        });
}


function transitionGrouped(data) {

    xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickPadding(0.2);



    svgGlobal.append("g")
        .selectAll("g")
        .transition()
        .duration(400)
        .data(data)
        .join('g')
        .attr("transform", d => "translate(0," + yAbsolute(d.nationality) + ")")


    rectGlobal
        .data(d => groups.map(group => ({ group, value: d[group] })))
        .join("rect")
        .transiton()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", (d, i) => y1Scale(d.group))
        .attr("height", (y1Scale.bandwidth()))
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("xScale", d => xScale(0))
        .attr("width", function (d) {
            if (d.value < 10000)
                return xScale(d.value) * 500 - xScale(0);
            else
                return xScale(d.value) - xScale(0)
        })
        .attr("fill", (d, i) => colorScale(i));

    svgGlobal.selectAll("x-axis")
        .tranisiton()
        .delay(500)
        .duration(500)
        .call((xAxis).tickFormat(formatNumber));

}


function transitionStacked(data) {
    var keys = data.columns.slice(3, 5)


    var stacked = d3.stack().keys(keys)

    xScale = d3.scaleLinear()
        .domain([0, 100])
        .rangeRound([0, innerWidth])



    svgGlobal.append('g')
        .selectAll("g")
        .tranisiton()
        .duration(500)
        .data(stacked(data))
        .enter().append("g")
        .attr("fill", function (d) { return colorScale(d.key); })



    rectGlobal.transition()
        .duration(500)
        .delay(function (d, i) { return i * 10; })
        .attr("xScale", function (d) { return xScale(d[1]); })
        .attr("width", function (d) { return xScale(d[0]) - xScale(d[1]); })
        .transition()
        .duration(500)
        .attr("y", function (d, i) { return yAbsolute(i); })
        .attr("height", yAbsolute.bandwidth());


    svg.selectAll(".xScale.axis")
        .transition()
        .delay(500)
        .duration(500)
        .call((xAxis).tickFormat(formatPercent))
}

function transitionCvilian(data) {

    data.sort(function (a, b) { return d3.descending(a.civilian, b.civilian); });
}
function transitionMilitary(data) {

    data.sort(function (a, b) { return d3.descending(a.army, b.army); });
}

function changeChart(val) {
    var bar = document.getElementById("grouped")
    mainBarchart()
    if (bar.checked == true) {

        transitionGrouped(dataFile)
    }
    else {
        transitionStacked(dataFile)
    }
    // if (bar == "grouped") transitionGrouped(data);
    // else if (bar == "stacked") transitionStacked(data);
}



function changeOrder(val) {
    var orderBy = document.getElementById(val)
    if (orderBy == "civilian") transitionCvilian(data)
    else if (orderBy == "military") transitionMilitary(data)

}