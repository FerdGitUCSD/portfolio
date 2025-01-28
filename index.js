import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  }

const githubData = await fetchGitHubData('giorgianicolaou');

const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>PUBLIC REPOS</dt><dd>${githubData.public_repos}</dd>
            <dt>FOLLOWERS</dt><dd>${githubData.followers}</dd>
            <dt>FOLLOWING</dt><dd>${githubData.following}</dd>
            <dt>PUBLIC GISTS</dt><dd>${githubData.public_gists}</dd>
          </dl>
      `;
  }

