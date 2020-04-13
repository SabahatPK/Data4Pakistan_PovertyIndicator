// set the dimensions and margins of the graph
let margin = { top: 10, right: 30, bottom: 50, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//OUTS: add a Year label to svg

//Read the data
let promises = [
  d3.csv("data/dfPovertyAdultLit.csv"),
  d3.csv("data/dfPovertyMobileOwn.csv"),
];
let allData = [];
let xAxisLabel = "Adult Literacy";

Promise.all(promises).then(function (data) {
  data.forEach(function (eachDataset) {
    eachDataset.forEach(function (d) {
      d["Poverty Rate (%)"] = +d["Poverty Rate (%)"];
      d["Year"] = new Date(d["Year"]);
      if (
        d.hasOwnProperty(
          "Adult literacy, 25 or more years old (% of population aged 25 or more)"
        )
      ) {
        d[
          "Adult literacy, 25 or more years old (% of population aged 25 or more)"
        ] = +d[
          "Adult literacy, 25 or more years old (% of population aged 25 or more)"
        ];
      } else {
        d["Households' mobile phone ownership (% of population)"] = +d[
          "Households' mobile phone ownership (% of population)"
        ];
      }
    });
  });

  allData = data;

  updateChart(allData, xAxisLabel);
});

//Add in event listener for indicator choice.
$("#indicatorChoice").on("change", function () {
  xAxisLabel =
    $("#indicatorChoice").val() === "adultLit"
      ? "Adult Literacy"
      : "Mobile Phone Ownership";
  updateChart(allData, xAxisLabel);
});

//Add in event listener for geographic choice.
$("#geographicChoice").on("change", function () {
  updateChart(allData, xAxisLabel);
});

function updateChart(someData, xAxisLabel) {
  let dataAdultLit = d3
    .nest()
    .key(function (d) {
      return d["Year"];
    })
    .entries(someData[0]);

  let dataMobileOwn = d3
    .nest()
    .key(function (d) {
      return d["Year"];
    })
    .entries(someData[1]);

  let filteredData =
    $("#indicatorChoice").val() === "adultLit"
      ? dataAdultLit[0]
      : dataMobileOwn[0];

  filteredData =
    $("#geographicChoice").val() === "allProv"
      ? filteredData["values"]
      : filteredData["values"].filter(
          (each) => each["Province"] === $("#geographicChoice").val()
        );

  // Add X axis
  let x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  //Add x-axis label:
  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")"
    )
    .attr("class", "xAxisLabel")
    .style("text-anchor", "middle");

  svg.selectAll(".xAxisLabel").text(xAxisLabel);

  // Add Y axis
  let y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  //Add y-axis label:
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Poverty Rate");

  // Color scale: give me a province name, I return a color
  let color = d3
    .scaleOrdinal()
    .domain([
      "Balochistan",
      "Federal Capital Territory",
      "Khyber Pakhtunkhwa",
      "Punjab",
      "Sindh",
    ])
    .range(["#440154ff", "#21908dff", "#fde725ff", "#129490", "#CE1483"]);

  // JOIN new data with old elements.
  var circles = svg.selectAll("circle").data(filteredData, function (d) {
    return d["District"];
  });

  // EXIT old elements not present in new data.
  circles.exit().attr("class", "exit").remove();

  // ENTER new elements present in new data.
  circles
    .enter()
    .append("circle")
    .attr("class", "enter")
    .attr("fill", function (d) {
      return color(d["Province"]);
    })
    .merge(circles)
    .attr("cy", function (d) {
      return y(d["Poverty Rate (%)"]);
    })
    .attr("cx", function (d) {
      return x(
        d[
          "Adult literacy, 25 or more years old (% of population aged 25 or more)"
        ] || d["Households' mobile phone ownership (% of population)"]
      );
    })
    .attr("r", 5);
}
