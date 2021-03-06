const url_user_education =
"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
url_counties =
"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const svgContainerWidth = 950,
svgContainerHeight = 620;

const colorRange = [
"#eff3ff",
"#deebf7",
"#c6dbef",
"#9ecae1",
"#6baed6",
"#4292c6",
"#2171b5",
"#08519c",
"#08306b"];


let education_data, county_data, state_data;

const tooltip = d3.
select("#container").
append("div").
attr("id", "tooltip").
style("opacity", 0);

const svg = d3.
select("#svgContainer").
append("svg").
attr("width", svgContainerWidth).
attr("height", svgContainerHeight);

const drawMap = () => {
  const education = education_data.map((item, index) => {
    return item.bachelorsOrHigher;
  });

  const thresholdDomain = () => {
    let array = [];
    let step = (d3.max(education) - d3.min(education)) / colorRange.length;
    let base = d3.min(education);
    for (let i = 1; i < colorRange.length; i++) {
      array.push(Math.round(base + i * step));
    }
    return array;
  };

  console.log(thresholdDomain());

  const legendThreshold = d3.
  scaleThreshold().
  domain(thresholdDomain()).
  range(colorRange);

  svg.
  selectAll("path").
  data(county_data).
  enter().
  append("path").
  attr("d", d3.geoPath()).
  attr("data-fips", (datum, index) => {
    return datum.id;
  }).
  attr("data-education", (datum, index) => {
    let filtered = education_data.filter(obj => {
      return obj.fips === datum.id;
    });

    let result = filtered[0].bachelorsOrHigher;

    return result;
  }).
  classed("county", true).
  attr("fill", (datum, index) => {
    let filtered = education_data.filter(obj => {
      return obj.fips === datum.id;
    });

    let percentage = filtered[0].bachelorsOrHigher;

    return legendThreshold(percentage);
  }).
  on("mouseover", (datum, index) => {
    let filtered = education_data.filter(obj => {
      return obj.fips === datum.id;
    });

    let areaName = filtered[0].area_name;
    let state = filtered[0].state;
    let percentage = filtered[0].bachelorsOrHigher;

    tooltip.
    style("opacity", 0.9).
    style("top", event.pageY + "px").
    style("left", event.pageX + 30 + "px").
    attr("data-education", percentage).
    html(areaName + ", " + state + "<br>" + percentage + "%");
  }).
  on("mouseout", (datum, index) => {
    tooltip.style("opacity", 0);
  });

  //   states line
  svg.
  append("path").
  datum(state_data).
  attr("class", "states").
  attr("d", d3.geoPath());

  //   legend
  const legendWidth = 300,
  legendHeight = 20;

  const g = svg.
  append("g").
  attr("class", "key").
  attr("id", "legend").
  attr("transform", "translate(550,20)").
  attr("width", legendWidth).
  attr("height", legendHeight);

  const legendXScale = d3.
  scaleLinear().
  domain([d3.min(education), d3.max(education)]).
  range([0, legendWidth]);

  g.selectAll(".legendCell").
  data(colorRange).
  enter().
  append("rect").
  classed("legendCell", true).
  attr("width", legendWidth / colorRange.length).
  attr("height", 10).
  attr("x", (datum, index) => {
    return index * legendWidth / colorRange.length;
  }).
  attr("fill", (datum, index) => {
    return datum;
  });

  const legendAxis = d3.
  axisBottom(legendXScale).
  tickValues(thresholdDomain()).
  tickFormat(d => {
    return d + "%";
  }).
  tickSizeOuter([0]).
  tickPadding([10]);

  g.append("g").
  attr("transform", "translate(0, 10)").
  attr("y", 0).
  attr("x", 0).
  attr("id", "legendAxis").
  call(legendAxis);
};

d3.json(url_counties, function (error, data) {
  if (error) {
    console.log(error);
  } else {
    county_data = topojson.feature(data, data.objects.counties).features;

    state_data = topojson.mesh(data, data.objects.states, function (a, b) {
      return a !== b;
    });

    d3.json(url_user_education, function (error, data) {
      if (error) {
        console.log(error);
      } else {
        education_data = data;

        drawMap();
      }
    });
  }
});
