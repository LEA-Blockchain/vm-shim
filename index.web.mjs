/**
 * @file Browser entry point for the VM shim.
 */
import { createShimBase } from './shim.base.mjs';

/**
 * Generates random bytes using the browser's crypto API.
 * @param {number} len - The number of bytes to generate.
 * @returns {Uint8Array}
 */
function browserRandomBytes(len) {
    if (typeof window === 'undefined' || !window.crypto?.getRandomValues) {
        throw new Error('Browser crypto API is not available.');
    }
    const bytes = new Uint8Array(len);
    window.crypto.getRandomValues(bytes);
    return bytes;
}

/**
 * Creates a VM shim configured for a browser environment.
 * @param {object} [config={}] - Custom configuration for the shim.
 * @returns {ReturnType<typeof createShimBase>}
 */
export function createShim(config = {}) {
    return createShimBase({
        ...config,
        randomBytesImpl: browserRandomBytes
    });
}

export { cstring } from './shim.base.mjs';
