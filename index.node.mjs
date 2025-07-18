/**
 * @file Node.js entry point for the VM shim.
 */
import { randomBytes } from 'crypto';
import { createShimBase } from './shim.base.mjs';

/**
 * Creates a VM shim configured for a Node.js environment.
 * @param {object} [config={}] - Custom configuration for the shim.
 * @returns {ReturnType<typeof createShimBase>}
 */
export function createShim(config = {}) {
    return createShimBase({
        ...config,
        randomBytesImpl: randomBytes
    });
}

export { cstring } from './shim.base.mjs';
