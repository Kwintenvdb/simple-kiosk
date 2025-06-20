import { build } from 'esbuild';

build({
    entryPoints: ['src/simple-kiosk.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: 'dist/simple-kiosk.js',
    format: 'esm',
    target: 'es2020',
    logLevel: 'info'
}).catch(() => process.exit(1));
