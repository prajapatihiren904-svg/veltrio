/**
 * Joins class names, skipping falsy values. Accepts strings, arrays and { className: condition } objects.
 * Note: it does not resolve conflicting Tailwind utilities, so do not pass a className that
 * contradicts a component's built-in classes (for example a different height on a Button).
 */
export function cn(...inputs) {
  const classes = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [className, enabled] of Object.entries(input)) {
        if (enabled) classes.push(className);
      }
    }
  }
  return classes.join(' ');
}
