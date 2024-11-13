// Load adjacency matrix data and create the heatmap
fetch('adjacency_matrix.json')
    .then(response => response.json())
    .then(data => createHeatmap(data.names, data.matrix));

function createHeatmap(names, matrix) {
    const margin = { top: 150, right: 0, bottom: 100, left: 150 }, // Adjusted margins for label spacing
          width = 600,
          height = 600,
          gridSize = Math.floor(width / names.length),
          colors = d3.scaleSequential(d3.interpolateGreys).domain([0, d3.max(matrix, row => d3.max(row.map(d => d.count)))]);

    // Create the SVG container
    const svg = d3.select("#heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add top axis labels
    svg.selectAll(".topLabel")
        .data(names)
        .enter().append("text")
        .attr("class", "topLabel")
        .attr("x", (d, i) => i * gridSize)
        .attr("y", -10) // Adjust position slightly downward
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)")
        .text(d => d);

    // Add left axis labels
    svg.selectAll(".leftLabel")
        .data(names)
        .enter().append("text")
        .attr("class", "leftLabel")
        .attr("y", (d, i) => i * gridSize + gridSize / 2)
        .attr("x", -10) // Position labels further from grid
        .style("text-anchor", "end")
        .text(d => d);

    // Tooltip div without links
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");

    // Create heatmap cells
    svg.selectAll(".cell")
        .data(matrix.flatMap((row, i) => row.map((cell, j) => ({ ...cell, x: j, y: i }))))
        .enter().append("rect")
        .attr("x", d => d.x * gridSize)
        .attr("y", d => d.y * gridSize)
        .attr("class", "cell")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", d => colors(d.count))
        .on("mouseover", function (event, d) {
            if (d.count > 0) {
                tooltip.style("visibility", "visible")
                    .html(`<strong>Intersection:</strong> ${names[d.y]} and ${names[d.x]}<br><strong>Count:</strong> ${d.count}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () { tooltip.style("visibility", "hidden"); });
}
