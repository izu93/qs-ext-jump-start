const { test, expect } = require('@playwright/test');
const { getNebulaQueryString, getQlikServerAuthenticatedContext } = require('./qs-ext.connect');

test.describe('sn', () => {
  const nebulaQueryString = getNebulaQueryString();

  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await getQlikServerAuthenticatedContext({ browser });
  });

  test.afterAll(async ({ browser }) => {
    await context.close();
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should say hello', async () => {
    await page.goto(`/dev/${nebulaQueryString}`);

    const content = '.njs-viz[data-render-count="1"]';
    await page.waitForSelector(content, { visible: true });
    const text = await page.$eval(content, (el) => el.textContent);

    expect(text).toBe('Hello World!');
  });
});
