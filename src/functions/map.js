//global variables
let svg;
var valueExtent;
var color;
var countries;
var path;
var cityDataGlobal;
var countriesGroup;
let circlesGroup;
var selectedCities = [];
var citiesDataset = [];
var nf = Intl.NumberFormat(); //variable for formatting number using . for separating  thousands

//it inizialize the main and the city selector
$(document).ready(function () {
  main();
  $("#citySelector").on("change", function () {
    let val = $("#citySelector").val();
    $("#citySelector").selectpicker("refresh");
    citiesDataset = cityDataGlobal.filter((c) => val.includes(c.city));
    showcities();
  });
});

//it makes the window responsive
$(window).resize(function () {
  if (svg)
    svg
      .attr("width", $("#map-holder").width())
      .attr("height", $("#map-holder").height());
  initiateZoom();
});

//zoom
function zoomed() {
  t = d3.event.transform;
  countriesGroup.attr(
    "transform",
    "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
  );
}

var zoom = d3.zoom().on("zoom", zoomed);

function getTextBox(selection) {
  selection.each(function (d) {
    d.bbox = this.getBBox();
  });
}

function initiateZoom() {
  minZoom = Math.max(
    $("#map-holder").width() / w,
    $("#map-holder").height() / h
  );
  maxZoom = 20 * minZoom;
  zoom.scaleExtent([minZoom, maxZoom]).translateExtent([
    [0, 0],
    [w, h],
  ]);
  midX = ($("#map-holder").width() - minZoom * w) / 2;
  midY = ($("#map-holder").height() - minZoom * h) / 2;
  svg.call(
    zoom.transform,
    d3.zoomIdentity.translate(midX, midY).scale(minZoom)
  );
}

function boxZoom(box, centroid, paddingPerc) {
  minXY = box[0];
  maxXY = box[1];
  zoomWidth = Math.abs(minXY[0] - maxXY[0]);
  zoomHeight = Math.abs(minXY[1] - maxXY[1]);
  zoomMidX = centroid[0];
  zoomMidY = centroid[1];
  zoomWidth = zoomWidth * (1 + paddingPerc / 100);
  zoomHeight = zoomHeight * (1 + paddingPerc / 100);
  maxXscale = $("svg").width() / zoomWidth;
  maxYscale = $("svg").height() / zoomHeight;
  zoomScale = Math.min(maxXscale, maxYscale);
  zoomScale = Math.min(zoomScale, maxZoom);
  zoomScale = Math.max(zoomScale, minZoom);
  offsetX = zoomScale * zoomMidX;
  offsetY = zoomScale * zoomMidY;
  dleft = Math.min(0, $("svg").width() / 2 - offsetX);
  dtop = Math.min(0, $("svg").height() / 2 - offsetY);
  dleft = Math.max($("svg").width() - w * zoomScale, dleft);
  dtop = Math.max($("svg").height() - h * zoomScale, dtop);
  svg
    .transition()
    .duration(500)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
    );
}

