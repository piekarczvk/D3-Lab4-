'use strict';

// PART 1 - Draw a tree
// - Load data
d3.csv('data/music_mock.csv', d => ({
    genre: d.genre,
    subgenre: d.subgenre,
    streams: +d.streams // Convert streams to a number
})).then(data => {
    console.log("Raw Data:", data);  // Check if data is loaded correctly
    let nestedData = processTree(data); // Process data into hierarchy
    let musicHierarchyRoot = d3.hierarchy(nestedData, d => d[1])
        .sum(d => d[1])
        .sort((a, b) => b.value - a.value);

    console.log("Hierarchy Data:", musicHierarchyRoot);
    drawLinkage(musicHierarchyRoot.copy(), '#tree1'); // Pass to visualization
    drawPack(musicHierarchyRoot.copy(), '#pack1'); // Enable circle pack visualization
}).catch(error => {
    console.error("Error loading data:", error);
});

// - Transform data into a rollup and then a hierarchy
function processTree(data) {
    let nestedData = d3.rollup(
        data,
        v => d3.mean(v, d => d.streams), // Compute average streams per subgenre
        d => d.genre, // Group by genre
        d => d.subgenre // Group by subgenre (second level)
    );
    console.log("Grouped Data:", nestedData);
    return nestedData;
}

// Common size values for charts
const size = 800, padding = 30;

// Function to draw a linkage layout
function drawLinkage(hierarchyRoot, container) {
    let treeGen = d3.tree().size([size - 2 * padding, size - 2 * padding]);

    // Compute the x and y positions
    treeGen(hierarchyRoot);

    // Create SVG
    let svg = d3.select(container).append('svg')
        .attr('width', size).attr('height', size).classed('viz', true);

    // Chart group
    let chart = svg.append('g').attr('transform', `translate(${padding},${padding})`);

    // Extract node and link data
    let nodesData = hierarchyRoot.descendants();
    let linksData = hierarchyRoot.links();

    console.log('Nodes:', nodesData);
    console.log('Links:', linksData);

    // Link generator
    let linkGen = d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);

    // Draw links
    chart.selectAll('path.link')
        .data(linksData)
        .join('path')
        .classed('link', true)
        .attr('d', linkGen)
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', '#555');

    // Draw nodes
    let nodes = chart.selectAll('g.node')
        .data(nodesData)
        .join('g')
        .classed('node', true)
        .attr('transform', d => `translate(${d.y},${d.x})`);

    nodes.append('circle')
        .attr('r', 5)
        .attr('fill', '#555');

    nodes.filter(d => d.parent !== null)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', -10)
        .attr('font-size', 10)
        .text(d => d.data[0]);
}

// Function to draw a pack layout
function drawPack(hierarchyRoot, container) {
    let packGen = d3.pack().size([size - 2 * padding, size - 2 * padding]).padding(5);

    // Compute x, y, and r attributes
    packGen(hierarchyRoot);

    // Create SVG
    let svg = d3.select(container).append('svg')
        .attr('width', size).attr('height', size).classed('viz', true);

    let chart = svg.append('g').attr('transform', `translate(${padding},${padding})`);

    // Extract node data
    let nodesData = hierarchyRoot.descendants();
    console.log('Nodes Data:', nodesData);

    // Draw nodes
    let nodes = chart.selectAll('g.node')
        .data(nodesData)
        .join('g')
        .classed('node', true)
        .attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle')
        .attr('r', d => d.r)
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', '#555');

    nodes.filter(d => d.parent !== null)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.height === 0 ? 3 : -d.r + 15)
        .attr('font-size', 10)
        .text(d => d.data[0]);
}

// PART 3 - Draw a map
import Map from "./Map.js";

(async () => {
    try {
        let topojsonData = await d3.json('./data/countries-50m.topo.json');
        let countries = topojson.feature(topojsonData, topojsonData.objects.countries);
        console.log(countries);

        let map = new Map('#map1', 1000, 800);
        map.baseMap(countries, d3.geoNaturalEarth1)
            .renderPoints([
                [55.9533, -3.1883, 40], // Edinburgh
                [25.2048, 55.2708, 35], // Dubai
                [2.9264, 101.6964, 30], // Putrajaya
            ]);
    } catch (error) {
        console.error("Error loading map data:", error);
    }
})();
