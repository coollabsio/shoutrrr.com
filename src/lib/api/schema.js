/** Non-null members of a possibly-array `type`. */
function baseTypes(schema) {
  const t = schema.type;
  if (Array.isArray(t)) return t.filter((x) => x !== 'null');
  return t ? [t] : [];
}

export function isNullable(schema) {
  return Array.isArray(schema.type) && schema.type.includes('null');
}

export function typeLabel(schema) {
  if (!schema || typeof schema !== 'object') return 'any';
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (Array.isArray(schema.enum)) return schema.enum.map((v) => (v === null ? 'null' : String(v))).join(' | ');
  if (Array.isArray(schema.anyOf)) return schema.anyOf.map(typeLabel).join(' | ');
  if (Array.isArray(schema.oneOf)) return schema.oneOf.map(typeLabel).join(' | ');
  const bases = baseTypes(schema);
  const base = bases[0] ?? (schema.properties ? 'object' : 'any');
  if (base === 'array') {
    const items = schema.items && Object.keys(schema.items).length ? typeLabel(schema.items) : 'any';
    return `${items}[]`;
  }
  return base;
}

export function constraintList(schema) {
  const out = [];
  const { minimum, maximum, minLength, maxLength, pattern, format } = schema;
  if (minimum !== undefined && maximum !== undefined) out.push(`${minimum}–${maximum}`);
  else if (minimum !== undefined) out.push(`min ${minimum}`);
  else if (maximum !== undefined) out.push(`max ${maximum}`);
  if (minLength !== undefined && maxLength !== undefined) out.push(`${minLength}–${maxLength} chars`);
  else if (maxLength !== undefined) out.push(`max ${maxLength}`);
  else if (minLength !== undefined) out.push(`min ${minLength}`);
  if (pattern) out.push(`pattern: ${pattern}`);
  if (format) out.push(`format: ${format}`);
  return out;
}

export function variantLabel(schema) {
  const kind = schema?.properties?.kind;
  if (kind && kind.const !== undefined) return `kind: ${JSON.stringify(kind.const)}`;
  return null;
}

export function schemaVariants(schema) {
  const members = schema?.anyOf ?? schema?.oneOf;
  if (Array.isArray(members) && members.length) {
    return members.map((m) => ({ label: variantLabel(m), schema: m }));
  }
  return [{ label: null, schema: schema ?? {} }];
}

export function flattenSchema(schema, depth = 0) {
  const rows = [];
  const props = schema?.properties;
  if (!props) return rows;
  const required = new Set(schema.required ?? []);
  for (const [name, prop] of Object.entries(props)) {
    rows.push({
      name,
      type: typeLabel(prop),
      required: required.has(name),
      nullable: isNullable(prop),
      description: prop.description ?? '',
      constraints: constraintList(prop),
      depth,
    });
    // Recurse into nested object shapes and arrays of objects.
    if (baseTypes(prop).includes('object') && prop.properties) {
      rows.push(...flattenSchema(prop, depth + 1));
    } else if (baseTypes(prop).includes('array') && prop.items && prop.items.properties) {
      rows.push(...flattenSchema(prop.items, depth + 1));
    }
  }
  return rows;
}

const FORMAT_EXAMPLES = {
  'date-time': '2026-01-01T09:00:00Z',
  uri: 'https://example.com/image.jpg',
  binary: '@/path/to/file',
};

export function exampleFromSchema(schema) {
  if (!schema || typeof schema !== 'object') return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.const !== undefined) return schema.const;
  if (Array.isArray(schema.enum)) return schema.enum[0];
  if (Array.isArray(schema.anyOf)) return exampleFromSchema(schema.anyOf[0]);
  const base = baseTypes(schema)[0] ?? (schema.properties ? 'object' : 'string');
  switch (base) {
    case 'object': {
      const out = {};
      const props = schema.properties ?? {};
      const required = schema.required ?? [];
      const keys = required.length ? required : Object.keys(props);
      for (const k of keys) if (props[k]) out[k] = exampleFromSchema(props[k]);
      return out;
    }
    case 'array':
      return schema.items && Object.keys(schema.items).length ? [exampleFromSchema(schema.items)] : [];
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'string':
    default:
      return schema.format && FORMAT_EXAMPLES[schema.format] ? FORMAT_EXAMPLES[schema.format] : 'string';
  }
}
