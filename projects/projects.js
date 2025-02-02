import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');



// PIE CHART VISUALIZATION
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});


let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemePaired);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
})


let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // Set color dynamically
          .html(`<span class="swatch"></span> ${d.label} <span class="value">(${d.value})</span>`); // Wrap value in span
});



// SEARCH BAR

let query = '';

function setQuery(newQuery) {
    query = newQuery;
    // Two thing should happen for this function:
    // 1) filter projects based on <query>, how can we do this?
    // 2) return filtered projects
  }
  
let searchInput = document.getElementsByClassName('searchBar')[0];
  
  searchInput.addEventListener('change', (event) => {
    let updatedProjects = setQuery(event.target.value);
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
      });
  });
