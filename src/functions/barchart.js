//Global variables
var svgGlobal;
var datasetFromCsv;
var datasetDefault;
var nf = Intl.NumberFormat(); //variable for formatting number using . for separating  thousands

function debounce(func) {
  var timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
}

var mouseover = function (d) {
  d3.select(this).style("stroke", "black").style("opacity", 0.6);
};

var mouseleave = function (d) {
  d3.select(this).style("stroke", "none").style("opacity", 1);
};

var initials = [
  "France",
  "Italy",
  "Poland",
  "USA",
  "Soviet Union",
  "Japan",
  "China",
  "Germany",
  "Dutch East Indies",
];

/**
 * jquerys called when a button is clicked
 */
$(document).ready(function () {
  $("#selectorBarchart").selectpicker("val", [...initials]);

  $("#saveButtonForMultiselection").click(function () {
    chosenCountries = $("#selectorBarchart").val();
    if (ValidateInput(chosenCountries)) {
      $("#warningParagraph").text("Please select at least 5 countries");
      $("#warningParagraph").css("color", "gainsboro");
      $(".btn-light").css("border", "transparent");

      $("#selectorBarchart").selectpicker("refresh");
      UpdateBarchartWithChosenCountries(chosenCountries);
      $(function () {
        $("#selectorBarchart").selectpicker();
      });
    } else {
      $("#warningParagraph").text(
        "Wrong number of country chosen! Please select at least 5 countries"
      );
      $("#warningParagraph").css("color", "red");
      $(".btn-light").css("border", "1.5px solid red");
      // $('#saveButtonForMultiselection').css("border", "3px solid red");
    }
  });

  $("#SortByButton").on("change", function () {
    SortByFunction($("#SortByButton").val(), $("#OrderByButton").val());
  });

  $("#OrderByButton").on("change", function () {
    SortByFunction($("#SortByButton").val(), $("#OrderByButton").val());
  });
});

/**
 * It creates the deafult barchart when the page Statistics.html is loaded
 */
function CreateBarchartDefault() {
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 70, bottom: 70, left: 160 };

  // append the svg object to the body of the page
  svgGlobal = d3
    .select("#barchart-container")
    .append("svg")
    .attr("width", $("#barchart-container").width())
    .attr("height", 1100)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  $(window).resize(
    debounce(function () {
      d3.select("#barchart-container")
        .select("svg")
        .attr("width", $("#barchart-container").width());

      UpdateBarchart(findChosenBarchart(), datasetDefault);
    })
  );

  // //save the SVG in the dedicated global variable
  // svgGlobal = svg;

  //read the data from the csv and save it in the dedicated global variable datasetFromCsv
  d3.csv("../datasets/csv/barchart.csv").then(function (data) {
    data.forEach(function (d) {
      d.Nationality = d.Nationality;
      d.DeathsFinalForEachCountry = +d.DeathsFinalForEachCountry;
      d.DeathsAsPercentageOfPopulation = +d.DeathsAsPercentageOfPopulation;
      d.WW2DeathsToNationalRatio = +d.WW2DeathsToNationalRatio;
    });

    //default sorting is  ascending by deaths number

    data.sort(function (a, b) {
      return a.DeathsFinalForEachCountry - b.DeathsFinalForEachCountry;
    });

    datasetFromCsv = data;

    //select 10 meaningful country in the dataset as default data when the page is loaded
    datasetDefault = datasetFromCsv.filter(
      (d) =>
        d.Nationality == "France" ||
        d.Nationality == "Italy" ||
        d.Nationality == "Poland" ||
        d.Nationality == "United States" ||
        d.Nationality == "United Kindom" ||
        d.Nationality == "Soviet Union" ||
        d.Nationality == "Japan" ||
        d.Nationality == "China" ||
        d.Nationality == "Germany" ||
        d.Nationality == "Dutch East Indies"
    );

    // Add X scale, X axis and X labels
    var xScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(datasetDefault, function (d) {
          return SelectData(0, d);
        }),
      ])
      .range([0, $("#barchart-container").width() - 200]);

    svgGlobal
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + 1000 + ")")
      .call(d3.axisBottom(xScale).ticks(4))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y scale, Y axis and Y labels
    var yScale = d3
      .scaleBand()
      .domain(
        datasetDefault.map(function (d) {
          return d.Nationality;
        })
      )
      .range([0, 1000])
      .padding(0.1);

    svgGlobal.append("g").attr("class", "y axis").call(d3.axisLeft(yScale));

    //Bars
    svgGlobal
      .selectAll("rect")
      .data(datasetDefault)
      .enter()
      .append("rect")
      .attr("fill", "var(--red)")
      .attr("x", xScale(0))
      .attr("y", function (d) {
        return yScale(d.Nationality);
      })
      .attr("width", function (d) {
        return xScale(SelectData(0, d));
      })
      .attr("height", yScale.bandwidth())

      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .append("title")
      .text((d) => nf.format(SelectData(findChosenBarchart(), d)));
  });
}

/**
 * It updates the barchart when a filter or the country select picker is clicked
 */

