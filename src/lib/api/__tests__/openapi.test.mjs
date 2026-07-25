import assert from 'node:assert/strict';
import { getApiTags, getApiOperations, operationAnchor, API_BASE_URL } from '../openapi.js';
import { TAG_ORDER } from '../constants.js';

const tags = getApiTags();
// Every tag in the spec is present and ordered per TAG_ORDER.
assert.deepEqual(tags.map((t) => t.tag), TAG_ORDER);
for (const t of tags) {
  assert.ok(t.slug && t.title, `tag ${t.tag} enriched with meta`);
  assert.ok(t.operations.length > 0, `tag ${t.tag} has operations`);
}

const posts = tags.find((t) => t.tag === 'Posts');
assert.ok(posts.operations.some((o) => o.operationId === 'posts.index'));

// No untagged operation leaks in (the /openapi.json endpoint).
assert.ok(!getApiOperations().some((o) => o.path === '/openapi.json'));

assert.equal(operationAnchor({ operationId: 'posts.index' }), 'posts-index');
assert.equal(operationAnchor({ operationId: 'postActions.schedule' }), 'postactions-schedule');
assert.equal(API_BASE_URL, 'https://app.shoutrrr.com/api/v1');
console.log('openapi tests passed');
