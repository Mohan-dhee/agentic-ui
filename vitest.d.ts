import 'vitest';

// jest-axe ships Jest types only; register its matcher with Vitest.
declare module 'vitest' {
  // Type parameter must match Vitest's own declaration to merge.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Matchers<T = any> {
    toHaveNoViolations(): T;
  }
}
