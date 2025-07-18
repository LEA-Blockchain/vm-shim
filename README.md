# @leachain/vm-shim

A reusable VM shim for Lea-chain WebAssembly modules, compatible with Node.js and browser environments.

## Introduction

`@leachain/vm-shim` provides the necessary host environment for running Lea-chain smart contracts compiled to WebAssembly. It offers a consistent and secure set of imported functions that a Wasm module can call into, abstracting away the differences between the Node.js and browser runtimes.

This shim is designed to be lightweight, secure, and easy to integrate into any project that needs to execute Lea-chain Wasm modules.

## Features

-   **Environment-Agnostic**: Works seamlessly in both Node.js and modern web browsers.
-   **Secure by Default**: Provides a sandboxed environment with no filesystem or network access unless explicitly passed in.
-   **Configurable**: Allows custom handlers for events like `abort`.
-   **Typed API**: Includes TypeScript definitions for a better developer experience.
-   **Modern Tooling**: Bundled with `esbuild` for optimized, multi-format output (ESM, CJS, and IIFE).

## Installation

Install the package using your preferred package manager:

```sh
# Using npm
npm install @leachain/vm-shim

# Using yarn
yarn add @leachain/vm-shim
```

## Usage

The primary export of this module is the `createShim` function, which generates the necessary `importObject` for a WebAssembly instance.

### Node.js Example

In a Node.js environment, you can directly import the module and use it to instantiate a Wasm file.

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

### Browser Example

You can use the shim in the browser with a bundler (like Webpack or Vite) or directly via a `<script>` tag.

#### With a Bundler (ESM)

```javascript
import { createShim } from '@leachain/vm-shim';

async function runWasmInBrowser() {
    // 1. Create the shim
    const { importObject, bindInstance } = createShim();

    // 2. Fetch your Wasm module
    const response = await fetch('/path/to/your_contract.wasm');
    const wasmBytes = await response.arrayBuffer();

    // 3. Instantiate and bind
    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
    bindInstance(instance);

    // 4. Call a function
    instance.exports.your_function();
}

runWasmInBrowser();
```

#### With a `<script>` Tag (IIFE)

The package includes a browser-ready bundle that exposes a global variable (`LeaChainVmShim`).

```html
<!DOCTYPE html>
<html>
<head>
    <title>VM Shim Example</title>
    <!-- Include the script from your node_modules or a CDN -->
    <script src="/node_modules/@leachain/vm-shim/dist/vm-shim.web.min.js"></script>
</head>
<body>
    <script>
        async function run() {
            // The shim is available on the global LeaChainVmShim object
            const { createShim } = LeaChainVmShim;
            const { importObject, bindInstance } = createShim();

            const response = await fetch('/path/to/your_contract.wasm');
            const wasmBytes = await response.arrayBuffer();

            const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
            bindInstance(instance);

            instance.exports.your_function();
        }
        run();
    </script>
</body>
</html>
```

## API Reference

### `createShim(config?)`

-   `config` `<object>` (Optional)
    -   `onAbort` `<(message: string) => void>`: A custom handler to call when the Wasm module aborts. Defaults to `process.exit(1)` in Node.js and throws an `Error` in the browser.
-   **Returns** `<object>`
    -   `importObject` `<object>`: The WebAssembly import object. Pass this to `WebAssembly.instantiate`.
    -   `bindInstance` `<(instance: WebAssembly.Instance) => void>`: A function to bind the newly created Wasm instance to the shim. **This must be called after instantiation.**
    -   `print` `<object>`: A colored logging utility with `red`, `orange`, `green`, and `blue` methods.

### `cstring(memory, ptr)`

A utility function to read a null-terminated UTF-8 string from the Wasm instance's memory.

-   `memory` `<WebAssembly.Memory>`: The exported memory from your Wasm instance (`instance.exports.memory`).
-   `ptr` `<number>`: The pointer (memory address) of the string.
-   **Returns** `<string>`: The decoded string.

## Building from Source

To build the module from the source code, clone the repository and run the build script.

```sh
# Clone the repository
git clone https://github.com/LEA-Blockchain/vm-shim.git
cd vm-shim

# Install dependencies
npm install

# Run the build
npm run build
```

The bundled output will be placed in the `dist/` directory.

---
## Metadata

-   **Name**: `@leachain/vm-shim`
-   **Version**: `1.0.0`
-   **Description**: A reusable VM shim for Lea-chain WebAssembly modules, compatible with Node.js and browsers.
-   **Category**: Virtual Machine
-   **Repository**: `https://github.com/LEA-Blockchain/vm-shim.git`
