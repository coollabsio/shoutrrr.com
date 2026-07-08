// src/lib/api/__tests__/samples.test.mjs
import assert from 'node:assert/strict';
import { buildCodeSamples } from '../samples.js';

const base = 'https://app.shoutrrr.com/api/v1';

// GET, no body
const get = buildCodeSamples({ method: 'GET', path: '/posts', baseUrl: base });
assert.ok(get.curl.includes("curl 'https://app.shoutrrr.com/api/v1/posts'"));
assert.ok(get.curl.includes('Authorization: Bearer <token>'));
assert.ok(!get.curl.includes('Content-Type'), 'no content-type without a body');
assert.ok(get.js.includes("method: 'GET'"));
assert.ok(get.python.includes('requests.get('));
assert.ok(get.php.includes("curl_init('https://app.shoutrrr.com/api/v1/posts')"));

// POST, JSON body
const post = buildCodeSamples({ method: 'POST', path: '/posts', baseUrl: base, body: { base_text: 'Hello' } });
assert.ok(post.curl.includes('-X POST'));
assert.ok(post.curl.includes("Content-Type: application/json"));
assert.ok(post.curl.includes('"base_text": "Hello"'));
assert.ok(post.js.includes('JSON.stringify('));
assert.ok(post.python.includes('requests.post('));
assert.ok(post.python.includes('json='));
assert.ok(post.php.includes('CURLOPT_CUSTOMREQUEST'));

// PATCH uses the right verbs
const patch = buildCodeSamples({ method: 'PATCH', path: '/posts/{id}', baseUrl: base, body: { base_text: 'x' } });
assert.ok(patch.python.includes('requests.patch('));

// multipart
const mp = buildCodeSamples({ method: 'POST', path: '/media', baseUrl: base, multipart: true, body: { file: '@/path/to/file', alt_text: 'A cat' } });
assert.ok(mp.curl.includes("-F 'file=@/path/to/file'"));
assert.ok(mp.curl.includes("-F 'alt_text=A cat'"));
assert.ok(mp.js.includes('FormData'));
assert.ok(mp.python.includes('files='));
console.log('samples tests passed');
