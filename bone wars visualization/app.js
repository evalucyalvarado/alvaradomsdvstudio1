// app.js

document.addEventListener("DOMContentLoaded", function() {

  // Ensure 'inputData' is accessible
  if (typeof inputData === 'undefined') {
      console.error('inputData is not defined. Please ensure data.js is included and defines inputData.');
      return;
  }

  // Data Processing

  // Initialize an empty object to hold the aggregated data
  const aggregatedData = {};

  // Loop through each entry in the input data
  inputData.forEach(entry => {
      // Extract the year, state, and collector's name
      const year = parseInt(entry.year);
      const state = entry.state;
      let collector = entry.collector;

      // Skip entries without a valid year, state, or collector
      if (isNaN(year) || !state || !collector) return;

      // Create a unique key for each collector-state pair
      const collectorState = `${collector} (${state})`;

      // Ensure the year exists in the aggregated data
      if (!aggregatedData[year]) {
          aggregatedData[year] = {};
      }

      // Ensure the collector-state exists for the year
      if (!aggregatedData[year][collectorState]) {
          aggregatedData[year][collectorState] = {
              count: 0,
              specimens: []
          };
      }

      // Increment the count and add the specimens
      aggregatedData[year][collectorState].count += entry.count;
      aggregatedData[year][collectorState].specimens.push(...entry.specimens);
  });

  // Prepare data for visualization
  const dataForGraph = [];

  // Loop through the aggregated data to create the array
  for (const year in aggregatedData) {
      for (const collectorState in aggregatedData[year]) {
          dataForGraph.push({
              year: parseInt(year),
              collectorState: collectorState,
              count: aggregatedData[year][collectorState].count,
              specimens: aggregatedData[year][collectorState].specimens
          });
      }
  }

  // Sort the data by year
  dataForGraph.sort((a, b) => a.year - b.year);

  // Visualization with D3.js

  // Set the dimensions and margins of the graph
  const margin = { top: 20, right: 50, bottom: 60, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

  // Append the SVG object to the body
  const svg = d3.select("#streamGraph")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  // Append a 'g' element to 'svg' with proper transformation
  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Extract unique states/places from the data
  const states = [...new Set(inputData.map(d => d.state))];

  // Define an array of earthy colors
  let earthyColors = [
      '#8c510a', '#bf812d', '#dfc27d', '#80cdc1', '#35978f', '#01665e',
      '#543005', '#003c30', '#c7eae5', '#5ab4ac', '#762a83', '#d9f0d3',
      '#a6611a', '#dfc27d', '#80cdc1', '#018571', '#b35806', '#f1a340',
      '#998ec3', '#542788', '#2166ac', '#1b7837', '#c2a5cf', '#5e3c99'
      // Add more colors if needed
  ];

  // Ensure we have enough colors for all states
  while (earthyColors.length < states.length) {
      earthyColors = earthyColors.concat(earthyColors);
  }

  // Create a color scale mapping states to colors
  const stateColorScale = d3.scaleOrdinal()
      .domain(states)
      .range(earthyColors);

  // Define state abbreviations
  const stateAbbreviations = {
      "Wyoming": "WY",
      "Colorado": "CO",
      "New Mexico": "NM",
      "United States": "US",
      "North America": "NA",
      "South Dakota": "SD",
      "Prince George's County": "MD", // Maryland
      "Chatham County": "NC", // North Carolina
      // Add other states/counties with their official abbreviations
  };

  // Get unique collector-state pairs
  const collectorStates = [...new Set(dataForGraph.map(d => d.collectorState))];

  // Prepare data for stacking
  const years = [...new Set(dataForGraph.map(d => d.year))].sort((a, b) => a - b);
  const stackedData = years.map(year => {
      const yearData = { year: year };
      collectorStates.forEach(cs => {
          const entry = dataForGraph.find(d => d.year === year && d.collectorState === cs);
          yearData[cs] = entry ? entry.count : 0;
      });
      return yearData;
  });

  // Set up the stack
  const stack = d3.stack()
      .keys(collectorStates)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetWiggle);

  const layers = stack(stackedData);

  // Set up scales
  const x = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0, width]);

  const y = d3.scaleLinear()
      .domain([
          d3.min(layers, layer => d3.min(layer, d => d[0])),
          d3.max(layers, layer => d3.max(layer, d => d[1]))
      ])
      .range([height, 0]);

  // Define the area generator
  const area = d3.area()
      .x(d => x(d.data.year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveBasis);

  // Create a tooltip div
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // Add patterns to defs
  const defs = svg.append("defs");

  // Functions to create patterns
  function createHatchPattern(state, color) {
      const safeState = state.replace(/\s+/g, '-');
      const pattern = defs.append("pattern")
          .attr("id", `hatch-${safeState}`)
          .attr("patternUnits", "userSpaceOnUse")
          .attr("width", 6)
          .attr("height", 6);

      pattern.append("rect")
          .attr("width", 6)
          .attr("height", 6)
          .attr("fill", color);

      pattern.append("path")
          .attr("d", "M0,0 l6,6 M6,0 l-6,6")
          .attr("stroke", "black")
          .attr("stroke-width", 1);
  }

  function createStipplePattern(state, color) {
      const safeState = state.replace(/\s+/g, '-');
      const pattern = defs.append("pattern")
          .attr("id", `stippling-${safeState}`)
          .attr("patternUnits", "userSpaceOnUse")
          .attr("width", 4)
          .attr("height", 4);

      pattern.append("rect")
          .attr("width", 4)
          .attr("height", 4)
          .attr("fill", color);

      pattern.append("circle")
          .attr("cx", 2)
          .attr("cy", 2)
          .attr("r", 1)
          .attr("fill", "black");
  }

  // Generate patterns for each state
  states.forEach(state => {
      const color = stateColorScale(state);
      createHatchPattern(state, color);
      createStipplePattern(state, color);
  });

  // Add the layers
  g.selectAll("path")
      .data(layers)
      .enter().append("path")
      .attr("d", area)
      .attr("fill", function(d) {
          // Extract collector and state from d.key
          const [collector, stateWithParentheses] = d.key.split(' (');
          const state = stateWithParentheses.slice(0, -1); // Remove the closing parenthesis

          // Get the base color for the state
          const baseColor = stateColorScale(state);
          const safeState = state.replace(/\s+/g, '-');

          // Determine if texture is needed
          if (collector.includes("Cope")) {
              // Use hatching pattern
              return `url(#hatch-${safeState})`;
          } else if (collector.includes("Marsh") && !collector.includes("Hatcher")) {
              // Use stippling pattern
              return `url(#stippling-${safeState})`;
          } else {
              // No texture, solid fill
              return baseColor;
          }
      })
      .on("mouseover", function(event, d) {
          // Reduce opacity of all streams
          g.selectAll("path").attr("opacity", 0.3);
          // Highlight the hovered stream
          d3.select(this).attr("opacity", 1);

          // Get the current mouse position and corresponding data
          const [mouseX] = d3.pointer(event);
          const year = Math.round(x.invert(mouseX));
          const collectorState = d.key;

          // Find the data entry for this collector-state and year
          const entry = dataForGraph.find(e => e.year === year && e.collectorState === collectorState);

          if (entry) {
              // Create tooltip content
              let tooltipContent = `<strong>${collectorState}</strong><br/>Year: ${year}<br/>Specimens Collected: ${entry.count}<br/>Specimens:<ul>`;
              const specimensList = entry.specimens.map(specimen => `<li>${specimen}</li>`).join("");
              tooltipContent += `${specimensList}</ul>`;

              tooltip.style("opacity", .9)
                  .html(tooltipContent)
                  .style("left", (event.pageX + 15) + "px")
                  .style("top", (event.pageY - 28) + "px");
          }
      })
      .on("mousemove", function(event) {
          tooltip.style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
          // Reset opacity
          g.selectAll("path").attr("opacity", 1);

          tooltip.style("opacity", 0);
      });

  // Add the x-axis
  g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

  // Add x-axis label
  g.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .text("Year");

  // Add the y-axis
  g.append("g")
      .call(d3.axisLeft(y).ticks(5));

  // Add y-axis label
  g.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .text("Number of Specimens");

  // Prepare legend data
  const legendData = collectorStates.map(key => {
      const [collector, stateWithParentheses] = key.split(' (');
      const state = stateWithParentheses.slice(0, -1);
      return { key, collector, state };
  });

  // Attach click handler to the existing legend toggle button
  d3.select("#legend-toggle")
      .on("click", function() {
          const legendContainer = d3.select("#legendContainer");
          const isVisible = legendContainer.style("display") !== "none";
          legendContainer.style("display", isVisible ? "none" : "block");
          d3.select(this).text(isVisible ? "Show Legend" : "Hide Legend");
      });

  // Initially hide the legend
  d3.select("#legendContainer").style("display", "none");

  // Generate the legend in the HTML container
  const legendContainer = d3.select("#legendContainer")
      .style("max-height", "200px") // Adjust the max height as needed
      .style("overflow-y", "auto") // Enable vertical scrolling
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("margin", "10px 0");
      // Remove or comment out the background color styling in app.js
      //.style("background-color", "#f9f9f9"); // Commented out to use CSS styling

  const legendItems = legendContainer.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "5px");

  legendItems.append("svg")
      .attr("width", 16)
      .attr("height", 16)
      .style("margin-right", "8px")
      .append("rect")
      .attr("width", 16)
      .attr("height", 16)
      .attr("fill", function(d) {
          const baseColor = stateColorScale(d.state);
          const safeState = d.state.replace(/\s+/g, '-');

          if (d.collector.includes("Cope")) {
              return `url(#hatch-${safeState})`;
          } else if (d.collector.includes("Marsh") && !d.collector.includes("Hatcher")) {
              return `url(#stippling-${safeState})`;
          } else {
              return baseColor;
          }
      })
      .attr("stroke", "black");

  legendItems.append("div")
      .attr("class", "legend-text")
      .text(d => {
          const collectorName = d.collector;
          const stateAbbrev = stateAbbreviations[d.state] || d.state;
          return `${collectorName} (${stateAbbrev})`;
      });

});
