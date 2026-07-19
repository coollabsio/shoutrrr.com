import { getApiTags, operationAnchor } from './openapi.js';

/** One search record per operation, deep-linking into its tag page. */
export function apiSearchRecords() {
  const records = [];
  for (const group of getApiTags()) {
    for (const op of group.operations) {
      const url = `/docs/api/${group.slug}#${operationAnchor(op)}`;
      records.push({
        id: url,
        url,
        title: `${op.method} ${op.path}`,
        description: op.summary || `${group.title} endpoint`,
        tag: ['api', group.tag],
      });
    }
  }
  return records;
}
