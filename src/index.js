import 'regenerator-runtime/runtime'
import './styles.scss'
import * as d3 from 'd3'
import {fetchCovidData} from './datafetcher';

// expose d3 for dev console.
window.d3 = d3;

async function main() {
  // Load data
  const data = await fetchCovidData();

  // ### Start hacking here ###
  console.log(data);

  const positiveCasesByCanton = d3.nest()
    .key(d => d.abbreviation_canton)
    .rollup(values => d3.max(values, d => d.total_currently_positive_cases))
    .entries(data);

  console.log(positiveCasesByCanton);

  const groupByCanton = d3.nest()
  .key(d => d.abbreviation_canton);

  const groupedData = groupByCanton.entries(data);
  // [{key: "BE", values: [...], key: "ZH", values: [...]}]

  const groupedObject = groupByCanton.object(data);
  // {BE: [...], ZH: [...]}

  const aggregator = d3.nest()
  .key(d => d.abbreviation_canton)
  .rollup(values => d3.max(values, d => d.total_currently_positive_cases));

  const totalCasesByCanton = aggregator.entries(data)
    .sort((a,b) => d3.descending(a.value, b.value));
  // [{key: "BE", value: 259}, {key: "ZH", value: 542}]

  console.log(totalCasesByCanton);

  const linearColor = d3.scaleLinear()
    .domain(d3.extent(totalCasesByCanton, d => d.value))
    .range(['green', 'red']);

  const thresholdColor = d3.scaleThreshold()
    .domain([10, 300])
    .range(['green', 'yellow' ,'red']);

  const quantizeColor = d3.scaleQuantize()
    .domain(d3.extent(totalCasesByCanton, d => d.value))
    .range(['green', 'yellow' ,'red']);

  const quantileColor = d3.scaleQuantile()
    .domain(totalCasesByCanton.map(d => d.value))
    .range(['green', 'yellow' ,'red']);

  const bubbleSize = d3.scaleLinear()
    .domain(d3.extent(totalCasesByCanton, d => d.value))
    .range([10, 100]);

  const simulation = d3.forceSimulation(totalCasesByCanton)
    .force('collide', d3.forceCollide().strength(0.5).radius(d => bubbleSize(d.value) * 1.1))
    .force('centerX', d3.forceX().strength(0.01))
    .force('centerY', d3.forceY().strength(0.01))
    //.force('manybody', d3.forceManyBody().strength(30));
  
  d3.select('main')
    .append('svg')
    .attr('width', 640)
    .attr('height', 480)
    .attr('viewBox', '-320 -240 640 480')
    .selectAll('g')
    .data(totalCasesByCanton)
    .join('g')
    .call(g => {
      g.append('circle')
        .attr('r', d => bubbleSize(d.value))
        .attr('fill', d => quantizeColor(d.value));
      g.append('text').text(d => d.key);
      return g
    })
    .call(d3.drag().on('start', d => {
      if (!d3.event.active) simulation.alphaTarget(1).restart();
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    })
    .on('drag', d => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }).on('end', d => {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null
      d.fy = null
      
    }))
  simulation.on('tick', () => {
    d3.select('svg')
      .selectAll('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
  });

};

main();