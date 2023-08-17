import { Json } from '@metamask/utils';

/**
 * Converts hex value to integer.
 *
 * @param hex - Hex value.
 * @returns Integer value.
 */
export function hex2int(hex: string | Json): number | null {
  return hex ? parseInt(hex.toString(), 16) : null;
}
