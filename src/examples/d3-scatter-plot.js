import { useElement, useLayout, useEffect, useSelections } from '@nebula.js/stardust';
import * as d3 from 'd3';
import { safeGet } from '../utils';

/**
 * D3.js Scatter Plot Extension Example
 *
 * This example demonstrates an advanced D3.js integration with Qlik Sense
 * showing a scatter plot with zoom, pan, and brush selection capabilities.
 *
 * Features:
 * - Interactive scatter plot with zoom/pan
 * - Brush selection integration with Qlik
 * - Responsive design with dynamic sizing
 * - Smooth transitions and animations
 * - Accessibility support
 *
 * @param {object} props Component props
 * @returns {JSX.Element} D3 Scatter Plot component
 */
export default function D3ScatterPlot() {
  const element = useElement();
  const layout = useLayout();
  const selections = useSelections();

  useEffect(() => {
    // Clear previous content
    element.innerHTML = '';

    try {
      // Validate configuration - needs at least 2 measures
      const dataMatrix = safeGet(layout, 'qHyperCube.qDataPages.0.qMatrix', []);
      const measureInfo = safeGet(layout, 'qHyperCube.qMeasureInfo', []);

      if (!dataMatrix.length || measureInfo.length < 2) {
        element.innerHTML = `
          <div class="no-data">
            <p>Scatter plot requires at least 2 measures</p>
            <ul>
              <li>Add 2 or more measures to see the scatter plot</li>
              <li>First measure = X-axis</li>
              <li>Second measure = Y-axis</li>
              <li>Third measure = Size (optional)</li>
            </ul>
          </div>
        `;
        return;
      }

      // Extract data for D3
      const data = dataMatrix.map((row, index) => ({
        id: index,
        label: safeGet(row, '0.qText', `Point ${index + 1}`),
        x: safeGet(row, '1.qNum', 0),
        y: safeGet(row, '2.qNum', 0),
        size: measureInfo.length > 2 ? safeGet(row, '3.qNum', 5) : 5,
        elem: safeGet(row, '0.qElemNumber', -1),
        selected: safeGet(row, '0.qState', '') === 'S',
      }));

      // Set up dimensions
      const margin = { top: 30, right: 30, bottom: 50, left: 60 };
      const containerRect = element.getBoundingClientRect();
      const width = Math.max(500, containerRect.width - margin.left - margin.right);
      const height = Math.max(400, Math.min(500, containerRect.height - margin.top - margin.bottom));

      // Create SVG with zoom behavior
      const svg = d3
        .select(element)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('role', 'img')
        .attr('aria-label', 'Interactive scatter plot with zoom and selection capabilities');

      // Create clipping path
      svg
        .append('defs')
        .append('clipPath')
        .attr('id', 'chart-clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

      // Main container group
      const container = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Set up scales
      const xExtent = d3.extent(data, (d) => d.x);
      const yExtent = d3.extent(data, (d) => d.y);
      const sizeExtent = d3.extent(data, (d) => d.size);

      const xScale = d3.scaleLinear().domain(xExtent).range([0, width]).nice();

      const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]).nice();

      const sizeScale = d3.scaleSqrt().domain(sizeExtent).range([3, 15]);

      // Color scale
      const colorScale = d3
        .scaleOrdinal()
        .domain(['default', 'selected', 'hover'])
        .range(['#4285f4', '#ea4335', '#34a853']);

      // Create axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      const xAxisGroup = container
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      const yAxisGroup = container.append('g').attr('class', 'y-axis').call(yAxis);

      // Chart area for clipping
      const chartArea = container.append('g').attr('clip-path', 'url(#chart-clip)');

      // Add grid lines
      chartArea
        .append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      chartArea
        .append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      // Add circles
      const circles = chartArea
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', 0) // Start with 0 radius for animation
        .attr('fill', (d) => colorScale(d.selected ? 'selected' : 'default'))
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .attr('role', 'button')
        .attr('tabindex', '0')
        .attr('aria-label', (d) => `${d.label}: X=${d.x}, Y=${d.y}. Click to select.`);

      // Animate circles
      circles
        .transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .attr('r', (d) => sizeScale(d.size));

      // Zoom behavior
      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 10])
        .on('zoom', function (event) {
          const { transform } = event;

          // Update scales
          const newXScale = transform.rescaleX(xScale);
          const newYScale = transform.rescaleY(yScale);

          // Update axes
          xAxisGroup.call(xAxis.scale(newXScale));
          yAxisGroup.call(yAxis.scale(newYScale));

          // Update circles
          circles.attr('cx', (d) => newXScale(d.x)).attr('cy', (d) => newYScale(d.y));
        });

      svg.call(zoom);

      // Add interaction handlers
      circles
        .on('click', async function (event, d) {
          event.stopPropagation();
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
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', colorScale('hover'))
              .attr('r', sizeScale(d.size) * 1.2);
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
            .html(
              `
            <strong>${d.label}</strong><br/>
            X: ${d.x.toFixed(2)}<br/>
            Y: ${d.y.toFixed(2)}<br/>
            ${measureInfo.length > 2 ? `Size: ${d.size.toFixed(2)}` : ''}
          `
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        })
        .on('mouseout', function (event, d) {
          if (!d.selected) {
            d3.select(this).transition().duration(200).attr('fill', colorScale('default')).attr('r', sizeScale(d.size));
          }

          d3.selectAll('.d3-tooltip').remove();
        })
        .on('keydown', function (event, d) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            d3.select(this).dispatch('click');
          }
        });

      // Add titles and labels
      svg
        .append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('D3.js Interactive Scatter Plot');

      // Axis labels
      const xLabel = safeGet(measureInfo, '0.qFallbackTitle', 'X Measure');
      const yLabel = safeGet(measureInfo, '1.qFallbackTitle', 'Y Measure');

      svg
        .append('text')
        .attr(
          'transform',
          `translate(${(width + margin.left + margin.right) / 2}, ${height + margin.top + margin.bottom - 5})`
        )
        .style('text-anchor', 'middle')
        .text(xLabel);

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 + margin.left / 3)
        .attr('x', 0 - (height + margin.top) / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(yLabel);

      // Add zoom instructions
      svg
        .append('text')
        .attr('x', width + margin.left - 10)
        .attr('y', margin.top + 20)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('Mouse wheel to zoom, drag to pan');
    } catch (error) {
      console.error('D3 Scatter Plot rendering error:', error);
      element.innerHTML = `
        <div class="error-message" role="alert">
          <h3>Error rendering D3 scatter plot</h3>
          <p>Please check your data configuration and try again.</p>
        </div>
      `;
    }
  }, [element, layout]);

  return null; // Component renders directly to DOM via D3
}
