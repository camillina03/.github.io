//Global variables
var svgGlobalStacked;
var datasetFromCsvStacked;
var datasetDefaultStaked;
var nf = Intl.NumberFormat(); //variable for formatting number using . for separating  thousands

chosenBarchart = "stacked";

function mouseover(d) {
  d3.select(this).style("stroke", "black").style("opacity", 0.6);
}
function mouseleave(d) {
  d3.select(this).style("stroke", "none").style("opacity", 1);
}

var chosenStackedCountries = [
  "France",
  "Italy",
  "Poland",
  "USA",
  "United Kingdom",
  "Soviet Union",
  "Japan",
  "China",
  "Germany",
  "Dutch East Indies",
];

$(document).ready(function () {
  $("#selectorStackedsbarchart").selectpicker("val", [
    ...chosenStackedCountries,
  ]);

  $("#saveButtonForMultiselectionstacked").click(function () {
    var chosenStackedCountries = $("#selectorStackedsbarchart").val();
    if (ValidateInput(chosenStackedCountries)) {
      $("#warningParagraphstacked").text("Please select at least 5 countries");
      $("#warningParagraphstacked").css("color", "gainsboro");
      $(".btn-light").css("border", "transparent");

      datasetDefaultStaked = datasetFromCsvStacked.filter((d) =>
        chosenStackedCountries.includes(d.nationality)
      );
      Update(
        $("#selectStackedGroupedButton").val(),
        $("#OrderByButtonStacked").val()
      );
    } else {
      $("#warningParagraphstacked").text(
        "Wrong number of country chosen! Please select at least 5 countries"
      );
      $("#warningParagraphstacked").css("color", "red");
      $(".btn-light").css("border", "1.5px solid red");
    }
  });

  $("#selectStackedGroupedButton").on("change", function () {
    Update(
      $("#selectStackedGroupedButton").val(),
      $("#OrderByButtonStacked").val()
    );
  });

  $("#OrderByButtonStacked").on("change", function () {
    Update(
      $("#selectStackedGroupedButton").val(),
      $("#OrderByButtonStacked").val()
    );
  });
});

function CreateStackedBarchartDefault() {
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 70, bottom: 20, left: 160 };

  // append the svg object to the body of the page
  svgGlobalStacked = d3
    .select("#stacked-container")
    .append("svg")
    .attr("width", $("#stacked-container").width() - 80)
    .attr("height", 600)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.bottom + ")");

  $(window).resize(function () {
    if (svgGlobalStacked)
      svgGlobalStacked
        .attr("width", $("#stacked-container").width())
        .attr("height", 600);
  });

  //read the data from the csv and save it in the dedicated global variable datasetFromCsv
  d3.csv("../datasets/csv/army-citizien.csv").then(function (data) {
    data.forEach(function (d) {
      d.nationality = d.nationality;
      d.civilian = +d.civilian;
      d.army = +d.army;
      d.total = +d.total;
    });

    datasetFromCsvStacked = data;

    //default sorting is  descending by deaths number

    datasetFromCsvStacked.sort(function (a, b) {
      return a.total - b.total;
    });

    //select 10 meaningful country in the dataset as default data when the page is loaded
    datasetDefaultStaked = datasetFromCsvStacked.filter(
      (d) =>
        d.nationality == "France" ||
        d.nationality == "Italy" ||
        d.nationality == "Poland" ||
        d.nationality == "USA" ||
        d.nationality == "United Kingdom" ||
        d.nationality == "Soviet Union" ||
        d.nationality == "Japan" ||
        d.nationality == "China" ||
        d.nationality == "Germany" ||
        d.nationality == "Dutch East Indies"
    );

    svgGlobalStacked.append("g").attr("id", "barsgroup");
    svgGlobalStacked.append("g").attr("class", "x axis").attr("id", "xaxis");
    svgGlobalStacked.append("g").attr("class", "y axis").attr("id", "yaxis");

    //update the stacked barchart with the default data
    Update("Stacked", $("#OrderByButtonStacked").val());
  });
}

function Update(chosenB, order) {
  chosenBarchart = chosenB;
  if (chosenB == "Stacked") updateStacked(order);
  else updateGroupedBar(order);
}

