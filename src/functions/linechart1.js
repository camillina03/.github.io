function AlliesAxis() {
  var margin = { top: 10, right: 30, bottom: 30, left: 90 },
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
  outerWidth = width + margin.left + margin.right;
  outerHeight = height + margin.bottom + margin.top;
  innerWidth = width - margin.left - margin.right;
  innerHeight = height - margin.top - margin.bottom;

  Uk = [] //United Kingdom
  Usa = [] //United State
  Ch = [] //China
  Soviet = [] //Soviet Union
  It = [] //Italy
  Jp = [] //Japan
  Ger = [] //Germany



  // append the svg object to the body of the page
  var svg = d3.select("#line")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  d3.csv("../datasets/csv/linechart.csv",

    function (d) {
      for (i = 0; i < d.length; i++) {
        if (d[i].state == "United States") {
          US = d[i].deaths;
        } else if (d[i].state == "United Kingdom") {
          UK = d[i].deaths;
        } else if (d[i].state == "China") {
          CH = d[i].deaths
        } else if (d[i].state == "Italy") {
          IT = d[i].deaths
        } else if (d[i].state == "Japan") {
          JP = d[i].deaths
        } else if (d[i].state == "Soviet Union") {
          SU = d[i].deaths
        } else if (d[i].state == "Germany") {
          GE = d[i].deaths
        }
      }
      return {
        date: d3.timeParse("%d/%m/%Y")(d.date),
        USA: +US,
        UK: +UK,
        CH: +CH,
        SOVIET: +SU,
        IT: +IT,
        JP: +JP,
        GER: +GE
      };
    }).then(

      function (data) {

        // data.forEach(function(d){
        //     d.deaths= +d.deaths;
        // })


        max_value = d3.max(data, function (d) {
          return USdeath
        });


        var x = d3.scaleTime()
          .domain(d3.extent(data, function (d) { return d.date }))
          .range([0, innerWidth]);

        var y = d3.scaleLinear()
          .domain([max_value, 0])
          .rangeRound([0, innerHeight])


        svg.append("g")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(d3.axisBottom(x).ticks(10));

        svg.append('g')
          .call(d3.axisLeft(y).ticks(10))


        svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1)
          .attr("d", d3.line()
            .x(function (d) { return x(d.date) })
            .y(function (d) { return y(d.deaths) })
          )
      }
    )
}