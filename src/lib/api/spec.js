const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/** Resolve a local `$ref` like "#/components/responses/Foo" against the spec. */
function resolveRef(ref, spec) {
  const parts = ref.replace(/^#\//, '').split('/');
  let node = spec;
  for (const p of parts) node = node?.[p];
  return node ?? { description: '' };
}

/** Flatten the paths object into tagged operations with $ref responses resolved. */
export function listOperations(spec) {
  const out = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op || !op.tags || op.tags.length === 0) continue; // skip untagged (e.g. /openapi.json)
      const responses = {};
      for (const [status, res] of Object.entries(op.responses ?? {})) {
        responses[status] = res && res.$ref ? resolveRef(res.$ref, spec) : res;
      }
      out.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId ?? `${method}:${path}`,
        tag: op.tags[0],
        summary: op.summary ?? '',
        security: op.security ?? spec.security ?? [],
        parameters: op.parameters ?? [],
        requestBody: op.requestBody ?? null,
        responses,
      });
    }
  }
  return out;
}

/** Group operations by tag, ordered by `order`; unknown tags appended sorted. */
export function groupByTag(operations, order) {
  const byTag = new Map();
  for (const op of operations) {
    if (!byTag.has(op.tag)) byTag.set(op.tag, []);
    byTag.get(op.tag).push(op);
  }
  const result = [];
  const seen = new Set();
  for (const tag of order) {
    if (byTag.has(tag)) { result.push({ tag, operations: byTag.get(tag) }); seen.add(tag); }
  }
  for (const tag of [...byTag.keys()].sort()) {
    if (!seen.has(tag)) result.push({ tag, operations: byTag.get(tag) });
  }
  return result;
}
