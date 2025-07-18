/**
 * @file The base VM shim module for Lea-chain WebAssembly, containing environment-agnostic logic.
 */

/**
 * A colored logging utility.
 * @private
 */
const print = (() => {
    const colors = {
        red: { ansi: 196, css: "red" },
        orange: { ansi: 208, css: "orange" },
        green: { ansi: 46, css: "green" },
        blue: { ansi: 33, css: "blue" },
    };

    const printMessage = (msg, { ansi, css }) => {
        if (typeof process !== 'undefined' && process.stdout?.write) {
            process.stdout.write(`\x1b[38;5;${ansi}m${msg}\x1b[0m`);
        } else if (typeof console !== 'undefined') {
            console.log(`%c${msg}`, `color: ${css}`);
        }
    };

    const api = {};
    for (const [name, cfg] of Object.entries(colors)) {
        api[name] = msg => printMessage(msg, cfg);
    }
    return api;
})();

/**
 * Reads a null-terminated C-style string from WebAssembly memory.
 * @param {WebAssembly.Memory} memory - The WebAssembly memory instance.
 * @param {number} ptr - The pointer to the start of the string.
 * @returns {string} The decoded string.
 */
export const cstring = (memory, ptr) => {
    if (!memory) return '';
    const mem = new Uint8Array(memory.buffer, ptr);
    let len = 0;
    while (mem[len] !== 0) {
        len++;
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(memory.buffer, ptr, len));
};

/**
 * Creates the base VM shim, configured with environment-specific implementations.
 *
 * @param {object} [config={}] - Configuration for the shim.
 * @param {(len: number) => Uint8Array} [config.randomBytesImpl] - The function for generating random bytes.
 * @param {(message: string) => void} [config.onAbort] - Custom abort handler.
 * @returns {{
 *   importObject: WebAssembly.Imports,
 *   bindInstance: (instance: WebAssembly.Instance) => void,
 *   print: object
 * }} An object containing the import object, a function to bind the wasm instance, and the print utility.
 */
export function createShimBase(config = {}) {
    let memory = null;

    const onAbort = config.onAbort || ((message) => {
        print.red(message);
        if (typeof process !== 'undefined' && process.exit) {
            process.exit(1);
        } else {
            throw new Error(message);
        }
    });

    if (typeof config.randomBytesImpl !== 'function') {
        throw new Error('A `randomBytesImpl` function must be provided in the shim configuration.');
    }

    const importObject = {
        env: {
            __lea_abort: (_line) => {
                const line = Number(_line);
                onAbort(`[ABORT] at line ${line}\n`);
            },
            __lea_log: (ptr, len) => {
                if (!memory) return;
                const _len = Number(len);
                const mem = new Uint8Array(memory.buffer, ptr, _len);
                const m = new TextDecoder('utf-8').decode(mem);
                print.orange(m);
            },
            __lea_ubsen: (_name, _filename, _line, _column) => {
                if (!memory) {
                    onAbort(`[UBSEN] at unknown location (memory not bound)\n`);
                    return;
                }
                const name = cstring(memory, _name);
                const filename = cstring(memory, _filename);
                const line = Number(_line);
                const column = Number(_column);
                onAbort(`[UBSEN] ${name} at ${filename}:${line}:${column}\n`);
            },
            __lea_randombytes: (ptr, len) => {
                const _len = Number(len);
                print.blue(`[VM] __lea_randombytes requested ${_len} bytes\n`);
                if (!memory) return;
                
                const randomBytes = config.randomBytesImpl(_len);
                const mem = new Uint8Array(memory.buffer, ptr, _len);
                mem.set(randomBytes);
            },
            __execution_limit: (gas_price, gas_limit) => {
                print.blue(`[VM] __execution_limit called with gas_price=${gas_price}, gas_limit=${gas_limit}\n`);
            },
            __address_add: (address_data, address_size) => {
                print.blue(`[VM] __address_add called with address_data=${address_data}, address_size=${address_size}\n`);
            },
            __execution_stack_add: (target_index, instruction_data, instruction_size) => {
                print.blue(`[VM] __execution_stack_add called with target_index=${target_index}, instruction_data=${instruction_data}, instruction_size=${instruction_size}\n`);
            }
        },
    };

    const bindInstance = (instance) => {
        memory = instance.exports.memory;
        if (!memory) {
            console.warn("Warning: WebAssembly instance has no exported memory.");
        }
    };

    return { importObject, bindInstance, print };
}
