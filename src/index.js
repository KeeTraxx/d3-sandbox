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

  const groupByCanton = d3.nest()
    .key(d => d.abbreviation_canton);

  const groupedData = groupByCanton.entries(data.filter(d => d.total_currently_positive_cases));
  // [{key: "BE", values: [...], key: "ZH", values: [...]}]

  const groupedByDate = d3.nest()
    .key(d => d.date).entries(data);

  console.log('groupedData', groupedData);

  const chartElement = d3.select('main')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 500)
    .attr('viewBox', '0 0 960 500')
    .append('g')
    .attr('transform', 'translate(50,50)');

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0,900]);

  const xAxis = d3.axisBottom(x);

  chartElement
    .append('g')
    .attr('transform', 'translate(0,400)')
    .call(xAxis);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.total_currently_positive_cases))
    .range([400,0]);

  const yAxis = d3.axisLeft(y);

  chartElement
    .append('g')
    .call(yAxis);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.total_currently_positive_cases));

  chartElement
    .append('g')
    .selectAll('path')
    .data(groupedData)
    .join('path')
    .attr('d', d => line(d.values.filter(d => d.total_currently_positive_cases)))
    .style('stroke', (d, i) => d3.schemeCategory10[i%11]);

  chartElement
    .append('g')
    .selectAll('text')
    .data(groupedData)
    .join('text')
    .text(d => d.key)
    .attr('x', d => x(d.values[d.values.length-1].date))
    .attr('y', d => y(d.values[d.values.length-1].total_currently_positive_cases))
    .style('stroke', (d, i) => d3.schemeCategory10[i%11]);
    
};

main();