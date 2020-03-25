import 'regenerator-runtime/runtime'
import './styles.scss'
import * as d3 from 'd3'

// expose d3 for dev console.
window.d3 = d3;

async function main() {
  // Load data
  const data = await fetchAndTransformData();


  // ### Start hacking here ###
  console.log(data);
  
};

async function fetchAndTransformData() {
  const rawData = await d3.csv('https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid_19_cases_switzerland_standard_format.csv');
  const data = rawData.map(row => {
    for (const k in row) {
      switch (k) {
        case "date":
            row[k] = new Date(row[k]);
          break;
        case "country":
        case "abbreviation_canton":
        case "name_canton":
          // Don't change strings
          break;
        default:
          // Try to parse a number
          const value = parseFloat(row[k]);
          // Empty strings and unparsable values are mapped to 'undefined'
          row[k] = Number.isNaN(value) ? undefined : value;
      }
    }
    return row;
  });
  return data;
}


main();