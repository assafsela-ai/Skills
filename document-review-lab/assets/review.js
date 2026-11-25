export function failureType(expected, result) {
  if (!result.value && expected.value) {
    return "Missing value";
  }
  if (result.value !== expected.value) {
    return "Wrong value";
  }
  if (result.source !== expected.source) {
    return "Wrong source";
  }
  return null;
}

export function summarize(fields, savedReviews) {
  const breakdown = new Map([
    ["Wrong value", { original: 0, remaining: 0 }],
    ["Missing value", { original: 0, remaining: 0 }],
    ["Wrong source", { original: 0, remaining: 0 }],
  ]);
  let original = 0;
  let remaining = 0;

  for (const field of fields) {
    const saved = savedReviews.get(field.id);
    const initialFailure = failureType(field.expected, field.extracted);
    const currentFailure = failureType(field.expected, saved ?? field.extracted);

    if (initialFailure) {
      breakdown.get(initialFailure).original += 1;
      original += 1;
    }
    if (currentFailure) {
      breakdown.get(currentFailure).remaining += 1;
      remaining += 1;
    }
  }

  return { original, remaining, breakdown, reviewed: savedReviews.size };
}
