/**
 * @typedef {Object} PageUnderTest
 * @property {string} name - Used to name screenshot baselines and test titles.
 * @property {string} path - Path relative to baseURL.
 * @property {boolean} hasLeadspaceVideo - Whether this page has the autoplaying
 *   Vimeo background video in the leadspace. Only the homepage has it today,
 *   but new pages copying that section should just flip this to true.
 */

/** @type {PageUnderTest[]} */
export const pagesUnderTest = [
  { name: 'home', path: '/', hasLeadspaceVideo: true },
  { name: 'privacy-policy', path: '/privacy-policy/', hasLeadspaceVideo: false },
];
