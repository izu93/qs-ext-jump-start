// Example Extensions for QS-Ext-Jump-Start
//
// This file exports different extension examples that demonstrate
// various Qlik Sense + Nebula.js + D3.js patterns

import D3BarChart from './d3-bar-chart';
import D3ScatterPlot from './d3-scatter-plot';

/**
 * Available extension examples
 *
 * To use a different example, modify the main src/index.js file
 * to import and use one of these examples instead of the default
 * selections example.
 */
export const examples = {
  'd3-bar-chart': D3BarChart,
  'd3-scatter-plot': D3ScatterPlot,
};

/**
 * Get an example by name
 * @param {string} name - Name of the example to get
 * @returns {Function} The example component function
 */
export function getExample(name) {
  return examples[name];
}

/**
 * List all available example names
 * @returns {string[]} Array of example names
 */
export function listExamples() {
  return Object.keys(examples);
}

export { D3BarChart, D3ScatterPlot };