function UpdateBarchart(chosenBarchart, data) {
  // Add X scale, X axis
  var xScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return SelectData(chosenBarchart, d);
      }),
    ])
    .range([0, $("#barchart-container").width() - 200]);

  svgGlobal
    .select(".x.axis")
    .call(d3.axisBottom(xScale).ticks(4))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y scale, Y axis
  var yScale = d3
    .scaleBand()
    .domain(
      data.map(function (d) {
        return d.Nationality;
      })
    )
    .range([0, 1000])
    .padding(0.1);

  svgGlobal
    .select(".y.axis")
    // .transition().duration(1000)
    .call(d3.axisLeft(yScale));

  var mouseover = function (d) {
    d3.select(this).style("stroke", "black").style("opacity", 0.6);
  };
  var mouseleave = function (d) {
    d3.select(this).style("stroke", "none").style("opacity", 1);
  };

  //Bars
  svgGlobal
    .selectAll("rect")
    .data(data)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("fill", "var(--red)")
          .attr("x", xScale(0))
          .attr("y", function (d) {
            return yScale(d.Nationality);
          })
          .attr("width", function (d) {
            return xScale(SelectData(chosenBarchart, d));
          })
          .attr("height", yScale.bandwidth())
          .on("mouseover", mouseover)
          .on("mouseleave", mouseleave)
          .append("title")
          .text((d) => nf.format(SelectData(findChosenBarchart(), d))),

      (update) =>
        update
          .attr("x", xScale(0))
          .attr("y", function (d) {
            return yScale(d.Nationality);
          })
          .attr("width", function (d) {
            return xScale(SelectData(chosenBarchart, d));
          })
          .attr("height", yScale.bandwidth())
          .attr("fill", "var(--red)")
          .select("title")
          .text((d) => {
            return nf.format(SelectData(findChosenBarchart(), d));
          }),
      (exit) => exit.remove()
    );


}

/**
 * It selects barchart according to the radio button
 */

function SelectData(chosenBarchart, csvData) {
  if (chosenBarchart == 0) return csvData.DeathsFinalForEachCountry;
  if (chosenBarchart == 1) return csvData.DeathsAsPercentageOfPopulation;
  return csvData.WW2DeathsToNationalRatio;
}

/**
 * It calls the update barchart function according to the country selected
 */
function UpdateBarchartWithChosenCountries(chosenData) {
  datasetDefault = datasetFromCsv.filter((d) =>
    chosenData.includes(d.Nationality)
  );
  UpdateBarchart(findChosenBarchart(), datasetDefault);
}

/**
 * It finds the value of the checked radio button
 */
function findChosenBarchart() {
  if (document.getElementById("barchart1").checked) return 0;
  if (document.getElementById("barchart2").checked) return 1;
  return 2;
}

/**
 * It validates the number of country selected
 */
function ValidateInput(chosenCountries) {
  if (chosenCountries.length < 5) return false;
  return true;
}
/**
 * It changes the barchart order
 */
function SortByFunction(sort, order) {
  if (order == "Ascending") {
    if (sort == "SortByDeaths") {
      if (findChosenBarchart() == 0) {
        datasetDefault.sort(function (a, b) {
          return a.DeathsFinalForEachCountry - b.DeathsFinalForEachCountry;
        });
        UpdateBarchart(findChosenBarchart(), datasetDefault);
      } else if (findChosenBarchart() == 1) {
        datasetDefault.sort(function (a, b) {
          return (
            a.DeathsAsPercentageOfPopulation - b.DeathsAsPercentageOfPopulation
          );
        });
        UpdateBarchart(findChosenBarchart(), datasetDefault);
      } else {
        datasetDefault.sort(function (a, b) {
          return a.WW2DeathsToNationalRatio - b.WW2DeathsToNationalRatio;
        });
        UpdateBarchart(findChosenBarchart(), datasetDefault);
      }
    } else {
      //(sort == "SortByName")
      datasetDefault.sort(function (a, b) {
        return a.Nationality.localeCompare(b.Nationality);
      });
      UpdateBarchart(findChosenBarchart(), datasetDefault);
    }
  } else {
    // (order = "Descending")

    if (sort == "SortByDeaths") {
      if (findChosenBarchart() == 0) {
        datasetDefault.sort(function (a, b) {
          return d3.descending(
            a.DeathsFinalForEachCountry,
            b.DeathsFinalForEachCountry
          );
        });
        UpdateBarchart(findChosenBarchart(), datasetDefault);
      } else if (findChosenBarchart() == 1) {
        datasetDefault.sort(function (a, b) {
          return (
            b.DeathsAsPercentageOfPopulation - a.DeathsAsPercentageOfPopulation
          );
        });
        UpdateBarchart(findChosenBarchart(), datasetDefault);
      } else {
        datasetDefault.sort(function (a, b) {
          return b.WW2DeathsToNationalRatio - a.WW2DeathsToNationalRatio;
        });
        UpdateBarchart(findChosenBarchart(), datasetDefault);
      }
    } else {
      // (sort == "SortByName")

      datasetDefault.sort(function (a, b) {
        return b.Nationality.localeCompare(a.Nationality);
      });
      UpdateBarchart(findChosenBarchart(), datasetDefault);
    }
  }
}