function main() {
  w = 3000;
  h = 1250;

  var minZoom;
  var maxZoom;

  d3.queue()
    .defer(
      d3.json,
      "https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json"
    ) // World shape
    .defer(d3.csv, "../datasets/csv/choropleth.csv") // Density to color the map
    .defer(d3.csv, "../datasets/csv/citymap.csv") // Position of circles
    .await(ready);

  function ready(error, dataGeo, data, cityData) {
    if (error) throw error;

    for (var i = 0; i < data.length; i++) {
      //Grab state name
      var dataState = data[i].nationality;
      //Grab data value, and convert from string to float
      var dataValue = parseFloat(data[i].victims);
      //Find the corresponding state inside the GeoJSON
      for (var j = 0; j < dataGeo.features.length; j++) {
        var jsonState = dataGeo.features[j].properties.name;
        if (dataState == jsonState) {
          //Copy the data value into the JSON
          dataGeo.features[j].properties.value = dataValue;
          //Stop looking through the JSON
          break;
        }
      }
    }
    valueExtent = d3.extent(data, function (d) {
      return +d.victims;
    });

    cityDataGlobal = cityData;

    color = d3
      .scaleSequential()
      .interpolator(d3.interpolateRgb("#D88484", "#951717"))
      .domain(valueExtent);

    var projection = d3
      .geoEquirectangular()
      .center([0, 15])
      .scale([w / (2 * Math.PI)])
      .translate([w / 2, h / 2]);

    path = d3.geoPath().projection(projection);

    svg = d3
      .select("#map-holder")
      .append("svg")
      .attr("width", $("#map-holder").width())
      .attr("height", $("#map-holder").height())
      .call(zoom);

    circlesGroup = svg.append("g").attr("id", "circles");

    countriesGroup = svg.append("g").attr("id", "map");
    countriesGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w)
      .attr("height", h);

    // draw a path for each feature/country
    countries = countriesGroup
      .selectAll("path")
      .data(dataGeo.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (d, i) {
        return "country" + d.properties.iso_a3;
      })
      .attr("class", "country")
      .style("cursor", "pointer")
      .style("stroke-width", 0.3)
      .style("stroke", "var(--bg-color)")
      .style("fill", function (d) {
        //Get data value
        var value = d.properties.value;
        if (value) return color(value);
      })
      .on("mouseover", function (d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style(
          "display",
          "block"
        );
      })
      .on("mouseout", function (d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style(
          "display",
          "none"
        );
      })
      // add an onclick action to zoom into clicked country
      .on("click", function (d, i) {
        d3.selectAll(".country").classed("country-on", false);
        d3.select(this).classed("country-on", true);
        boxZoom(path.bounds(d), path.centroid(d), 20);
      });

    var size = d3
      .scaleSqrt()
      .domain(valueExtent) // What's in the data
      .range([1, 100]); // Size in pixel

    // Add a label group to each feature/country. This will contain the country name and a background rectangle
    // Use CSS to have class "countryLabel" initially hidden
    var countryLabels = countriesGroup
      .selectAll("g")
      .data(dataGeo.features)
      .enter()
      .append("g")
      .attr("class", "countryLabel")
      .attr("id", function (d) {
        return "countryLabel" + d.properties.iso_a3;
      })
      .attr("transform", function (d) {
        return (
          "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
        );
      })
      // add mouseover functionality to the label
      .on("mouseover", function (d, i) {
        d3.select(this).style("display", "block");
      })
      .on("mouseout", function (d, i) {
        d3.select(this).style("display", "none");
      })
      // add an onlcick action to zoom into clicked country
      .on("click", function (d, i) {
        d3.selectAll(".country").classed("country-on", false);
        d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
        boxZoom(path.bounds(d), path.centroid(d), 20);
      });
    // add the text to the label group showing country name
    countryLabels
      .append("text")
      .attr("class", "countryName")
      .style("text-anchor", "middle")
      .attr("dx", 0)
      .attr("dy", 5)
      .html(function (d) {
        var Deathsvalue = d.properties.value ? d.properties.value : "";
        if (Deathsvalue == "") return "\n Country : " + d.properties.name;
        else {
          var t = " Deaths: " + nf.format(Deathsvalue);
          var temp = "<tspan x=" + 0 + " dy=" + 20 + ">" + t + "</tspan>";
          return "\n Country : " + d.properties.name + temp;
        }
      })
      .call(getTextBox);
    // add a background rectangle the same size as the text
    countryLabels
      .insert("rect", "text")
      .attr("class", "countryLabelBg")
      .attr("transform", function (d) {
        return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
      })
      .attr("width", function (d) {
        return d.bbox.width + 10;
      })
      .attr("height", function (d) {
        return d.bbox.height;
      });
    initiateZoom();
  }
}

function showChoroplet() {
  if (
    document.getElementById("ChoroplethButton").checked &&
    countries != undefined
  )
    countries
      .transition()
      .duration(1000)
      .style("fill", function (d) {
        //Get data value
        var value = d.properties.value;
        if (value) return color(value);
      });
  if (
    !document.getElementById("ChoroplethButton").checked &&
    countries != undefined
  ) {
    //If value is undefined…
    // draw a path for each feature/country
    countries.transition().duration(1000).style("fill", "#d0d0d0");
  }
}

function showcities() {
  var projection = d3
    .geoEquirectangular()
    .center([0, 15])
    .scale([w / (2 * Math.PI)])
    .translate([w / 2, h / 2]);

  var size = d3
    .scaleSqrt()
    .domain(valueExtent) // What's in the data
    .range([1, 100]); // Size in pixel

  var cityLabels = countriesGroup
    .selectAll("circle")
    .data(citiesDataset, (d) => d.city)
    .enter()
    .append("g")
    .attr("class", "countryLabel")
    .attr("id", function (d) {
      return "cityLabel" + d.city;
    })
    .attr("transform", function (d) {
      return (
        "translate(" +
        projection([+d.long, +d.lat])[0] +
        "," +
        projection([+d.long, +d.lat])[1] +
        ")"
      );
    });

  cityLabels
    .append("text")
    .attr("class", "countryName")
    .style("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 5)
    .html(function (d) {
      var t = " Deaths: " + nf.format(d.deaths);
      var temp = "<tspan x=" + 0 + " dy=" + 20 + ">" + t + "</tspan>";
      return "\n City : " + d.city + temp;
    })
    .call(getTextBox);

  cityLabels
    .insert("rect", "text")
    .attr("class", "countryLabelBg")
    .attr("transform", function (d) {
      return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    })
    .attr("width", function (d) {
      return d.bbox.width + 10;
    })
    .attr("height", function (d) {
      return d.bbox.height;
    });

  var x = countriesGroup.selectAll("circle").data(citiesDataset, (d) => d.city);

  x.enter()
    .append("circle")
    .attr("cx", (d) => projection([+d.long, +d.lat])[0])
    .attr("cy", function (d) {
      return projection([+d.long, +d.lat])[1];
    })
    .attr("r", function (d) {
      return size(+d.deaths);
    })
    .style("fill", "black")
    .attr("stroke", "none")
    .attr("fill-opacity", 1)
    .on("mouseover", function (d, i) {
      //highlight the item
      d3.select(this)
        .attr("fill-opacity", 0.5)
        .transition()
        .duration(200)
        .delay(0);

      d3.select("#cityLabel" + d.city).style("display", "block");
    })
    .on("mouseout", function (d, i) {
      d3.select(this)
        .attr("fill-opacity", 1)
        .transition()
        .duration(200)
        .delay(0);
      d3.select("#cityLabel" + d.city).style("display", "none");
    });

  x.exit().remove();
}
