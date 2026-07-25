// src/lib/api/samples.js
const AUTH = 'Authorization: Bearer <token>';

function jsonBlock(body) {
  return JSON.stringify(body, null, 2);
}

/** Shell single-quoted literal, escaping embedded single quotes. */
function sq(str) {
  return `'${String(str).replace(/'/g, `'\\''`)}'`;
}

/** PHP single-quoted literal (no $ interpolation), escaping \ and '. */
function phpq(str) {
  return `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Serialize a JS value as a Python literal (dict/list/str/int/bool/None). */
function pyLiteral(value, indent = 0) {
  const pad = '    '.repeat(indent);
  const padIn = '    '.repeat(indent + 1);
  if (value === null) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => padIn + pyLiteral(v, indent + 1));
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';
  const items = entries.map(([k, v]) => `${padIn}'${k}': ${pyLiteral(v, indent + 1)}`);
  return `{\n${items.join(',\n')}\n${pad}}`;
}

function curlSample({ method, url, body, multipart }) {
  const lines = [method !== 'GET' ? `curl -X ${method} ${sq(url)}` : `curl ${sq(url)}`];
  lines.push(`  -H ${sq(AUTH)}`);
  if (multipart && body) {
    for (const [k, v] of Object.entries(body)) lines.push(`  -F ${sq(`${k}=${v}`)}`);
  } else if (body) {
    lines.push(`  -H ${sq('Content-Type: application/json')}`);
    lines.push(`  -d ${sq(jsonBlock(body))}`);
  }
  return lines.join(' \\\n');
}

function jsSample({ method, url, body, multipart }) {
  const headers = [`    'Authorization': 'Bearer <token>',`];
  const opts = [`  method: '${method}',`];
  let pre = '';
  if (multipart && body) {
    pre = 'const form = new FormData();\n' +
      Object.entries(body).map(([k, v]) => String(v).startsWith('@')
        ? `form.append('${k}', fileInput.files[0]); // ${v}`
        : `form.append('${k}', ${JSON.stringify(v)});`).join('\n') + '\n\n';
    opts.push('  body: form,');
  } else if (body) {
    headers.push(`    'Content-Type': 'application/json',`);
    opts.push(`  body: JSON.stringify(${jsonBlock(body)}),`);
  }
  opts.splice(1, 0, `  headers: {\n${headers.join('\n')}\n  },`);
  return `${pre}const res = await fetch('${url}', {\n${opts.join('\n')}\n});\nconst data = await res.json();`;
}

function pythonSample({ method, url, body, multipart }) {
  const fn = `requests.${method.toLowerCase()}`;
  const args = [`    '${url}'`, `    headers={'Authorization': 'Bearer <token>'}`];
  if (multipart && body) {
    const files = Object.entries(body).filter(([, v]) => String(v).startsWith('@'));
    const data = Object.entries(body).filter(([, v]) => !String(v).startsWith('@'));
    if (files.length) args.push(`    files={${files.map(([k, v]) => `'${k}': open(${pyLiteral(String(v).slice(1))}, 'rb')`).join(', ')}}`);
    if (data.length) args.push(`    data={${data.map(([k, v]) => `'${k}': ${pyLiteral(v)}`).join(', ')}}`);
  } else if (body) {
    args.push(`    json=${pyLiteral(body, 1)}`);
  }
  return `import requests\n\nres = ${fn}(\n${args.join(',\n')},\n)\ndata = res.json()`;
}

function phpSample({ method, url, body, multipart }) {
  const headers = [`        ${phpq(AUTH)},`];
  const opts = [
    '    CURLOPT_RETURNTRANSFER => true,',
    `    CURLOPT_CUSTOMREQUEST => '${method}',`,
  ];
  if (multipart && body) {
    const fields = Object.entries(body).map(([k, v]) => String(v).startsWith('@')
      ? `        '${k}' => new CURLFile(${phpq(String(v).slice(1))}),`
      : `        '${k}' => ${phpq(v)},`);
    opts.push(`    CURLOPT_POSTFIELDS => [\n${fields.join('\n')}\n    ],`);
  } else if (body) {
    headers.push(`        ${phpq('Content-Type: application/json')},`);
    opts.push(`    CURLOPT_POSTFIELDS => ${phpq(jsonBlock(body))},`);
  }
  opts.push(`    CURLOPT_HTTPHEADER => [\n${headers.join('\n')}\n    ],`);
  return `<?php\n$ch = curl_init('${url}');\ncurl_setopt_array($ch, [\n${opts.join('\n')}\n]);\n$data = json_decode(curl_exec($ch), true);`;
}

export function buildCodeSamples({ method, path, baseUrl, body = null, multipart = false }) {
  const url = `${baseUrl}${path}`;
  const ctx = { method, url, body, multipart };
  return {
    curl: curlSample(ctx),
    js: jsSample(ctx),
    python: pythonSample(ctx),
    php: phpSample(ctx),
  };
}
