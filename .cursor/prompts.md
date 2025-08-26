# Cursor AI Prompts for QS-Ext-Jump-Start

## Quick Start Prompts

### Development

- "Help me add a new property to the extension property panel"
- "Create a new Qlik Sense extension feature for [describe functionality]"
- "Debug this Nebula.js hook usage and suggest improvements"
- "Add error handling for this data processing function"

### D3.js Development

- "Create a D3.js [chart type] visualization integrated with Qlik selections"
- "Help me optimize this D3 chart for large datasets"
- "Add responsive design to this D3 visualization"
- "Implement zoom and pan functionality for this D3 chart"
- "Convert this basic chart to use D3.js with animations"
- "Add accessibility features to this D3 visualization"
- "Debug D3 selection integration with Qlik Sense"
- "Create interactive tooltips for this D3 chart"

### Testing

- "Write a Playwright test for [specific user interaction]"
- "Create test coverage for the selection state functionality"
- "Help me debug why this test is failing in the Nebula hub"
- "Add edge case tests for invalid configurations"

### Styling & UI

- "Improve the accessibility of this component"
- "Add responsive design to this extension layout"
- "Create a dark mode theme for the extension"
- "Optimize this CSS for better performance"

### Data & Performance

- "Optimize this hypercube query for large datasets"
- "Add data transformation logic for [specific use case]"
- "Implement efficient rendering for thousands of data points"
- "Add data validation and type checking"

## Project-Specific Context

When asking questions, include relevant context:

- Extension type (visualization, tool, etc.)
- Qlik Sense environment (Cloud/Enterprise)
- Data structure and requirements
- User interaction patterns
- Performance constraints

## Common Code Patterns

### Extension Structure

```javascript
// Main extension component pattern
export default function (env) {
  return {
    qae: {
      properties: objectProperties,
      data: dataConfig,
    },
    component: MyExtension,
  };
}
```

### Nebula Hooks Usage

```javascript
// Standard hook pattern
const MyExtension = () => {
  const element = useElement();
  const layout = useLayout();
  const selections = useSelections();

  // Component logic here
};
```

### Test Pattern

```javascript
// Playwright test structure
test('should handle [scenario]', async ({ page, qlikApp }) => {
  // Test implementation
});
```

## Tips for Better AI Responses

1. Be specific about the Qlik Sense feature you're working with
2. Include error messages or specific behavior you're seeing
3. Mention if this is for Cloud vs Enterprise environments
4. Specify browser compatibility requirements
5. Include accessibility or performance requirements
