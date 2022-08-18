let [url, req] = ['https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', new XMLHttpRequest()];

var temp, xScale, yScale, yAxis, xAxis;
var [w, h, padding, values, svg, tooltip] = [1200, 600, 60, [], d3.select('svg'), d3.select('#tooltip')]

//generate tghe x and y axis scale bases on domains(x: years in recorded y: jan-dec) and range(0+ padding to w/h-padding)
const getScales = () => {

    xScale = d3.scaleLinear()
        .domain([d3.min(values, (el) => el.year), d3.max(values, (el) => el.year) + 1])
        .range([padding, w - padding]);

    yScale = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, h - padding]);
}
//generate and position the actual x and y axes based on their coresponding scales calculated in func getScales'
const getAxes = () => {
    //used tickFormat to have dates displayed as decimals ie without comma  and . 
    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));

    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%B'));

    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (h - padding) + ')');

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)');
}
//set the area of the canvas
const canvas = () => {
    svg.attr('width', w);
    svg.attr('height', h);
}

const generateCells = () => {

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', (el) => {
            return el.variance <= -1 ? 'SteelBlue' : el.variance <= 0 ? 'LightSteelBlue' : el.variance <= 1 ? 'Orange' : 'Crimson'
        })
        .attr('data-year', (el) => el.year)
        .attr('data-month', (el) => el.month - 1)
        .attr('data-temp', (el) => temp + el.variance)
        .attr('height', () => (h - (2 * padding)) / 12)
        .attr('y', (el) => yScale(new Date(0, el.month - 1, 0, 0, 0, 0, 0)))
        .attr('width', () => {

            var totalYears = d3.max(values, (el) => el.year) - d3.min(values, (el) => el.year);

            return (w - (2 * padding)) / totalYears;
        })
        .attr('x', (el) => xScale(el.year))
        .on('mouseover', (el) => {
            tooltip.transition()
                .style('visibility', 'visible');

            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            tooltip.text(el.year + ' ' + months[el.month - 1] + ' : ' + el.variance);

            tooltip.attr('data-year', el.year);
        })
        .on('mouseout', () => {
            tooltip.transition()
                .style('visibility', 'hidden')
        });

};

req.open('GET', url, true);
req.onload = () => {
    let data = JSON.parse(req.responseText);
    temp = data.baseTemperature;
    values = data.monthlyVariance;

    canvas();
    getScales();
    generateCells();
    getAxes();
};
req.send();