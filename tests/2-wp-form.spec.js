import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Required env vars (add these to your .env file):
 *   WP_ADMIN_USER            - WordPress admin username
 *   WP_ADMIN_PASS            - WordPress admin password
 *   WP_TEST_RECIPIENT_EMAIL  - test email address
 */

//wp admin login URL
const ADMIN_LOGIN_URL = '/admin-console/';

//wp contact form edit URL
const CONTACT_FORM_EDIT_URL =
  '/wp-admin/admin.php?page=wpcf7&post=146&action=edit';

// load .env file for WP_ADMIN_USER, WP_ADMIN_PASS, and WP_TEST_RECIPIENT_EMAIL
const { WP_ADMIN_USER, WP_ADMIN_PASS, WP_TEST_RECIPIENT_EMAIL } = process.env;
const RECIPIENT_STATE_FILE = path.resolve('test-results', 'original-recipient.json');

test.describe('WP Admin - Contact Form recipient swap', () => {
  // Fail fast if required env vars are missing
  test.beforeAll(() => {
    if (!WP_ADMIN_USER || !WP_ADMIN_PASS) {
      throw new Error('WP_ADMIN_USER and WP_ADMIN_PASS must be set in the .env file.');
    }
    if (!WP_TEST_RECIPIENT_EMAIL) {
      throw new Error(
        'WP_TEST_RECIPIENT_EMAIL must be set in the .env file (the address to swap the form to).'
      );
    }
  });

  test('logs in, swaps the recipient email, and saves', async ({
    page,
  }) => {

    test.setTimeout(8 * 60 * 1000);

    // Holds the recipient email as it exists before we touch it, so it
    // can be written back in the "finally" block further down
    let originalRecipient = '';

    // STEP 1: Log in to WP admin so we have an authenticated session
    await test.step('Log in to WordPress admin', async () => {
      await page.goto(ADMIN_LOGIN_URL, { waitUntil: 'domcontentloaded' });
      // WP login field selectors
      await page.locator('#user_login').fill(WP_ADMIN_USER);
      await page.locator('#user_pass').fill(WP_ADMIN_PASS);
      await page.locator('#wp-submit').click();
      // Confirms login actually succeeded by locating the WP admin bar, which is only present for logged-in users
      await expect(page.locator('#wpadminbar')).toBeVisible();
    });

    // STEP 2: Navigate to the "Get In Touch" form's editor
    // and switch to its Mail tab, where the "To:" recipient field lives
    await test.step('Open the Get In Touch contact form (Mail tab)', async () => {
      await page.goto(CONTACT_FORM_EDIT_URL, { waitUntil: 'domcontentloaded' });
      await page.getByRole('tab', { name: 'Mail', exact: true }).click();
      await expect(page.locator('#wpcf7-mail-recipient')).toBeVisible();
    });

    // STEP 3: Capture whatever recipient email is currently configured,
    // and log it to the terminal so there's a visible record of it
    await test.step('Read and log the current "To:" recipient', async () => {
      originalRecipient = await page.locator('#wpcf7-mail-recipient').inputValue();
      console.log(`[wp-form] Current "To:" recipient email: ${originalRecipient}`);
      fs.mkdirSync(path.dirname(RECIPIENT_STATE_FILE), { recursive: true });
      fs.writeFileSync(
        RECIPIENT_STATE_FILE,
        JSON.stringify({ originalRecipient }, null, 2),
        'utf8'
      );
    });

    // STEP 4: Overwrite the recipient field with the test-only email,
    await test.step('Replace it with the test recipient email', async () => {
      const recipientField = page.locator('#wpcf7-mail-recipient');
      await recipientField.fill('');
      await recipientField.fill(WP_TEST_RECIPIENT_EMAIL);
      await expect(recipientField).toHaveValue(WP_TEST_RECIPIENT_EMAIL);
      console.log(`[wp-form] Replaced recipient with: ${WP_TEST_RECIPIENT_EMAIL}`);
    });

    // STEP 5: Save the form with the new recipient, and confirm the field's value
    await test.step('Save the form', async () => {
      await page.locator('#publishing-action').getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('#wpcf7-mail-recipient')).toHaveValue(
        WP_TEST_RECIPIENT_EMAIL
      );
      console.log('[wp-form] Form saved with new recipient.');
    });

});
});