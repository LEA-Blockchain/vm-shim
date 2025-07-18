<!--
giturl: https://github.com/LEA-Blockchain/vm-shim.git
name: vm-shim
version: 1.1.0
description: A reusable VM shim for Lea-chain WebAssembly modules, compatible with Node.js and browsers.
-->

# @leachain/vm-shim

[![npm version](https://img.shields.io/npm/v/@leachain/vm-shim)](https://www.npmjs.com/package/@leachain/vm-shim)
[![GitHub license](https://img.shields.io/github/license/LEA-Blockchain/vm-shim)](https://github.com/LEA-Blockchain/vm-shim/blob/main/LICENSE)

@leachain/vm-shim is a reusable VM shim for Lea-chain WebAssembly modules, providing the necessary host environment for running smart contracts compatibly in both Node.js and browser environments.

## Features

-   **Environment-Agnostic**: Works seamlessly in both Node.js and modern web browsers.
-   **Secure by Default**: Provides a sandboxed environment with no filesystem or network access unless explicitly passed in.
-   **Configurable**: Allows custom handlers for events like `abort`.
-   **Typed API**: Includes TypeScript definitions for a better developer experience.
-   **Modern Tooling**: Bundled with `esbuild` for optimized, multi-format output (ESM, CJS, and IIFE).

## Installation

```sh
npm install @leachain/vm-shim
```

## Usage

The primary export is `createShim`, which generates the `importObject` for a WebAssembly instance.

### ES Modules (ESM)

This is the recommended approach for modern Node.js and browser bundlers.

```javascript
import { promises as fs } from 'fs';
import { createShim } from '@leachain/vm-shim';

async function runWasm() {
    // 1. Create the shim instance
    const { importObject, bindInstance } = createShim();

    // 2. Read your Wasm module bytes
    const wasmBytes = await fs.readFile('./path/to/your_contract.wasm');

    // 3. Instantiate the module with the shim's import object
    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);

    // 4. IMPORTANT: Bind the created instance to the shim
    // This allows host functions to access the Wasm module's memory.
    bindInstance(instance);

    // 5. Call an exported function from your Wasm module
    const result = instance.exports.your_function(123);
    console.log(`Wasm function returned: ${result}`);
}

runWasm().catch(console.error);
```

### CommonJS (CJS)

For older Node.js environments, you can use `require`.

```javascript
const { promises: fs } = require('fs');
const { createShim } = require('@leachain/vm-shim');

async function runWasm() {
    // 1. Create the shim instance
    const { importObject, bindInstance } = createShim();

    // 2. Read your Wasm module bytes
    const wasmBytes = await fs.readFile('./path/to/your_contract.wasm');

    // 3. Instantiate the module with the shim's import object
    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);

    // 4. IMPORTANT: Bind the created instance to the shim
    bindInstance(instance);

    // 5. Call an exported function from your Wasm module
    const result = instance.exports.your_function(123);
    console.log(`Wasm function returned: ${result}`);
}

runWasm().catch(console.error);
```

## API Reference

### `createShim(config?)`

-   `config` `<object>` (Optional)
    -   `onAbort` `<(message: string) => void>`: A custom handler to call when the Wasm module aborts. Defaults to `process.exit(1)` in Node.js and throws an `Error` in the browser.
    -   `customEnv` `<object>`: A user-provided object to extend the `env` namespace in the import object.
-   **Returns** `<object>`
    -   `importObject` `<object>`: The WebAssembly import object. Pass this to `WebAssembly.instantiate`.
    -   `bindInstance` `<(instance: WebAssembly.Instance) => void>`: A function to bind the newly created Wasm instance to the shim. **This must be called after instantiation.**
    -   `print` `<object>`: A colored logging utility with `red`, `orange`, `green`, and `blue` methods.

### `cstring(memory, ptr)`

A utility function to read a null-terminated UTF-8 string from the Wasm instance's memory.

-   `memory` `<WebAssembly.Memory>`: The exported memory from your Wasm instance (`instance.exports.memory`).
-   `ptr` `<number>`: The pointer (memory address) of the string.
-   **Returns** `<string>`: The decoded string.

## Extending the Shim

You can add your own host functions to the `env` namespace of the `importObject`. This is useful for providing custom functionality to your WebAssembly module that is not available in the default shim.

To add custom functions, pass a `customEnv` object in the `createShim` configuration. The keys of this object will be the function names available to your Wasm module, and the values will be the corresponding JavaScript implementations.

### Example: Adding a Custom Function

Here's how to add a `my_custom_function` that your Wasm module can call:

```javascript
import { createShim } from '@leachain/vm-shim';

// 1. Define your custom function
const customEnv = {
  my_custom_function: (arg1, arg2) => {
    console.log(`my_custom_function called with: ${arg1}, ${arg2}`);
    return 42;
  }
};

// 2. Pass it to createShim
const { importObject, bindInstance } = createShim({ customEnv });

// ... proceed with Wasm instantiation as usual
```

Your WebAssembly module can then import and call this function. For example, in your C/C++ code, you would declare it as an extern:

```c
extern int my_custom_function(int arg1, int arg2);

// ... and then you can call it
int result = my_custom_function(10, 20);
```

This provides a powerful way to create a rich, bidirectional communication channel between your Wasm module and the JavaScript host environment.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs, features, or improvements.

## License

This project is licensed under the ISC License.
