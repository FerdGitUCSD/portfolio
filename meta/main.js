let data = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    processCommits();
    displayStats();
    console.log(commits);
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});



let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
  
        return {
          id: commit,
          url: 'https://github.com/FerdGitUCSD/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          // Calculate hour as a decimal for time analysis
          // e.g., 2:30 PM = 14.5
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          // How many lines were modified?
          totalLines: lines.length,
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            // What other options do we need to set?
            // Hint: look up configurable, writable, and enumerable
            configurable: true,
            writable: true,
            enumerable: true,
          });
    
          return ret;
      });
}


function displayStats() {
    // Process commits first
    processCommits();

    // Select the stats container and create a definition list (`dl`)
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Function to append dt (label) and dd (value) pairs
    function addStat(label, value) {
        dl.append('dt').html(label);
        dl.append('dd').text(value);
    }

    // Add stats
    addStat('Total commits', commits.length);
    addStat('Files', d3.rollups(data, (v) => v.length, (d) => d.file).length);
    addStat('Total <abbr title="Lines of Code">LOC</abbr>', data.length);
    addStat('Max Depth', d3.max(data, (d) => d.depth));
    addStat('Longest Line', d3.max(data, (d) => d.length));
    addStat('Max Lines in a single file', d3.max(d3.rollups(data, (v) => v.length, (d) => d.file), (d) => d[1]));

}
