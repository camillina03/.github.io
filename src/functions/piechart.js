function pieVis() {
  var nf = Intl.NumberFormat(); //variable for formatting number using . for separating  thousands

  var margin = { top: 10, right: 5, bottom: 100, left: 5 },
    width = 300,
    height = 600;
  innerWidth = width;
  innerHeight = height - margin.top - margin.bottom;
  // find the min of width and height and devided by 2
  radius = Math.min(width, height) / 2;

  var outerRadius = innerWidth / 2.6;
  var innerRadius = innerWidth / 3.6;

  // legend dimensions
  var legendCircleSize = 5;
  var legendSpacing = 15;
  var legendWidth = 200;
  var legendHeight = 200;
  var legendColumnWidth = legendWidth / 2;

  var svg = d3
    .select("#pie")
    .append("svg")
    .attr("width", width)
    .attr("height", height - 120 + margin.top + margin.bottom)
    .append("g");

  var color = d3.scaleOrdinal([
    "#ff24f8",
    "#8080e0",
    "#b624ff",
    "#b87ba4",
    "#a47bb8",
    "#6c1491",
    "#149172",
    "#30d190",
    "#30d135",
    "#d4f7a6",
    "#b6f73e",
    "#f4f739",
    "#cc8a21",
    "#f57e1d",
    "#f3a505",
    "#ae1717",
    "#3ce8fa",
    "#0000ff",
    "#0088ff",
    "#ff249c",
  ]);

  //
  var pie = d3
    .pie()
    .value(function (d) {
      return d.Deaths;
    })
    .sort(null);

  var path = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);

  var hoverArc = d3
    .arc()
    .outerRadius(outerRadius * 1.2)
    .innerRadius(innerRadius * 1.08);

  d3.csv("../datasets/csv/holocaust.csv").then(function (data) {
    data.forEach(function (d) {
      d.Deaths = +d.Deaths;
      d.Percentage = +d.Percentage;
      d.nationality = d.Nationality;
      d.enabled = true;
    });

    // create a tooltip
    var tooltip = d3.select("#pie").append("div").attr("class", "tooltipPie");

    var chart = svg
      .selectAll("arc")
      .data(pie(data))
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", path)
            .attr("transform", "translate(" + width / 2 + "," + 200 + ")")
            .style("fill", function (d) {
              return color(d.data.Nationality);
            })
            .style("stroke", "#ffffff")
            .style("stroke-width", "1")
            .attr("opacity", 1),

        (exit) => exit.remove()
      );

    chart.on("mouseover", function (d) {
      tooltip.style("visibility", "visible");

      d3.select(this).attr("d", hoverArc).attr("opacity", 1);
    });

    chart.on("mousemove", function (d) {
      tooltip.html(
        "<br>Holocaust victimns<br>" +
        d3.select(this).datum().data.Nationality.toUpperCase() +
        "<br> " +
        d3.select(this).datum().data.Percentage +
        "%" +
        "<br>" +
        nf.format(d3.select(this).datum().data.Deaths)
      );
    });

    chart.on("mouseout", function (d) {
      tooltip.style("visibility", "hidden");

      d3.select(this)
        .attr("d", path)
        .attr("opacity", 1)
        .style("stroke", "#ffffff")
        .style("stroke-width", "1");
    });

    // Define legend
    var legend = svg
      .selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        "translate(" + width / 2 + "," + (height + margin.bottom - 20) + ")"
      );

    var colorCircle = legend
      .append("circle")
      .attr("cx", function (d, i) {
        return (i % 3) * legendColumnWidth - 128;
      })
      .attr("cy", function (d, i) {
        return (
          Math.floor(i / 3) * (legendSpacing * 1.7) + legendCircleSize / 2 - 274
        );
      })
      .attr("r", legendCircleSize)
      .style("fill", color);

    legend
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("transform", function (d, i) {
        var x = (i % 3) * legendColumnWidth + legendCircleSize * 2 - 125;
        var y =
          Math.floor(i / 3) * (legendSpacing * 1.7) +
          legendCircleSize / 2 -
          270;
        return "translate(" + x + "," + y + ")";
      })
      .text(function (d) {
        return d.nationality;
      })
      .attr("text-anchor", "start")
      .attr("font-family", "Roboto,sans-serif")
      .attr("font-size", "14px")

      .on("mouseover", function (d) {
        //Show info about that slice
        tooltip.style("visibility", "visible");

        //highlight the item on the legend
        d3.select(this)
          .attr("opacity", 0.2)
          .attr("backgound", "white")
          .html(d3.select(this).datum().Nationality);

        var selectedCountry = d3.select(this).datum().Nationality;

        //zoom item on the pie
        d3.select(
          svg
            .selectAll("path")
            .filter(function (x) {
              return x.data.Nationality == selectedCountry;
            })

            .attr("d", hoverArc)
            .attr("opacity", 1)
        );

        //make bigger the circle in the legend
        d3.select(
          colorCircle
            .filter(function (c) {
              return c == selectedCountry;
            })

            .attr("r", 10)
        );
      })
      .on("mousemove", function (d) {
        tooltip.html(
          "<br> Holocaust victimns:<br>" +
          d3.select(this).datum().Nationality.toUpperCase() +
          "<br>" +
          d3.select(this).datum().Percentage +
          "%" +
          "<br>" +
          nf.format(d3.select(this).datum().Deaths)
        );
      })
      .on("mouseout", function (d) {
        tooltip.style("visibility", "hidden");
        //remove highlight the item on the legend
        d3.select(this)
          .html(d3.select(this).datum().Nationality)

          .attr("opacity", "1");

        var selectedCountry = d3.select(this).datum().Nationality;

        //remove highlight the item on the pie
        d3.select(
          svg
            .selectAll("path")
            .filter(function (x) {
              return x.data.Nationality == selectedCountry;
            })
            .attr("d", path)
            .attr("opacity", "1")
        );

        //return little the circle in the legend
        d3.select(
          colorCircle
            .filter(function (c) {
              return c == selectedCountry;
            })
            .attr("r", 6)
        );
      });
  });
}
