import spec from '../../data/openapi.json' with { type: 'json' };
import { API_BASE_URL, TAG_ORDER, TAG_META } from './constants.js';
import { listOperations, groupByTag } from './spec.js';

export { API_BASE_URL };

let _tags;

/** Ordered, metadata-enriched tag groups. Computed once. */
export function getApiTags() {
  if (!_tags) {
    _tags = groupByTag(listOperations(spec), TAG_ORDER).map((g) => ({
      tag: g.tag,
      slug: TAG_META[g.tag]?.slug ?? g.tag.toLowerCase(),
      title: TAG_META[g.tag]?.title ?? g.tag,
      description: TAG_META[g.tag]?.description ?? '',
      operations: g.operations,
    }));
  }
  return _tags;
}

export function getApiOperations() {
  return getApiTags().flatMap((t) => t.operations);
}

/** Stable heading id / anchor for an operation. */
export function operationAnchor(op) {
  return op.operationId.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}
