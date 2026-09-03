import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const CONTACT_FORM_EDIT_URL =
  '/wp-admin/admin.php?page=wpcf7&post=146&action=edit';
const RECIPIENT_STATE_FILE = path.resolve('test-results', 'original-recipient.json');

test.describe('WP Admin - Restore Contact Form recipient', () => {
  test.beforeAll(() => {
    if (!process.env.WP_ADMIN_USER || !process.env.WP_ADMIN_PASS) {
      throw new Error('WP_ADMIN_USER and WP_ADMIN_PASS must be set in the .env file.');
    }
    if (!fs.existsSync(RECIPIENT_STATE_FILE)) {
      throw new Error('Original recipient state is missing. Run 2-wp-form.spec.js first.');
    }
  });

  test('restores the original recipient email', async ({ page }) => {
    const { originalRecipient } = JSON.parse(
      fs.readFileSync(RECIPIENT_STATE_FILE, 'utf8')
    );

    

    await page.goto('/admin-console/', {
      waitUntil: 'networkidle',
    });
    await page.locator('#user_login').fill(process.env.WP_ADMIN_USER);
    await page.locator('#user_pass').fill(process.env.WP_ADMIN_PASS);
    await page.locator('#wp-submit').click();
    await expect(page.locator('#wpadminbar')).toBeVisible();

    await page.goto(CONTACT_FORM_EDIT_URL, { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Mail', exact: true }).click();
    const recipientField = page.locator('#wpcf7-mail-recipient');
    await expect(recipientField).toBeVisible();
    await recipientField.fill(originalRecipient);
    await page.locator('#publishing-action').getByRole('button', { name: 'Save' }).click();
    await expect(recipientField).toHaveValue(originalRecipient);
    console.log(`[restoremail] Restored original recipient: ${originalRecipient}`);
  });
});