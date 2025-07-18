import esbuild from 'esbuild';
import { promises as fs } from 'fs';

const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));

const commonConfig = {
    bundle: true,
    sourcemap: true,
    minify: false,
    external: [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.peerDependencies || {})],
};

// Build Node.js versions (CJS and MJS)
async function buildNode() {
    const nodeConfig = {
        ...commonConfig,
        platform: 'node',
        entryPoints: ['index.node.mjs'],
    };

    await esbuild.build({
        ...nodeConfig,
        format: 'esm',
        outfile: 'dist/vm-shim.node.mjs',
    });

    await esbuild.build({
        ...nodeConfig,
        format: 'cjs',
        outfile: 'dist/vm-shim.node.cjs',
    });
}

// Build Browser versions (IIFE and minified IIFE)
async function buildWeb() {
    const webConfig = {
        ...commonConfig,
        platform: 'browser',
        entryPoints: ['index.web.mjs'],
        globalName: 'LeaChainVmShim', // Name for the global variable in IIFE
    };

    await esbuild.build({
        ...webConfig,
        format: 'iife',
        outfile: 'dist/vm-shim.web.js',
    });

    await esbuild.build({
        ...webConfig,
        format: 'iife',
        outfile: 'dist/vm-shim.web.min.js',
        minify: true,
    });
}

async function main() {
    try {
        await fs.rm('dist', { recursive: true, force: true });
        await fs.mkdir('dist');
        await Promise.all([buildNode(), buildWeb()]);
        console.log('[SUCCESS] Build finished successfully.');
    } catch (e) {
        console.error('[ERROR] Build failed:', e);
        process.exit(1);
    }
}

main();
