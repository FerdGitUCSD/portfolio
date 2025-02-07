import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

let query = '';
let selectedIndex = -1;

function setQuery(newQuery) {
  query = newQuery.toLowerCase(); 
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });
}

function recalculate(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );
  return newRolledData.map(([year, count]) => ({
    value: count,
    label: year.toString()
  }));
}

function embedArcClick(arcsGiven, projectsGiven, dataGiven) {
  const svg = d3.select('svg');
  const legend = d3.select('.legend');
  
  svg.selectAll('path').remove();
  legend.html('');

  arcsGiven.forEach((arc, i) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', d3.schemePaired[i])
      .style('cursor', 'pointer')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        
        svg.selectAll('path').each(function(_, idx) {
          d3.select(this).classed('selected', idx === selectedIndex);
        });
        
        legend.selectAll('li').each(function(_, idx) {
          d3.select(this).classed('selected-legend', idx === selectedIndex);
        });

        if (selectedIndex !== -1) {
          const selectedYear = dataGiven[selectedIndex].label;
          const filteredProjects = projectsGiven.filter(project => 
            project.year.toString() === selectedYear
          );
          
          renderProjects(filteredProjects, projectsContainer, 'h2');
          if (projectsTitle) {
            projectsTitle.innerHTML = `${filteredProjects.length} Projects`;
          }

          legend.html('');
          const newData = recalculate(filteredProjects);
          newData.forEach((d) => {
            legend.append('li')
              .attr('style', '--color:#d0457c')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
          });
        } else {
          renderProjects(projectsGiven, projectsContainer, 'h2');
          if (projectsTitle) {
            projectsTitle.innerHTML = `${projectsGiven.length} Projects`;
          }

          legend.html('');
          const newData = recalculate(projectsGiven);
          newData.forEach((d, idx) => {
            legend.append('li')
              .attr('style', `--color:${d3.schemePaired[idx]}`)
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
          });
        }
      });
  });

  dataGiven.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${d3.schemePaired[i]}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

function renderPieChartAndLegend(projects) {
  const data = recalculate(projects);
  
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map(d => arcGenerator(d));

  embedArcClick(arcs, projects, data);
}

renderProjects(projects, projectsContainer, 'h2');
if (projectsTitle) {
  projectsTitle.innerHTML = `${projects.length} Projects`;
}
renderPieChartAndLegend(projects);

const searchInput = document.getElementsByClassName('searchBar')[0];
searchInput.addEventListener('input', (event) => {
  const filteredProjects = setQuery(event.target.value);
  selectedIndex = -1; 
  
  renderProjects(filteredProjects, projectsContainer, 'h2');
  if (projectsTitle) {
    projectsTitle.innerHTML = `${filteredProjects.length} Projects`;
  }
  renderPieChartAndLegend(filteredProjects);
});