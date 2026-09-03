// @ts-check
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

/**
 * Valorea (test-valorea.pantheonsite.io) — post-plugin-update regression suite.
 *
 * Run this after any plugin update on staging to catch:
 *   - unintended visual changes (layout, spacing, styling regressions)
 *   - a broken/altered contact form (Contact Form 7)
 *
 * First run (or whenever a change is intentional), create/refresh baselines:
 *   npx playwright test --update-snapshots
 *
 * Every subsequent run just diffs against those baselines:
 *   npx playwright test
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // screenshots are more stable run one at a time
  workers: 3,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [['html', { open: 'never' }], ['list']],

  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // Small tolerance so font-smoothing / anti-aliasing noise between
      // runs doesn't produce false positives.
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  use: {
    baseURL: 'https://test-valorea.pantheonsite.io',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
