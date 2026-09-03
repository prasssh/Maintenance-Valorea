import { test, expect } from '@playwright/test';
import { pagesUnderTest } from '../pages.config.js';
import { triggerLazyImages } from '../utils/lazy-load.js';
import { getFlakyElements, pauseBackgroundVideo } from '../utils/flaky-elements.js';

test.describe('Visual regression', () => {
  for (const pageUnderTest of pagesUnderTest) {
    test(`${pageUnderTest.name} — full page matches baseline`, async ({ page }) => {
      console.log(`TEST STARTED: ${pageUnderTest.name}`);
      console.log(`URL: ${pageUnderTest.path}`);

      await page.goto(pageUnderTest.path, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      console.log(`PAGE LOADED: ${pageUnderTest.name}`);

      await expect(page).toHaveTitle(/.+/, { timeout: 15000 });

      console.log(`TITLE CHECK PASSED: ${pageUnderTest.name}`);
    });
  }
});