console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume'},
    { url: 'contact/', title: 'Contact'},
    { url: 'https://github.com/FerdGitUCSD/', title: 'Profile'},
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}

let navLinks = $$(nav.querySelectorAll('a'));

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink?.classList.add('current');
}