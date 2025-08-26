import { useElement, useLayout, useEffect, useSelections } from '@nebula.js/stardust';
import * as d3 from 'd3';
import { safeGet } from '../utils';

/**
 * D3.js Bar Chart Extension Example
 *
 * This example demonstrates how to integrate D3.js with Nebula.js to create
 * interactive data visualizations in Qlik Sense extensions.
 *
 * Features:
 * - D3.js powered bar chart
 * - Responsive design
 * - Qlik selections integration
 * - Smooth animations
 * - Accessibility support
 *
 * @param {object} props Component props
 * @returns {JSX.Element} D3 Bar Chart component
 */
export default function D3BarChart() {
  const element = useElement();
  const layout = useLayout();
  const selections = useSelections();

  useEffect(() => {
    // Clear previous content
    element.innerHTML = '';

    try {
      // Validate configuration
      const dataMatrix = safeGet(layout, 'qHyperCube.qDataPages.0.qMatrix', []);
      if (!dataMatrix.length) {
        element.innerHTML = '<div class="no-data">No data available for D3 chart</div>';
        return;
      }

      // Extract data for D3
      const data = dataMatrix.map((row, index) => ({
        label: safeGet(row, '0.qText', `Item ${index + 1}`),
        value: safeGet(row, '1.qNum', 0),
        elem: safeGet(row, '0.qElemNumber', -1),
        selected: safeGet(row, '0.qState', '') === 'S',
      }));

      // Set up D3 dimensions
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const containerRect = element.getBoundingClientRect();
      const width = Math.max(400, containerRect.width - margin.left - margin.right);
      const height = Math.max(300, Math.min(400, containerRect.height - margin.top - margin.bottom));

      // Create SVG
      const svg = d3
        .select(element)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('role', 'img')
        .attr('aria-label', 'Interactive bar chart showing data from Qlik Sense');

      // Create main group
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Set up scales
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, width])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .range([height, 0]);

      // Create color scale for selections
      const colorScale = d3
        .scaleOrdinal()
        .domain(['default', 'selected', 'hover'])
        .range(['#4285f4', '#ea4335', '#34a853']);

      // Add axes
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      g.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

      // Add bars
      const bars = g
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.label))
        .attr('width', xScale.bandwidth())
        .attr('y', height) // Start from bottom for animation
        .attr('height', 0) // Start with 0 height for animation
        .attr('fill', (d) => colorScale(d.selected ? 'selected' : 'default'))
        .attr('cursor', 'pointer')
        .attr('role', 'button')
        .attr('tabindex', '0')
        .attr('aria-label', (d) => `${d.label}: ${d.value}. Click to select.`);

      // Animate bars
      bars
        .transition()
        .duration(750)
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => height - yScale(d.value));

      // Add interaction handlers
      bars
        .on('click', async function (event, d) {
          if (d.elem >= 0 && selections) {
            try {
              const inSelection = Boolean(safeGet(layout, 'qSelectionInfo.qInSelections', false));

              if (!inSelection && typeof selections.begin === 'function') {
                await selections.begin('/qHyperCubeDef');
              }

              await selections.select({
                method: 'selectHyperCubeValues',
                params: ['/qHyperCubeDef', 0, [d.elem], inSelection],
              });
            } catch (error) {
              console.warn('Selection failed:', error);
            }
          }
        })
        .on('mouseover', function (event, d) {
          if (!d.selected) {
            d3.select(this).transition().duration(200).attr('fill', colorScale('hover'));
          }

          // Show tooltip
          const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

          tooltip.transition().duration(200).style('opacity', 1);

          tooltip
            .html(`${d.label}<br/>Value: ${d.value}`)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        })
        .on('mouseout', function (event, d) {
          if (!d.selected) {
            d3.select(this).transition().duration(200).attr('fill', colorScale('default'));
          }

          // Remove tooltip
          d3.selectAll('.d3-tooltip').remove();
        })
        .on('keydown', function (event, d) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            d3.select(this).dispatch('click');
          }
        });

      // Add chart title
      svg
        .append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('D3.js Bar Chart');

      // Add axis labels
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 + margin.left / 3)
        .attr('x', 0 - (height + margin.top) / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Value');

      svg
        .append('text')
        .attr(
          'transform',
          `translate(${(width + margin.left + margin.right) / 2}, ${height + margin.top + margin.bottom - 5})`
        )
        .style('text-anchor', 'middle')
        .text('Category');
    } catch (error) {
      console.error('D3 Chart rendering error:', error);
      element.innerHTML = `
        <div class="error-message" role="alert">
          <h3>Error rendering D3 chart</h3>
          <p>Please check your data configuration and try again.</p>
        </div>
      `;
    }
  }, [element, layout]);

  return null; // Component renders directly to DOM via D3
}
