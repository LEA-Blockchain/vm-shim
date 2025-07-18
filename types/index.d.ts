/**
 * Represents the WebAssembly memory instance.
 */
type WebAssemblyMemory = WebAssembly.Memory;

/**
 * Represents the WebAssembly instance.
 */
type WebAssemblyInstance = WebAssembly.Instance;

/**
 * Represents the WebAssembly import object.
 */
type WebAssemblyImports = WebAssembly.Imports;

/**
 * Configuration for the VM shim.
 */
export interface ShimConfig {
    /**
     * Custom abort handler.
     * Defaults to throwing an error in browsers or calling `process.exit(1)` in Node.js.
     * @param message The abort message.
     */
    onAbort?: (message: string) => void;

    /**
     * A user-provided object to extend the `env` namespace in the import object.
     * The keys are the function names, and the values are the function implementations.
     */
    customEnv?: Record<string, Function>;
}

/**
 * The object returned by the `createShim` function.
 */
export interface ShimReturn {
    /**
     * The import object to be passed to `WebAssembly.instantiate`.
     */
    importObject: WebAssemblyImports;
    /**
     * Binds the WebAssembly instance to the shim, allowing host functions to access wasm memory.
     * This must be called after the instance is created.
     * @param instance The instantiated wasm module.
     */
    bindInstance: (instance: WebAssemblyInstance) => void;
    /**
     * A colored logging utility.
     */
    print: {
        red: (msg: string) => void;
        orange: (msg: string) => void;
        green: (msg: string) => void;
        blue: (msg: string) => void;
    };
}

/**
 * Creates a VM shim for Lea-chain WebAssembly modules, configured for the current environment.
 * @param config Custom configuration for the shim.
 * @returns An object containing the import object and a function to bind the wasm instance.
 */
export function createShim(config?: ShimConfig): ShimReturn;

/**
 * Reads a null-terminated C-style string from WebAssembly memory.
 * @param memory The WebAssembly memory instance.
 * @param ptr The pointer to the start of the string.
 * @returns The decoded string.
 */
export function cstring(memory: WebAssemblyMemory, ptr: number): string;
