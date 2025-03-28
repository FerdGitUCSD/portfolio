import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchJSON} from '../global.js';


// Updated renderProjects function to separate projects with and without images
export function renderProjects(projects, container, headingTag = 'h3') {
  // Clear the container
  container.innerHTML = '';
  
  // Create two separate containers
  const withImagesContainer = document.createElement('div');
  withImagesContainer.className = 'projects with-images';
  
  const withoutImagesContainer = document.createElement('div');
  withoutImagesContainer.className = 'projects without-images';
  
  // Add section headers
  const withImagesHeader = document.createElement('h2');
  withImagesHeader.textContent = 'Featured Projects';
  withImagesHeader.className = 'section-header';
  
  const withoutImagesHeader = document.createElement('h2');
  withoutImagesHeader.textContent = 'Other Projects';
  withoutImagesHeader.className = 'section-header';
  
  // Separate projects into two arrays
  const projectsWithImages = projects.filter(project => 
    project.image && 
    !project.image.includes('empty.svg') && 
    !project.image.includes('IMAGE COMING SOON')
  );
  
  const projectsWithoutImages = projects.filter(project => 
    !project.image || 
    project.image.includes('empty.svg') || 
    project.image.includes('IMAGE COMING SOON')
  );
  
      // Render projects with images
  projectsWithImages.forEach(project => {
    const article = document.createElement('article');
    
    const heading = document.createElement(headingTag);
    heading.textContent = project.title;
    article.appendChild(heading);
    
    if (project.image) {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'img-container';
      
      // Create a style element to restrict image size
      const imgStyle = document.createElement('style');
      const uniqueClass = `img-${Math.random().toString(36).substring(2, 10)}`;
      imgStyle.textContent = `.${uniqueClass} { max-width: 100%; height: auto; max-height: 150px; display: block; }`;
      document.head.appendChild(imgStyle);
      
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;
      img.width = 200; // Explicitly set width attribute
      img.height = 150; // Explicitly set height attribute
      img.className = uniqueClass;
      img.loading = 'lazy';
      img.style.objectFit = 'contain';
      
      imgContainer.appendChild(img);
      article.appendChild(imgContainer);
    }
    
    const description = document.createElement('p');
    description.textContent = project.description;
    article.appendChild(description);
    
    if (project.url && project.url !== '#') {
      const link = document.createElement('a');
      link.textContent = 'Link';
      link.href = project.url;
      link.className = 'project-link';
      article.appendChild(link);
    }
    
    const year = document.createElement('p');
    year.textContent = `c. ${project.year}`;
    year.className = 'project-year';
    article.appendChild(year);
    
    withImagesContainer.appendChild(article);
  });
  
  // Render projects without images
  projectsWithoutImages.forEach(project => {
    const article = document.createElement('article');
    article.className = 'no-image-project';
    
    const heading = document.createElement(headingTag);
    heading.textContent = project.title;
    article.appendChild(heading);
    
    const description = document.createElement('p');
    description.textContent = project.description;
    article.appendChild(description);
    
    if (project.url && project.url !== '#') {
      const link = document.createElement('a');
      link.textContent = 'Link';
      link.href = project.url;
      link.className = 'project-link';
      article.appendChild(link);
    }
    
    const year = document.createElement('p');
    year.textContent = `c. ${project.year}`;
    year.className = 'project-year';
    article.appendChild(year);
    
    withoutImagesContainer.appendChild(article);
  });
  
  // Only append sections if they have content
  if (projectsWithImages.length > 0) {
    container.appendChild(withImagesHeader);
    container.appendChild(withImagesContainer);
  }
  
  if (projectsWithoutImages.length > 0) {
    container.appendChild(withoutImagesHeader);
    container.appendChild(withoutImagesContainer);
  }
  
  // If no projects found, show a message
  if (projects.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = 'No projects found matching your search.';
    noResults.className = 'no-results';
    container.appendChild(noResults);
  }
}

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