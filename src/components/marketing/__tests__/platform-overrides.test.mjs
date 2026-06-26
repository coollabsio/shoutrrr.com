import assert from 'node:assert/strict';
import {
  getPlatformText,
  isOverrideActive,
  setPlatformText,
  togglePlatformOverride,
} from '../platform-overrides.js';

const afterLinkedIn = togglePlatformOverride({}, 'li', 'Base draft');
assert.equal(isOverrideActive(afterLinkedIn, 'li'), true);
assert.equal(isOverrideActive(afterLinkedIn, 'x'), false);
assert.equal(isOverrideActive(afterLinkedIn, 'bs'), false);

const afterX = togglePlatformOverride(afterLinkedIn, 'x', 'Base draft');
assert.equal(isOverrideActive(afterX, 'li'), true);
assert.equal(isOverrideActive(afterX, 'x'), true);
assert.equal(isOverrideActive(afterX, 'bs'), false);

const afterLinkedInOff = togglePlatformOverride(afterX, 'li', 'Base draft');
assert.equal(isOverrideActive(afterLinkedInOff, 'li'), false);
assert.equal(isOverrideActive(afterLinkedInOff, 'x'), true);
assert.notEqual(afterLinkedInOff, afterX, 'toggle returns a new object for Svelte state updates');

const draft = {
  baseText: 'Base draft',
  overrides: togglePlatformOverride({}, 'li', 'Base draft'),
  overrideTexts: {},
};

const withLinkedInText = setPlatformText(draft, 'li', 'LinkedIn only');
assert.equal(getPlatformText(withLinkedInText, 'li'), 'LinkedIn only');
assert.equal(getPlatformText(withLinkedInText, 'x'), 'Base draft');
assert.equal(getPlatformText(withLinkedInText, 'bs'), 'Base draft');

const withBaseText = setPlatformText(withLinkedInText, 'x', 'Shared update');
assert.equal(getPlatformText(withBaseText, 'x'), 'Shared update');
assert.equal(getPlatformText(withBaseText, 'bs'), 'Shared update');
assert.equal(getPlatformText(withBaseText, 'li'), 'LinkedIn only');

console.log('platform override tests passed');
