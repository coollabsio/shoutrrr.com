import assert from 'node:assert/strict';
import { API_BASE_URL, TAG_ORDER, TAG_META } from '../constants.js';

assert.equal(API_BASE_URL, 'https://app.shoutrrr.com/api/v1');
assert.equal(TAG_ORDER.length, 8);
// Every ordered tag has metadata, and slugs are unique.
const slugs = new Set();
for (const tag of TAG_ORDER) {
  assert.ok(TAG_META[tag], `missing TAG_META for ${tag}`);
  assert.ok(TAG_META[tag].slug && TAG_META[tag].title, `incomplete meta for ${tag}`);
  assert.ok(!slugs.has(TAG_META[tag].slug), `duplicate slug ${TAG_META[tag].slug}`);
  slugs.add(TAG_META[tag].slug);
}
console.log('constants tests passed');
