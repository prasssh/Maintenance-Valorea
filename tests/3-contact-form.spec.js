import { test, expect } from '@playwright/test';
import { pagesUnderTest } from '../pages.config.js';

/**
  * This suite deliberately stops at client-side validation. It never
 * submits a fully valid entry, so re-running it after every plugin update
 * won't spam real leads into the site's mail/CRM pipeline.
 */
test.describe('Contact form validation', () => {
    test.describe('Home page', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // The form sits at the very end of the page — scroll it into view
        // the way a real visitor would reach it.
        await page.locator('form.wpcf7-form').scrollIntoViewIfNeeded();
      });

      test('shows required-field errors when submitted empty', async ({ page }) => {
        const form = page.locator('form.wpcf7-form');

        await form.getByRole('button', { name: 'Submit' }).click();

        await expect(form).toHaveClass(/invalid/);
        await expect(page.locator('.wpcf7-response-output')).toHaveText(
          'Please complete all required fields.'
        );

      });

      test('shows an invalid-email error for a malformed  email address', async ({ page }) => {
        const form = page.locator('form.wpcf7-form');

        await form.locator('#name').fill('QA Regression Test');
        await form.locator('#email_address').fill('not-an-email');
        await form.getByRole('button', { name: 'Submit' }).click();

        await expect(page.locator('.wpcf7-response-output')).toHaveText(
          'Please enter an valid email address.'
        );

      });

      test('field-level errors clear once valid values are entered', async ({ page }) => {
        const form = page.locator('form.wpcf7-form');

        // Trigger the empty-state errors first...
        await form.getByRole('button', { name: 'Submit' }).click();
        await expect(form).toHaveClass(/invalid/);

        // ...then confirm CF7's live validation clears them once the
        // fields hold valid values. We stop here rather than submitting —
        // this suite checks the form's validation behaviour survives a
        // plugin update, not the mail-delivery pipeline.
        await form.locator('#name').fill('QA Regression Test');
        await form.locator('#email_address').fill('qa-regression@example.com');

        await expect(form.locator('[data-name="fullname"] .wpcf7-not-valid-tip')).toBeHidden();
        await expect(
          form.locator('[data-name="email_address"] .wpcf7-not-valid-tip')
        ).toBeHidden();
      });
    });

});

test.describe('Contact form validation - happypath', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // The form sits at the very end of the page — scroll it into view
    // the way a real visitor would reach it.
    await page.locator('form.wpcf7-form').scrollIntoViewIfNeeded();
  });

  test('submits successfully with valid values', async ({ page }) => {
    const form = page.locator('form.wpcf7-form');

    await form.locator('#name').fill('QA Regression Test');
    await form.locator('#email_address').fill('p+test@outside.studio');
    await form.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('.wpcf7-response-output')).toHaveText(
      'Thank you for your message. It has been sent.'
    );
  })
  });
  