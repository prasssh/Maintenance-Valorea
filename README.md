# Valorea — Maintenance Regression Suite (ESM)

Playwright suite for `test-valorea.pantheonsite.io`, meant to be run after a
plugin update to confirm nothing on these pages broke:

- `/` (home — includes the Vimeo leadspace video)
- `/privacy-policy/`

It covers two things:

1. **Visual regression** — full-page screenshot diff for each page.
2. **Contact form validation** — empty-submit and invalid-email error states
   on the footer contact form (Contact Form 7).

The default test order is `1-visual-regression.spec.js`,
`2-wp-form.spec.js`, `3-contact-form.spec.js`, and
`4-restoremail.spec.js`. The WordPress recipient is swapped before the
contact form tests and restored afterward.

It does **not** re-test the pages' functional correctness (that's assumed
correct already) — it's purely a "did the last plugin update change
anything" trip-wire.

This project uses native ES modules (`import`/`export`) — `package.json` has
`"type": "module"` set, so no bundler or transpiler is needed.

## Setup (one-time)

```bash
npm install
npx playwright install --with-deps chromium
```

## Create baselines

Before the first real run — or any time a visual/content change is
intentional and you want to accept it as the new baseline:

```bash
npm run test:update-baselines
```

This saves screenshots under `tests/1-visual-regression.spec.js-snapshots/`.
Commit that folder to source control so the whole team diffs against the
same baseline.

## Run the suite (after a plugin update)

```bash
npm test
```

GitHub Actions also requires these repository secrets for the WordPress admin
tests: `WP_ADMIN_USER`, `WP_ADMIN_PASS`, and `WP_TEST_RECIPIENT_EMAIL`.

- Pass → nothing visually or functionally regressed on the pages covered.
- Fail on **visual regression** → open the HTML report (`npm run report`)
  and check the generated diff image. If the change is expected (e.g. the
  plugin update intentionally changed something), re-run
  `npm run test:update-baselines` to accept the new baseline.
- Fail on **contact form** → the plugin update likely changed Contact Form
  7's markup, validation messages, or broke its JS — check the actual field
  IDs/classes against `utils/` and the spec before assuming it's a real bug.

## Notes on the flaky bits this suite accounts for

- **Lazy-loaded images**: `utils/lazy-load.js` simulates a real visitor
  before screenshotting — scrolls down in small increments to the bottom,
  pauses, scrolls back up to the top the same gradual way, pauses again —
  so every `loading="lazy"` image has actually fired, then confirms every
  `<img>` reports `complete` with real dimensions.
- **Leadspace video**: the homepage has an autoplaying, looping Vimeo
  background video. It's paused via postMessage and masked out of the
  screenshot diff in `utils/flaky-elements.js` — pixel-diffing a video that
  never holds still would fail on every single run.
- **Contact form**: tests only exercise client-side validation (empty
  fields, malformed email). They deliberately never complete a full valid
  submission, so this suite is safe to re-run repeatedly without generating
  real leads.

## Adding a page

Add an entry to `pages.config.js`:

```js
{ name: 'new-page', path: '/new-page/', hasLeadspaceVideo: false }
```

The visual and contact specs pick it up automatically. Run
`npm run test:update-baselines` once to generate its initial screenshot
baseline.
