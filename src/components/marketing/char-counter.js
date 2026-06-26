export function getCharCounter({ length, limit, autoSplit }) {
  const sections = autoSplit ? Math.max(1, Math.ceil(length / limit)) : 1;
  let state = 'ok';

  if (length > limit) state = 'over';
  else if (length > limit * 0.9) state = 'warn';

  return {
    sections,
    state,
    countLabel: `${length} / ${limit}`,
  };
}
