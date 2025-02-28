export default class Map{

    width; height;
    
    svg; mapGroup; pointGroup;
    projection; pathGen;

    zoom;

    regions;
    data;

    // constructor
    constructor(container, width, height){
        this.width = width;
        this.height = height;

        // setting up selections
        this.svg = d3.select(container).append('svg')
            .classed('viz map', true)
            .attr('width', width)
            .attr('height', height);
        // base map
        this.mapGroup = this.svg.append('g')
            .classed('map', true);
        // superimposed points
        this.pointGroup = this.svg.append('g')
            .classed('points', true);

        // setting the zoom
        this.#setZoom();
    }

    // function to set the zoom behaviour
    #setZoom(){
        this.zoom = d3.zoom()
            .extent([[0,0], [this.width,this.height]])
            .translateExtent([[0,0], [this.width,this.height]])
            .scaleExtent([1,8])
            .on('zoom', ({transform})=>{
                // applies transform and call render map to update zoom scales
                this.mapGroup.attr('transform', transform);
                this.pointGroup.attr('transform', transform);
            })
        this.svg.call(this.zoom)
    }

    // function to render the base map
    #renderMap(projection){
        this.projection = projection()
            .fitSize([this.width,this.height], this.regions);
        this.pathGen = d3.geoPath()
            .pointRadius(4)
            .projection(this.projection);

        this.mapGroup.selectAll('path.regions')
            .data(this.regions.features)
            .join('path')
            .classed('regions', true)
            .attr('d', this.pathGen);
    }

    #renderPoints(){
        // PART 3
        // to be completed
    
    }

    // Renders a base (background) map
    baseMap(regions=[], projection=d3.geoEqualEarth){
        this.regions = regions;
        this.#renderMap(projection);
        return this;
    }

    // Renders points on the map
    // dataset should be in format [[lat,lon,val],...]
    renderPoints(dataset){
        this.data = dataset;
        this.#renderPoints();
        return this;
    }
}