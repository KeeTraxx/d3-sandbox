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

    d3.select('main') // select the first html <main> tag
    .append('table') // append an <ul> tag
    .selectAll('tr') // for all all <li> tags...
    .data(totalCasesByCanton) // ... bind the data array to the DOM elements
    .join('tr')
    .call(tr => {
      tr.append('td').text(d => d.key);
      tr.append('td').text(d => d.value);
    })
    .style('opacity', 0)
    .style('transform', 'translate(80px,0)rotate(30deg)')
    .transition()
    .delay((d,i) => i * 100) // delay by 100 ms * index
    .style('opacity', 1)
    .style('transform', 'translate(0,0)')
    .transition()
    .duration(2500)
    .style('background-color', d => quantileColor(d.value)); // try out other scales!

};

main();