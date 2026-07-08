import assert from 'node:assert/strict';
import {
  typeLabel, isNullable, constraintList, variantLabel, schemaVariants,
  flattenSchema, exampleFromSchema,
} from '../schema.js';

// typeLabel
assert.equal(typeLabel({ type: 'string' }), 'string');
assert.equal(typeLabel({ type: ['string', 'null'] }), 'string');
assert.equal(typeLabel({ type: 'array', items: { type: 'integer' } }), 'integer[]');
assert.equal(typeLabel({ type: 'array', items: {} }), 'any[]');
assert.equal(typeLabel({ enum: ['draft', 'scheduled'] }), 'draft | scheduled');
assert.equal(typeLabel({ const: 'all' }), '"all"');
assert.equal(typeLabel({ anyOf: [{ type: 'string' }, { type: 'null' }] }), 'string | null');

// nullable + constraints
assert.equal(isNullable({ type: ['integer', 'null'] }), true);
assert.equal(isNullable({ type: 'integer' }), false);
assert.deepEqual(constraintList({ minimum: 1, maximum: 100 }), ['1–100']);
assert.deepEqual(constraintList({ maxLength: 255 }), ['max 255']);
assert.deepEqual(constraintList({ pattern: '^\\d{4}-\\d{2}$' }), ['pattern: ^\\d{4}-\\d{2}$']);
assert.deepEqual(constraintList({ format: 'date-time' }), ['format: date-time']);

// variants
assert.equal(variantLabel({ properties: { kind: { const: 'all' } } }), 'kind: "all"');
assert.equal(variantLabel({ type: 'object' }), null);
const variants = schemaVariants({ anyOf: [{ type: 'object' }, { type: 'object' }] });
assert.equal(variants.length, 2);
assert.equal(schemaVariants({ type: 'object', properties: {} })[0].label, null);

// flattenSchema — required, nullable, nested
const rows = flattenSchema({
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', maxLength: 255 },
    next_cursor: { type: ['string', 'null'] },
    pagination: { type: 'object', properties: { per_page: { type: 'integer' } } },
  },
});
const name = rows.find((r) => r.name === 'name');
assert.equal(name.required, true);
assert.deepEqual(name.constraints, ['max 255']);
const cursor = rows.find((r) => r.name === 'next_cursor');
assert.equal(cursor.required, false);
assert.equal(cursor.nullable, true);
const nested = rows.find((r) => r.name === 'per_page');
assert.equal(nested.depth, 1, 'nested object property is depth 1');

// exampleFromSchema
const ex = exampleFromSchema({
  type: 'object', required: ['name'],
  properties: { name: { type: 'string' }, count: { type: 'integer' } },
});
assert.equal(typeof ex.name, 'string');
assert.equal(ex.count, undefined, 'only required fields in example when some are required');
assert.deepEqual(exampleFromSchema({ type: 'array', items: { type: 'string' } }), ['string']);
assert.equal(exampleFromSchema({ enum: ['draft', 'scheduled'] }), 'draft');
console.log('schema tests passed');
