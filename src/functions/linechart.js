function line() {

    var margin = { top: 10, right: 30, bottom: 30, left: 90 },
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    outerWidth = width + margin.left + margin.right;
    outerHeight = height + margin.bottom + margin.top;
    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom;


    // append the svg object to the body of the page
    var svg = d3.select("#mychart")
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      

    var parseDate = d3.timeParse("%Y");

    d3.csv("../datasets/csv/linechart.csv", function (d, i) {

        return {
            date: parseDate(d.years),
            UK: +d['United Kingdom'],
            USA: +d['United States'],
            CH: +d['China'],
            SOVIET: +d['Soviet Union'],
            IT: +d['Italy'],
            JP: +d['Japan'],
            GE: +d['Germany']
        };
    }).then(
        function (data) {

            // sort data ascending - needed to get correct bisector results
            // data.sort(function(a,b) {
            //     return a.date - b.date;
            // });

            max_y_value = Math.max(data, d3.max(d => d.UK), d3.max(d => d.USA), d3.max(d => d.SOVIET), d3.max(d => d.IT), d3.max(d => d.JP), d3.max(d => d.CH), d3.max(d => d.GE))
            min_y_value = Math.min(data, d3.min(d => d.UK), d3.min(d => d.USA), d3.min(d => d.SOVIET), d3.min(d => d.IT), d3.min(d => d.JP), d3.min(d => d.CH), d3.min(d => d.GE))

            // var xScale = d3.scaleLinear()
            //     // .domain(d3.extent(data, function (d) { return d.date}))
            //     .domain(d3.max(data, (d)=> d.date))
            //     .range([0, innerWidth])

            /* Scale */
            var xScale = d3.scaleTime()
                .domain(d3.extent(data[0].values, d => d.date))
                .range([0, width - margin]);

            yScale = d3.scaleLinear()
                .domain([min_y_value, max_y_value])
                .range([0, innerHeight])

            colorScale = d3.scaleOrdinal()
                .domain(d3.keys(data.years).filter(function (key) { return key !== "date"; }))
                .range("#ff00ff", "	#00ff00", "#000080", "#ff0000", "#800080", "#008080", "#ffff00");




            svg.call(d3.axisBottom(xScale))

            /* Add line into SVG */
var line = d3.line()
.x(d => xScale(d.date))
.y(d => yScale(d.price));
?????????
let lines = svg.append('g')
.attr('class', 'lines');

            svg.append("g")
                .call(d3.axisLeft(yScale).ticks(10))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -60)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("# Deaths");


            svg.append('path')
                .selectAll('path')
                .data(data)
                .join('path')
                .attr('class', 'stock-lines')
                .attr('d', d3.line())
                .interpolate("basis")
                .x(function (d) { return xScale(d.date); })
                .y(function (d, i) { return yScale(d[i].key); })
                .style('stroke', (d, i) => colorScale(d[i].key))
                .style('stroke-width', 2)
                .style('fill', 'none');

        }
    )
}