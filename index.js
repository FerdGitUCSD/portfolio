import { fetchJSON, renderProjects } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  }

const githubData = await fetchGitHubData('ferdgitUCSD');

const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
          <img src="https://avatars.githubusercontent.com/u/165683831?v=4" alt="GitHub Avatar" width="100">
          <dl>
            <dt>PUBLIC REPOS</dt><dd>${githubData.public_repos}</dd>
            <dt>FOLLOWERS</dt><dd>${githubData.followers}</dd>
            <dt>FOLLOWING</dt><dd>${githubData.following}</dd>
            <dt>PUBLIC GISTS</dt><dd>${githubData.public_gists}</dd>
          </dl>
      `;
  }

