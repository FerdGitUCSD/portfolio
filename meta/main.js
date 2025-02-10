let data = [];
let xScale;
let yScale;

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

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);


    const dots = svg.append('g').attr('class', 'dots');
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 30]); // adjust these values based on your experimentation
    
    dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
    .on('mouseleave', () => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        updateTooltipContent({});
        updateTooltipVisibility(false);
      });

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
    
    brushSelector();
    
}


// Step 3

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const lines = document.getElementById('commit-lines');

  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
    time.textContent = commit.time;
    lines.textContent = commit.totalLines;
  }

// 3.3

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }



// Step 5

function brushSelector() {
    const svg = d3.select('svg');

    // Create the brush
    const brush = d3.brush()
        .on("start brush end", brushed);

    svg.call(brush);

    // Raise dots and everything after overlay
    d3.selectAll('.dots, .overlay ~ *').raise();
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  
  updateSelectionCount();
}

function isCommitSelected(commit) {
    if (!brushSelection) return false; 
    const min = {
        x: brushSelection[0][0], y: brushSelection[0][1] 
    }; 
    const max = {
        x: brushSelection[1][0], y: brushSelection[1][1] };
        const x = xScale(commit.date);
        const y = yScale(commit.hourFrac);
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y; 
    } 

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}


function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}