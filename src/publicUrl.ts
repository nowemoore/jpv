/**
 * Resolve a path to a file in public/ against the site's base URL, so assets
 * load both in dev (served at /) and on GitHub Pages (served at /jpv/).
 */
export function publicUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
