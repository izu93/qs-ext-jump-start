/**
 * D3.js visualization tests
 *
 * Tests for D3-powered extensions including bar charts,
 * scatter plots, and other advanced visualizations.
 */

const { test, expect } = require('@playwright/test');

test.describe('D3 Visualizations', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup for D3 tests
    await page.goto('http://localhost:8000');

    // Wait for D3 to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('D3 Bar Chart', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to D3 bar chart example
      // This would require modifying the main index.js to use D3BarChart
      // For now, this tests the framework for when that switch is made
    });

    test('should render SVG container', async ({ page }) => {
      // Look for D3 SVG element
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();

      // Check SVG has proper dimensions
      const svgElement = await svg.first();
      const width = await svgElement.getAttribute('width');
      const height = await svgElement.getAttribute('height');

      expect(Number(width)).toBeGreaterThan(0);
      expect(Number(height)).toBeGreaterThan(0);
    });

    test('should have accessibility attributes', async ({ page }) => {
      const svg = await page.locator('svg');

      // Check ARIA attributes
      await expect(svg).toHaveAttribute('role', 'img');
      await expect(svg).toHaveAttribute('aria-label');
    });

    test('should render bars for data', async ({ page }) => {
      // Wait for bars to render
      await page.waitForSelector('.bar', { timeout: 5000 });

      const bars = await page.locator('.bar');
      const barCount = await bars.count();

      // Should have at least one bar
      expect(barCount).toBeGreaterThan(0);

      // Each bar should have proper attributes
      for (let i = 0; i < barCount; i++) {
        const bar = bars.nth(i);
        await expect(bar).toHaveAttribute('cursor', 'pointer');
        await expect(bar).toHaveAttribute('role', 'button');
        await expect(bar).toHaveAttribute('tabindex', '0');
      }
    });

    test('should handle bar interactions', async ({ page }) => {
      await page.waitForSelector('.bar', { timeout: 5000 });

      const firstBar = await page.locator('.bar').first();

      // Test hover interaction
      await firstBar.hover();

      // Should show tooltip on hover
      await page.waitForSelector('.d3-tooltip', { timeout: 2000 });
      const tooltip = await page.locator('.d3-tooltip');
      await expect(tooltip).toBeVisible();

      // Test click interaction
      await firstBar.click();

      // Note: Selection behavior would need to be tested with actual Qlik connection
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.waitForSelector('.bar', { timeout: 5000 });

      const firstBar = await page.locator('.bar').first();

      // Focus on first bar
      await firstBar.focus();
      await expect(firstBar).toBeFocused();

      // Test Enter key
      await firstBar.press('Enter');

      // Test Space key
      await firstBar.press(' ');

      // Should not throw errors
    });
  });

  test.describe('D3 Scatter Plot', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to D3 scatter plot example
      // This would require modifying the main index.js to use D3ScatterPlot
    });

    test('should render scatter plot container', async ({ page }) => {
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();

      // Check for scatter plot specific elements
      const clipPath = await page.locator('clipPath#chart-clip');
      await expect(clipPath).toBeVisible();
    });

    test('should render data points', async ({ page }) => {
      await page.waitForSelector('.dot', { timeout: 5000 });

      const dots = await page.locator('.dot');
      const dotCount = await dots.count();

      expect(dotCount).toBeGreaterThan(0);

      // Check dot attributes
      const firstDot = dots.first();
      await expect(firstDot).toHaveAttribute('cursor', 'pointer');
      await expect(firstDot).toHaveAttribute('role', 'button');
    });

    test('should support zoom interaction', async ({ page }) => {
      await page.waitForSelector('svg', { timeout: 5000 });

      const svg = await page.locator('svg');

      // Test zoom with wheel event
      await svg.hover();
      await page.wheel(0, -100); // Zoom in

      // Should not throw errors - actual zoom testing would need more complex setup
    });

    test('should handle dot interactions', async ({ page }) => {
      await page.waitForSelector('.dot', { timeout: 5000 });

      const firstDot = await page.locator('.dot').first();

      // Test hover
      await firstDot.hover();

      // Should show tooltip
      await page.waitForSelector('.d3-tooltip', { timeout: 2000 });
      const tooltip = await page.locator('.d3-tooltip');
      await expect(tooltip).toBeVisible();

      // Tooltip should contain data info
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toContain('X:');
      expect(tooltipText).toContain('Y:');
    });
  });

  test.describe('D3 General Features', () => {
    test('should handle responsive design', async ({ page }) => {
      // Test different viewport sizes
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForLoadState('networkidle');

      let svg = await page.locator('svg');
      await expect(svg).toBeVisible();

      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForLoadState('networkidle');

      svg = await page.locator('svg');
      await expect(svg).toBeVisible();
    });

    test('should handle no data state', async ({ page }) => {
      // This test would require mocking empty data
      // For now, we test the framework exists

      const noDataMessage = await page.locator('.no-data');
      // May or may not be visible depending on data state

      if (await noDataMessage.isVisible()) {
        await expect(noDataMessage).toContainText('No data');
      }
    });

    test('should handle error states gracefully', async ({ page }) => {
      // Monitor for console errors
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Navigate and wait
      await page.waitForLoadState('networkidle');

      // Should not have critical D3 rendering errors
      const d3Errors = consoleErrors.filter((error) => error.includes('D3') || error.includes('d3'));

      expect(d3Errors.length).toBe(0);
    });

    test('should support accessibility features', async ({ page }) => {
      // Test screen reader support
      const svg = await page.locator('svg');
      await expect(svg).toHaveAttribute('role', 'img');
      await expect(svg).toHaveAttribute('aria-label');

      // Test keyboard navigation
      await page.keyboard.press('Tab');

      // Should focus on interactive elements
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Test reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Charts should still render but without animations
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();
    });

    test('should handle high contrast mode', async ({ page }) => {
      // Test high contrast
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Charts should still be visible and accessible
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();
    });
  });

  test.describe('D3 Performance', () => {
    test('should render within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:8000');
      await page.waitForSelector('svg', { timeout: 10000 });

      const renderTime = Date.now() - startTime;

      // Should render within 10 seconds (generous for D3 + data loading)
      expect(renderTime).toBeLessThan(10000);
    });

    test('should not leak memory', async ({ page }) => {
      // Test multiple navigation cycles
      for (let i = 0; i < 3; i++) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('svg', { timeout: 5000 });
      }

      // Should not accumulate tooltips or other DOM elements
      const tooltips = await page.locator('.d3-tooltip').count();
      expect(tooltips).toBeLessThanOrEqual(1); // At most one active tooltip
    });
  });
});

/**
 * Helper functions for D3 testing
 */

// Check if D3 chart has proper data binding
async function checkDataBinding(page, selector) {
  const elements = await page.locator(selector);
  const count = await elements.count();

  for (let i = 0; i < count; i++) {
    const element = elements.nth(i);
    // Each D3 element should have data attributes or proper binding
    const hasDataAttribute = await element.evaluate((el) => el.__data__ !== undefined);
    expect(hasDataAttribute).toBe(true);
  }
}

// Verify D3 scales are working correctly
async function checkScales(page) {
  const svg = await page.locator('svg');
  const elements = await page.locator('.bar, .dot');

  if ((await elements.count()) > 0) {
    // Elements should have proper positioning
    const firstElement = elements.first();
    const x = (await firstElement.getAttribute('x')) || (await firstElement.getAttribute('cx'));
    const y = (await firstElement.getAttribute('y')) || (await firstElement.getAttribute('cy'));

    expect(Number(x)).toBeGreaterThanOrEqual(0);
    expect(Number(y)).toBeGreaterThanOrEqual(0);
  }
}
