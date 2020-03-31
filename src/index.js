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
};

main();