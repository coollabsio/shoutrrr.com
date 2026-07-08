// src/lib/api/samples.js
const AUTH = 'Authorization: Bearer <token>';

function jsonBlock(body) {
  return JSON.stringify(body, null, 2);
}

function curlSample({ method, url, body, multipart }) {
  const lines = [`curl '${url}'`];
  if (method !== 'GET') lines[0] = `curl -X ${method} '${url}'`;
  lines.push(`  -H '${AUTH}'`);
  if (multipart && body) {
    for (const [k, v] of Object.entries(body)) lines.push(`  -F '${k}=${v}'`);
  } else if (body) {
    lines.push(`  -H 'Content-Type: application/json'`);
    lines.push(`  -d '${jsonBlock(body)}'`);
  }
  return lines.join(' \\\n');
}

function jsSample({ method, url, body, multipart }) {
  const headers = [`    'Authorization': 'Bearer <token>',`];
  const opts = [`  method: '${method}',`];
  let pre = '';
  if (multipart && body) {
    pre = 'const form = new FormData();\n' +
      Object.entries(body).map(([k, v]) => v.startsWith('@')
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
    const files = Object.entries(body).filter(([, v]) => v.startsWith('@'));
    const data = Object.entries(body).filter(([, v]) => !v.startsWith('@'));
    if (files.length) args.push(`    files={${files.map(([k, v]) => `'${k}': open('${v.slice(1)}', 'rb')`).join(', ')}}`);
    if (data.length) args.push(`    data={${data.map(([k, v]) => `'${k}': ${JSON.stringify(v)}`).join(', ')}}`);
  } else if (body) {
    args.push(`    json=${jsonBlock(body).replace(/: true/g, ': True').replace(/: false/g, ': False').replace(/: null/g, ': None')}`);
  }
  return `import requests\n\nres = ${fn}(\n${args.join(',\n')},\n)\ndata = res.json()`;
}

function phpSample({ method, url, body, multipart }) {
  const headers = [`        '${AUTH}',`];
  const opts = [
    '    CURLOPT_RETURNTRANSFER => true,',
    `    CURLOPT_CUSTOMREQUEST => '${method}',`,
  ];
  if (multipart && body) {
    const fields = Object.entries(body).map(([k, v]) => v.startsWith('@')
      ? `        '${k}' => new CURLFile('${v.slice(1)}'),`
      : `        '${k}' => ${JSON.stringify(v)},`);
    opts.push(`    CURLOPT_POSTFIELDS => [\n${fields.join('\n')}\n    ],`);
  } else if (body) {
    headers.push(`        'Content-Type: application/json',`);
    opts.push(`    CURLOPT_POSTFIELDS => '${jsonBlock(body)}',`);
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
