function containsAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function sanitizeUserFacingErrorMessage(message: string) {
  const normalized = message.trim();

  if (
    containsAny(normalized, [
      /digitalocean/i,
      /\bdroplet\b/i,
      /resource you were accessing could not be found/i,
      /\bnot_found\b/i,
    ])
  ) {
    return "This Hermes instance is no longer available. Deploy a new one to continue.";
  }

  if (containsAny(normalized, [/\bssh\b/i, /\btmux\b/i])) {
    return "This Hermes terminal is not ready yet. Please try again shortly.";
  }

  if (containsAny(normalized, [/control plane/i])) {
    return "The request failed. Please try again.";
  }

  return normalized;
}
