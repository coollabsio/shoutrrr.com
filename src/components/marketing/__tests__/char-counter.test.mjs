import assert from 'node:assert/strict';
import { getCharCounter } from '../char-counter.js';

const over = getCharCounter({ length: 310, limit: 280, autoSplit: true });
assert.equal(over.sections, 2);
assert.equal(over.state, 'over');
assert.equal(over.countLabel, '310 / 280');

const ok = getCharCounter({ length: 165, limit: 280, autoSplit: true });
assert.equal(ok.sections, 1);
assert.equal(ok.state, 'ok');
assert.equal(ok.countLabel, '165 / 280');

console.log('char-counter tests passed');
