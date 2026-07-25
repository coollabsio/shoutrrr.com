import assert from 'node:assert/strict';
import { listOperations, groupByTag } from '../spec.js';

const fixture = {
  security: [{ http: [] }],
  paths: {
    '/openapi.json': { get: { responses: { '200': { description: '' } } } }, // untagged -> skipped
    '/posts': {
      get: { operationId: 'posts.index', tags: ['Posts'], parameters: [{ name: 'q', in: 'query' }],
        responses: { '200': { description: 'ok' }, '401': { $ref: '#/components/responses/AuthenticationException' } } },
      post: { operationId: 'posts.store', tags: ['Posts'], requestBody: { required: true },
        responses: { '201': { description: '' } } },
    },
    '/media': { post: { operationId: 'media.store', tags: ['Media'], responses: { '201': { description: '' } } } },
  },
  components: { responses: { AuthenticationException: { description: 'Unauthenticated' } } },
};

const ops = listOperations(fixture);
assert.equal(ops.length, 3, 'untagged /openapi.json excluded');
const index = ops.find((o) => o.operationId === 'posts.index');
assert.equal(index.method, 'GET');
assert.equal(index.tag, 'Posts');
assert.deepEqual(index.security, [{ http: [] }], 'inherits root security');
assert.equal(index.responses['401'].description, 'Unauthenticated', '$ref resolved');
assert.equal(index.requestBody, null);

const grouped = groupByTag(ops, ['Posts', 'Media']);
assert.deepEqual(grouped.map((g) => g.tag), ['Posts', 'Media']);
assert.equal(grouped[0].operations.length, 2);

// Unknown tag falls to the end alphabetically.
const grouped2 = groupByTag(ops, ['Media']);
assert.deepEqual(grouped2.map((g) => g.tag), ['Media', 'Posts']);
console.log('spec tests passed');
