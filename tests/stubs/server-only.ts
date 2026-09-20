/**
 * Stub for the `server-only` package.
 *
 * That package deliberately throws unless it is resolved under React's
 * `react-server` export condition, which Vitest does not set. Aliasing it to
 * this empty module lets server modules be imported in tests.
 *
 * This does not weaken the guarantee it provides: the real package is still
 * resolved during `next build`, which is where a Client Component importing
 * server code must fail.
 */
export {};
