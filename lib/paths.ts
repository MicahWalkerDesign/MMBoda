/**
 * Prefix a public-folder path with the configured basePath
 * so static assets (images, etc.) resolve correctly under
 * GitHub Pages where the site is served from /MMBoda/.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  if (!path.startsWith('/')) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
