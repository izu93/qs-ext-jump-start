# D3.js Development Guide for QS-Ext-Jump-Start

This guide explains how to build advanced data visualizations using D3.js within Qlik Sense extensions using the Nebula.js framework.

## Table of Contents

- [Overview](#overview)
- [Getting Started with D3](#getting-started-with-d3)
- [Available Examples](#available-examples)
- [Integration Patterns](#integration-patterns)
- [Best Practices](#best-practices)
- [Common Use Cases](#common-use-cases)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

D3.js (Data-Driven Documents) is a powerful JavaScript library for creating dynamic, interactive data visualizations. This template provides seamless integration between D3.js, Nebula.js, and Qlik Sense, allowing you to create sophisticated visualizations while maintaining full integration with Qlik's selection and data model.

### Why D3.js with Qlik Sense?

- **Custom Visualizations**: Create unique charts not available in standard Qlik objects
- **Advanced Interactions**: Build complex user interactions and animations
- **Full Control**: Complete control over visual design and behavior
- **Responsive Design**: Create visualizations that adapt to any screen size
- **Accessibility**: Build inclusive visualizations with proper ARIA support

## Getting Started with D3

### Prerequisites

The template already includes D3.js as a dependency. The current setup includes:

```json
{
  "dependencies": {
    "d3": "^7.8.5"
  }
}
```

### Basic D3 + Nebula Pattern

```javascript
import { useElement, useLayout, useEffect, useSelections } from '@nebula.js/stardust';
import * as d3 from 'd3';
import { safeGet } from '../utils';

export default function MyD3Extension() {
  const element = useElement();
  const layout = useLayout();
  const selections = useSelections();

  useEffect(() => {
    // Clear previous content
    element.innerHTML = '';

    try {
      // Get data from Qlik hypercube
      const dataMatrix = safeGet(layout, 'qHyperCube.qDataPages.0.qMatrix', []);

      // Transform data for D3
      const data = dataMatrix.map((row) => ({
        label: safeGet(row, '0.qText', ''),
        value: safeGet(row, '1.qNum', 0),
        elem: safeGet(row, '0.qElemNumber', -1),
      }));

      // Create D3 visualization
      const svg = d3.select(element).append('svg').attr('width', 400).attr('height', 300);

      // Build your D3 chart here...
    } catch (error) {
      console.error('D3 rendering error:', error);
    }
  }, [element, layout]);

  return null; // Component renders directly to DOM via D3
}
```

## Available Examples

### 1. D3 Bar Chart (`src/examples/d3-bar-chart.js`)

**Features:**

- Interactive bar chart with smooth animations
- Qlik selections integration
- Responsive design
- Hover tooltips
- Accessibility support

**Data Requirements:**

- 1 dimension (categories)
- 1 measure (values)

**Usage:**

```javascript
import { D3BarChart } from './examples';
// Use D3BarChart as your component
```

### 2. D3 Scatter Plot (`src/examples/d3-scatter-plot.js`)

**Features:**

- Interactive scatter plot with zoom and pan
- Brush selection capabilities
- Multi-measure support (X, Y, Size)
- Advanced tooltips
- Grid lines and axis labels

**Data Requirements:**

- 1 dimension (point labels)
- 2+ measures (X-axis, Y-axis, optionally size)

**Usage:**

```javascript
import { D3ScatterPlot } from './examples';
// Use D3ScatterPlot as your component
```

## Integration Patterns

### 1. Data Transformation

Always transform Qlik data into D3-friendly format:

```javascript
const data = dataMatrix.map((row, index) => ({
  id: index,
  label: safeGet(row, '0.qText', `Item ${index + 1}`),
  value: safeGet(row, '1.qNum', 0),
  elem: safeGet(row, '0.qElemNumber', -1), // For selections
  selected: safeGet(row, '0.qState', '') === 'S',
}));
```

### 2. Qlik Selections Integration

```javascript
// Handle click events for selections
.on('click', async function(event, d) {
  if (d.elem >= 0 && selections) {
    try {
      const inSelection = Boolean(safeGet(layout, 'qSelectionInfo.qInSelections', false));

      if (!inSelection && typeof selections.begin === 'function') {
        await selections.begin('/qHyperCubeDef');
      }

      await selections.select({
        method: 'selectHyperCubeValues',
        params: ['/qHyperCubeDef', 0, [d.elem], inSelection]
      });
    } catch (error) {
      console.warn('Selection failed:', error);
    }
  }
});
```

### 3. Responsive Design

```javascript
// Get container dimensions
const containerRect = element.getBoundingClientRect();
const width = Math.max(400, containerRect.width - margin.left - margin.right);
const height = Math.max(300, Math.min(400, containerRect.height - margin.top - margin.bottom));

// Create responsive SVG
const svg = d3
  .select(element)
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .style('max-width', '100%')
  .style('height', 'auto');
```

### 4. Accessibility Support

```javascript
// Add ARIA attributes
const svg = d3
  .select(element)
  .append('svg')
  .attr('role', 'img')
  .attr('aria-label', 'Interactive chart showing data from Qlik Sense');

// Add keyboard navigation
circles
  .attr('tabindex', '0')
  .attr('aria-label', (d) => `${d.label}: ${d.value}. Click to select.`)
  .on('keydown', function (event, d) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      d3.select(this).dispatch('click');
    }
  });
```

## Best Practices

### 1. Data Validation

Always validate your data before rendering:

```javascript
// Check for minimum data requirements
if (!dataMatrix.length) {
  element.innerHTML = '<div class="no-data">No data available</div>';
  return;
}

// Validate measure count for specific chart types
const measureInfo = safeGet(layout, 'qHyperCube.qMeasureInfo', []);
if (measureInfo.length < 2) {
  element.innerHTML = '<div class="no-data">Scatter plot requires at least 2 measures</div>';
  return;
}
```

### 2. Error Handling

Wrap D3 rendering in try-catch blocks:

```javascript
try {
  // D3 rendering code
} catch (error) {
  console.error('D3 rendering error:', error);
  element.innerHTML = `
    <div class="error-message" role="alert">
      <h3>Error rendering chart</h3>
      <p>Please check your data configuration and try again.</p>
    </div>
  `;
}
```

### 3. Memory Management

Clean up D3 elements and event listeners:

```javascript
useEffect(() => {
  // Clear previous content and event listeners
  element.innerHTML = '';
  d3.select(element).selectAll('*').remove();

  // Your D3 code here...

  // Cleanup function
  return () => {
    d3.select(element).selectAll('*').remove();
    d3.selectAll('.d3-tooltip').remove(); // Remove any orphaned tooltips
  };
}, [element, layout]);
```

### 4. Transitions and Animations

Use D3 transitions for smooth updates:

```javascript
// Animate bars entering
bars
  .enter()
  .append('rect')
  .attr('y', height)
  .attr('height', 0)
  .transition()
  .duration(750)
  .attr('y', (d) => yScale(d.value))
  .attr('height', (d) => height - yScale(d.value));

// Handle reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = prefersReducedMotion ? 0 : 750;
```

## Common Use Cases

### 1. Custom Chart Types

- Network diagrams
- Sankey diagrams
- Tree maps
- Custom geographic visualizations
- Advanced statistical charts

### 2. Interactive Features

- Zoom and pan capabilities
- Brush selection
- Drill-down interactions
- Dynamic filtering
- Real-time updates

### 3. Advanced Styling

- Custom color schemes
- Gradient effects
- SVG patterns and textures
- CSS animations
- Responsive typography

## Performance Optimization

### 1. Large Datasets

```javascript
// Use virtual scrolling for large datasets
// Implement data pagination
// Use canvas rendering for thousands of points

// Example: Switch to canvas for large datasets
const useCanvas = data.length > 1000;
const container = useCanvas ? d3.select(element).append('canvas') : d3.select(element).append('svg');
```

### 2. Efficient Updates

```javascript
// Use D3's data join pattern for efficient updates
const circles = g.selectAll('.dot').data(data, (d) => d.id); // Use key function for efficient joins

circles.exit().remove(); // Remove old elements
circles.enter().append('circle').attr('class', 'dot'); // Add new elements
circles.attr('cx', (d) => xScale(d.x)).attr('cy', (d) => yScale(d.y)); // Update all
```

### 3. Debounced Interactions

```javascript
// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(redrawChart, 250);
});
```

## Troubleshooting

### Common Issues

1. **SVG not displaying**
   - Check container dimensions
   - Verify SVG viewBox settings
   - Ensure proper CSS styling

2. **Selections not working**
   - Verify `qElemNumber` values
   - Check selection API usage
   - Ensure proper error handling

3. **Performance issues**
   - Limit data points rendered
   - Use efficient D3 patterns
   - Implement virtualization for large datasets

4. **Responsive issues**
   - Use proper viewBox settings
   - Implement container queries
   - Test on various screen sizes

### Debug Tools

```javascript
// Debug data structure
console.log('Data Matrix:', dataMatrix);
console.log('Transformed Data:', data);
console.log('Layout Info:', layout);

// Visual debugging
svg
  .append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'none')
  .attr('stroke', 'red')
  .attr('stroke-width', 2); // Visual boundary
```

## Next Steps

1. **Explore Examples**: Start with the provided bar chart and scatter plot examples
2. **Customize**: Modify the examples to fit your specific use case
3. **Add Tests**: Create Playwright tests for your D3 visualizations
4. **Performance**: Optimize for your expected data sizes
5. **Deploy**: Package and deploy your custom D3 extension

## Resources

- [D3.js Documentation](https://d3js.org/)
- [D3.js Gallery](https://observablehq.com/@d3/gallery)
- [Qlik Developer Portal](https://qlik.dev/)
- [Nebula.js Documentation](https://qlik.dev/extend/)
- [Observable D3 Examples](https://observablehq.com/collection/@d3/charts)

For more specific guidance on Cursor IDE development with D3, see [CURSOR_SETUP.md](./CURSOR_SETUP.md).
