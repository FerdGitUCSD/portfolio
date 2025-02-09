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
    createScatterplot();  
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
    addStat('TOTAL COMMITS', commits.length);
    addStat('FILES', d3.rollups(data, (v) => v.length, (d) => d.file).length);
    addStat('TOTAL <abbr title="Lines of Code">LOC</abbr>', data.length);
    addStat('MOST PRODUCTIVE <abbr title="Time of Day">TOD</abbr>', (() => {
        let mostProductiveHour = d3.rollups(commits, (v) => d3.sum(v, (d) => d.totalLines), (d) => Math.floor(d.hourFrac)).sort((a, b) => b[1] - a[1])[0][0];
        let period = mostProductiveHour >= 12 ? 'PM' : 'AM';
        let hour = mostProductiveHour % 12 || 12; // Convert to 12-hour format
        return `${hour} ${period}`;
    })());
    addStat('LONGEST LINE', d3.max(data, (d) => d.length));
    addStat('LONGEST FILE', d3.max(d3.rollups(data, (v) => v.length, (d) => d.file), (d) => d[1]));

}




// Step 2

function createScatterplot() {
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);


    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');

    // 2.2
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);
    
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const colorScale = d3.scaleLinear()
    .domain([0, 12, 24])  // Midnight (0) -> Noon (12) -> Midnight (24)
    .range(["#0f42d4", "#F59E0B", "#0f42d4"]); // Dark Blue -> Orange -> Dark Blue

    // Select all gridline elements and apply dynamic colors
    gridlines.selectAll('line')
        .attr('stroke', (d) => colorScale(d))  // Apply color based on time
        .attr('stroke-opacity', 0.6)  // Make lines more subtle
        .attr('stroke-width', 1.5);  // Keep lines thin for readability


      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
                .axisLeft(yScale)
                .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');;

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
    
    
}
