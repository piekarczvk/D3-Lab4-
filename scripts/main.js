'use strict';

// PART 1 - Draw a tree
// - load data
d3.csv('data/music_mock.csv', d => ({
    genre: d.genre,
    subgenre: d.subgenre,
    streams: +d.streams  // Convert streams to a number
})).then(data => {
    console.log("Raw Data:", data);  // Check if data is loaded correctly
    processTree(data);  // Pass data to the next function
}).catch(error => {
    console.error("Error loading data:", error);
});
// - transform data into a rollup and then a hierarchy
function processTree(data) {
    let nestedData=d3.rollup(
    data,
    v=>d3.mean(v, d=>d.streams), //compute average streams per subgenre 
    d=>d.genre, // group by genre
    d=>d.subgenre //group by subgenre second level)
    );
    console.log("Grouped Data:", nestedData);

    let hierarchyRoot=d3.hierarchy(nestedData,d=>d[1])
        .sum(d=>d[1])
        .sort((a,b)=>b.value-a.value);
    console.log("Hierarchy Data:", hierarchyRoot);
    drawLinkage(hierarchyRoot.copy(),'#tree1') //passing to the visualization function
}

// - create a tree generator
// - set up an svg selection
// - extract node data and link data
// - render nodes as circles
// - render links using link generator and curve interpolator

// Loading data
// let musicDataRaw = ...
// console.log('Raw data', musicDataRaw);

// Creating nested map aggregation (d3.rollup)
// let musicDataGrouped = ...
// console.log('Grouped data', musicDataGrouped);

// Turning aggregation into hierarchy of node objects (d3.hierarchy)
// use the rollup result to set the value of each node (use hierarchy.sum() method)
// let musicHierarchyRoot = ...
// console.log('Hierarchy data', musicHierarchyRoot);

// common size values for charts
const size = 800, padding = 30;

// Function to draw a linkage layout
function drawLinkage(hierarchyRoot, container){

    // Tree Generator (d3.tree)
   let treeGen = d3.tree().size([size-2*padding, size-2*padding]);


    // put the hierachy through a tree generator
    // will compute the x and y of each node
    treeGen(hierarchyRoot);

    // make top level svg
    let svg = d3.select(container).append('svg')
        .attr('width',size).attr('height', size).classed('viz', true);
    // make chart group
    let chart = svg.append('g').attr('transform',`translate(${padding},${padding})`);

    // extract node and link data from hierarchy
    let nodesData = hierarchyRoot.descendants();

    let linksData = hierarchyRoot.links();

    console.log('nodes: ', nodesData);
    console.log('links: ',linksData);

    // Link generator (d3.link)
    // x and y accessors can be fliped to draw the tree horizontally
    let linkGen = d3.linkHorizontal()
        .x(d=>d.y)
        .y(d=>d.x);

    // Draw nodes - groups of circles and text
    // Note the switch in x and y translation to draw the tree horizontally
    let nodes = chart.selectAll('g.node')
        .data(nodesData)
        .join('g')
        .classed('node', true)
        .attr('transform', d=>`translate(${d.y},${d.x})`);
    // Join and draw circles
    nodes.selectAll('circle').data(d=>[d])
        .join('circle')
        .attr('r', 5)
        .attr('fill', '#555')
    // Join and draw text (excluding root)
    nodes.filter(d=>d.parent!==null)
        .selectAll('text').data(d=>[d])
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', -10)
        .attr('font-size', 10)
        .text(d=>d.data[0])

    // Draw links using the link generator
    let links = chart.selectAll('path.link')
        .data(linksData)
        .join('path')
        .classed('link', true)
        .attr('d', linkGen)
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', '#555');
}

// use the hierarchy to draw the node-link tree, using .copy() becasue it will be mutated
// drawLinkage(musicHierarchyRoot.copy(), '#tree1');

// PART 2 - Draw a circle pack
// - make sure that hierarchy nodes have a value (hierarchy.sum() method)
// - create a pack generator
// - set up an svg selection
// - extract node data
// - render nodes as circles

// function to draw a pack layout
function drawPack(hierarchyRoot, container){
    // Pack Generator
    let pacGen=d3.pack().size([size-2*padding,size-2*padding].padding(5))
    

    // put the hierarchy through the pack generator
    // will compute x y and r attributes of each node (radius already square-rooted)
    packGen(hierarchyRoot);

    // make top level svg
    let svg = d3.select(container).append('svg')
        .attr('width',size).attr('height', size).classed('viz', true);
    // make chart group
    let chart = svg.append('g').attr('transform',`translate(${padding},${padding})`);

    // Extract node data from hierarchy
    // let nodesData = ...
    // console.log(nodesData);

    // Draw nodes - groups of circles and text
    let nodes = chart.selectAll('g.node')
        .data(nodesData)
        .join('g')
        .classed('node', true)
        .attr('transform', d=>`translate(${d.x},${d.y})`);
    // Join and draw circles
    nodes.selectAll('circle').data(d=>[d])
        .join('circle')
        .attr('r', d=>d.r)
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', '#555');
    // Join and draw text
    // use height of node to check if leaf or not
    nodes.filter(d=>d.parent!==null)
        .selectAll('text').data(d=>[d])
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', d=>d.height===0?3:-d.r+15)
        .attr('font-size', 10)
        .text(d=>d.data[0])
    
}

// use the hierarchy to draw the circle pack, using .copy() because it will be mutated
// drawPack(musicHierarchyRoot.copy(), '#pack1');

// PART 3 - Draw a map

// Module imports
import Map from "./Map.js";

let topojsonData = await d3.json('./data/countries-50m.topo.json');
let countries = topojson.feature(topojsonData, topojsonData.objects.countries);
console.log(countries);

let map = new Map('#map1', 1000, 800);
map.baseMap(countries, d3.geoNaturalEarth1)
    .renderPoints([
        [55.9533, -3.1883,  40], // edinburgh
        [25.2048, 55.2708,  35], // dubai
        [2.9264,  101.6964, 30], // putrajaya
    ]);