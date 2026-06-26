export function isOverrideActive(overrides, platformId) {
  return Boolean(overrides[platformId]);
}

export function togglePlatformOverride(overrides, platformId) {
  return {
    ...overrides,
    [platformId]: !isOverrideActive(overrides, platformId),
  };
}

export function getPlatformText(draft, platformId) {
  if (isOverrideActive(draft.overrides, platformId)) {
    return draft.overrideTexts[platformId] ?? draft.baseText;
  }

  return draft.baseText;
}

export function setPlatformText(draft, platformId, text) {
  if (isOverrideActive(draft.overrides, platformId)) {
    return {
      ...draft,
      overrideTexts: {
        ...draft.overrideTexts,
        [platformId]: text,
      },
    };
  }

  return {
    ...draft,
    baseText: text,
  };
}
