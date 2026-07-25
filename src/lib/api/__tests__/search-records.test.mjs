import assert from 'node:assert/strict';
import { apiSearchRecords } from '../search-records.js';

const records = apiSearchRecords();
assert.ok(records.length >= 20, 'one record per operation');
const rec = records.find((r) => r.title === 'GET /posts');
assert.ok(rec, 'has a GET /posts record');
assert.equal(rec.url, '/docs/api/posts#posts-index');
assert.deepEqual(rec.tag, ['api', 'Posts']);
assert.ok(records.every((r) => r.id && r.url.startsWith('/docs/api/')));
console.log('search-records tests passed');
