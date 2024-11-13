// app.js
const svgWidth = 800;
const svgHeight = 450;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

// Create SVG container
const svg = d3.select("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Load the data
d3.json("processedOutput.json").then(data => {
    const states = Object.keys(data);
    const allYears = new Set();
    const series = {};

    // Collect years and initialize data structure
    states.forEach(state => {
        series[state] = [];
        const collectors = Object.keys(data[state]);

        collectors.forEach(collector => {
            const years = Object.keys(data[state][collector]);
            years.forEach(year => {
                allYears.add(year);
                const count = data[state][collector][year].count;

                // Push data for each collector
                series[state].push({
                    year: year,
                    collector: collector,
                    count: count
                });
            });
        });
    });

    const yearArray = Array.from(allYears).sort();

    // Create scales
    const xScale = d3.scaleBand()
        .domain(yearArray)
        .range([margin.left, svgWidth - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(states, state => d3.sum(series[state], d => d.count))])
        .range([svgHeight - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create area generator
    const area = d3.area()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

    // Process the data for stack layout
    const stack = d3.stack()
        .keys(states)
        .value((d, key) => {
            return series[key].find(entry => entry.year === d.year)?.count || 0;
        });

    const stackedData = stack(yearArray.map(year => ({ year })));

    // Draw the area
    svg.selectAll(".layer")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .attr("fill", (d, i) => colorScale(i))
        .attr("transform", `translate(0, 0)`);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Tooltip
    const tooltip = d3.select("#tooltip")
        .style("opacity", 0);

    svg.selectAll(".layer")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(d.key)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });

}).catch(error => {
    console.error('Error loading or processing data:', error);
});
