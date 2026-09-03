import { test, expect } from '@playwright/test';
import { pagesUnderTest } from '../pages.config.js';
import { triggerLazyImages } from '../utils/lazy-load.js';
import { getFlakyElements, pauseBackgroundVideo } from '../utils/flaky-elements.js';

test.describe('Visual regression', () => {
  for (const pageUnderTest of pagesUnderTest) {
    test(`${pageUnderTest.name} — full page matches baseline`, async ({ page }) => {
      await page.goto(pageUnderTest.path, { waitUntil: 'networkidle' });

      if (pageUnderTest.hasLeadspaceVideo) {
        await pauseBackgroundVideo(page);
      }

      // Simulate a real visitor: scroll gradually to the bottom, pause,
      // scroll gradually back to the top, pause again — so every
      // lazy-loaded image has actually fired before we screenshot the page.
      await triggerLazyImages(page);

      // Exclude the autoplaying leadspace video (if present) from the diff —
      // see utils/flaky-elements.js for why.
      const masks = await getFlakyElements(page);

      await expect(page).toHaveScreenshot(`${pageUnderTest.name}-full.png`, {
        fullPage: true,
        mask: masks,
      });
    });
  }
});