function updateStacked(order) {
  var margin = { top: 20, right: 70, bottom: 20, left: 160 };

  var innerHeight = 600 - margin.top - margin.bottom;
  var innerWidth =
    $("#stacked-container").width() - 80 - margin.left - margin.right;

  var keys = ["army", "civilian"];
  max_value = d3.max(datasetDefaultStaked, function (d) {
    if (d.civilian > d.army) return d.civilian;
    else return d.army;
  });

  // scales and axis and labels on axis
  var xScale = d3.scaleLinear().domain([0, max_value]).range([0, innerWidth]);

  // sort based on the  related button
  if (order == "Descending") {
    datasetDefaultStaked.sort(function (a, b) {
      return b.total - a.total;
    });
  } else {
    datasetDefaultStaked.sort(function (a, b) {
      return a.total - b.total;
    });
  }

  y0Scale = d3
    .scaleBand()
    .domain(
      datasetDefaultStaked.map(function (d) {
        return d.nationality;
      })
    )
    .range([0, innerHeight])
    .padding(0.2);

  y1Scale = d3
    .scaleBand()
    .domain(keys)
    .range([y0Scale.bandwidth(), 0])
    .padding(0.18);

  colorScale = d3.scaleLinear().range(["#d88484", "rgb(170, 42, 42)"]);

  svgGlobalStacked
    .select("#xaxis")
    .attr("transform", "translate(0," + innerHeight + ")")

    .call(d3.axisBottom(xScale));

  svgGlobalStacked.select("#yaxis").call(d3.axisLeft(y0Scale));

  svgGlobalStacked
    .select("#barsgroup")
    .selectAll("g")
    .data(datasetDefaultStaked)
    .join("g")
    .attr("transform", (d) => "translate(0," + y0Scale(d.nationality) + ")")
    .selectAll("rect")
    .data((d) => keys.map((key) => ({ key, value: d[key] })))
    .join("rect")
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)
    .attr("x", (d) => xScale(0))
    .attr("y", (d) => y1Scale(d.key))
    .attr("height", y1Scale.bandwidth())
    .attr("width", function (d) {
      return xScale(d.value) - xScale(0);
    })
    .attr("fill", (d, i) => colorScale(i))
    .append("title")
    .text((d) => d.value);
}

function updateGroupedBar(order) {
  var margin = { top: 20, right: 70, bottom: 20, left: 160 };

  var innerHeight = 600 - margin.top - margin.bottom;
  var innerWidth =
    $("#stacked-container").width() - 80 - margin.left - margin.right;

  var keysGrouped = ["civilian", "army"];

  //Generates x and y axis with range and domain and a colorScale for grouped  values

  max_value = d3.max(datasetDefaultStaked, function (d) {
    return d.civilian + d.army;
  });
  var xscale = d3.scaleLinear().domain([0, max_value]).range([0, innerWidth]);

  yscale = d3
    .scaleBand()
    .domain(
      datasetDefaultStaked.map(function (d) {
        return d.nationality;
      })
    )
    .range([0, innerHeight])
    .padding(0.2)
    .paddingInner(0.06)
    .align(0.1);

  zscale = d3
    .scaleOrdinal()
    .domain(keysGrouped)
    .range(["#d88484", "rgb(170, 42, 42)"]);

  //grouped d3 function
  var grouped = d3.stack().keys(keysGrouped);

  // sort based on the  related button
  if (order == "Descending") {
    datasetDefaultStaked.sort(function (a, b) {
      return a.total - b.total;
    });
  } else {
    datasetDefaultStaked.sort(function (a, b) {
      return b.total - a.total;
    });
  }

  svgGlobalStacked
    .select("#xaxis")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(d3.axisBottom(xscale));

  svgGlobalStacked.select("#yaxis").call(d3.axisLeft(yscale));

  //Draw grouped  bars for each name and value in data
  svgGlobalStacked
    .select("#barsgroup")
    .selectAll("g")
    .data(datasetDefaultStaked, (d) => d.nationality)
    .join("g")
    .attr("transform", (d) => "translate(0," + yscale(d.nationality) + ")")
    .selectAll("rect")
    .data((d) =>
      ["army", "civilian"].map((key) => ({
        key,
        value: d[key],
        nationality: d.nationality,
      }))
    )
    .join("rect")
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)
    .attr("x", (d) =>
      d.key === "army"
        ? 0
        : xscale(
            datasetDefaultStaked.find((x) => x.nationality === d.nationality)
              .army
          )
    )
    .attr("y", (d) => yscale(d.key))
    .attr("height", yscale.bandwidth())
    .attr("width", function (d) {
      return xscale(d.value) - xscale(0);
    })
    .attr("fill", (d, i) => colorScale(i))
    .append("title")
    .text((d) => d.value);
}
