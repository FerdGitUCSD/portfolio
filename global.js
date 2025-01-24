console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

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

let navLinks = $$(nav.querySelectorAll('a'));

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink?.classList.add('current');
}

/*
const form = document.querySelector('#my-form');

form?.addEventListener('submit', function (event) {
  // Prevent default form submission
  event.preventDefault();

  // Create FormData object
  const data = new FormData(form);

  // Start building the mailto URL
  let mailtoURL = 'mailto:fdanese@ucsd.edu?';
  let params = [];

  // Iterate over form data and encode the parameters
  for (let [name, value] of data) {
    if (value.trim() !== "") { // Skip empty fields
      let encodedName = encodeURIComponent(name);
      let encodedValue = encodeURIComponent(value);
      params.push(`${encodedName}=${encodedValue}`);
    }
  }

  // Append parameters to the URL
  mailtoURL += params.join('&');

  // Log the URL for debugging
  console.log('Generated mailto URL:', mailtoURL);

  // Open the mail client with the constructed URL
  window.location.href = mailtoURL;
});
*/