/**
 * Capitalises the first letter of every word in a name string.
 * e.g. "john doe" → "John Doe"
 */
export function toTitleCase(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * onChange handler factory for name inputs.
 * Applies title-case capitalisation as the user types.
 */
export function nameChangeHandler(setter) {
  return (e) => setter(toTitleCase(e.target.value));
}