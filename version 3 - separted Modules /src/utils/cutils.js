// Checks whether a value is a non-empty string.
export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

// Parses JSON safely, returning a fallback on failure.
export const safeJSONParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};
