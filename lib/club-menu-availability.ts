/**
 * Products removed from the public Tamandaré Club menu.
 * Match name AND container size to preserve other formats.
 * Apply the same rule at checkout and PDV catalog, not just in client rendering.
 */
const REMOVED_600ML_BRANDS = /\b(brahma|itaipava|amstel)\b/i;
const SIZE_600ML = /\b600\s*(?:ml|mililitros?)\b/i;

export function unavailableClubMenuProduct(name: string): boolean {
  return REMOVED_600ML_BRANDS.test(name) && SIZE_600ML.test(name);
}

export function filterAvailableClubProducts<T extends { name: string; active?: boolean | number }>(products: T[]): T[] {
  return products.filter((product) => !unavailableClubMenuProduct(product.name) && product.active !== false && product.active !== 0);
}
