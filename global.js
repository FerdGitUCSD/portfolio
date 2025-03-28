console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);

  let url = form.action + '?';

  for (let [name, value] of data) {
    url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
  }

  location.href = url;
});

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
              <option value="light dark">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>`
);

let select = document.querySelector('.color-scheme select');

if (localStorage.colorScheme) {
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  select.value = localStorage.colorScheme;
} else {
  select.value = "light dark";
}

select.addEventListener('input', function (event) {
  const selectedScheme = event.target.value;
  console.log('color scheme changed to', selectedScheme);

  localStorage.colorScheme = selectedScheme;

  document.documentElement.style.setProperty('color-scheme', selectedScheme);
});


let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume'},
    { url: 'contact/', title: 'Contact'},
    { url: 'https://github.com/FerdGitUCSD/', title: 'Profile'},
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
  let url = p.url.startsWith('http') // Handle absolute URLs
    ? p.url
    : ARE_WE_HOME // Handle links on the home page
    ? p.url
    : '../' + p.url; // Prepend "../" for non-home pages
  let title = p.title;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  if (a.host !== location.host) {
    a.target = "_blank";
  }
}






let navLinks = Array.from(nav.querySelectorAll('a'));

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink?.classList.add('current');
}



export async function fetchJSON(url) {
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Fetched data:', data); 
      return data;
    } catch (error) {
      if (url.startsWith('../')) {
        const new_url = url.substring(3)
        const response = await fetch(new_url);
        const data = await response.json();
        console.log('Fetched data:', data); 
        return data;
      }
      console.error('Error fetching or parsing JSON data:', error);
    }
  }

// const projects = fetchJSON("../lib/projects.json")


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel)) {
      console.warn(`Invalid heading level: "${headingLevel}". Defaulting to "h2".`);
      headingLevel = 'h2'; // Set fallback to h2
  }
  
  containerElement.innerHTML = ''; 

  for (let project of projects) { 
      const article = document.createElement('article');
      
      // Create the project title
      const heading = document.createElement(headingLevel);
      heading.textContent = project.title;
      article.appendChild(heading);
      
      // Add the image if it exists
      if (project.image) {
          const img = document.createElement('img');
          img.src = project.image;
          img.alt = project.title;
          article.appendChild(img);
      }
      
      // Add the description
      const description = document.createElement('p');
      description.textContent = project.description;
      article.appendChild(description);
      
      // Add the link with blue button styling
      if (project.url && project.url !== '#') {
          const linkContainer = document.createElement('div');
          linkContainer.className = 'button-container';
          
          const link = document.createElement('a');
          link.href = project.url;
          link.className = 'button-link';
          link.textContent = 'Link';
          
          linkContainer.appendChild(link);
          article.appendChild(linkContainer);
      }
      
      // Add the year
      const yearText = document.createElement('p');
      yearText.className = 'project-year';
      yearText.textContent = `c. ${project.year}`;
      article.appendChild(yearText);
      
      containerElement.appendChild(article);
  }
}
 