const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const nodePolyfills = require('rollup-plugin-polyfill-node');

module.exports = {
    input: 'src/index.ts',                      // Entry point of your library
    output: [
        {
            file: 'dist/index.cjs.js',          // CommonJS format
            format: 'cjs',
            // sourcemap: true,
        },
        {
            file: 'dist/index.esm.js',          // ES Module format
            format: 'es',
            // sourcemap: true,
        },
        {
            file: 'dist/index.umd.js',          // UMD format for wider compatibility
            format: 'umd',
            name: 'LessOtp',                    // Global variable name for UMD
            // sourcemap: true,
            globals: {
                crypto: 'crypto'
            }
        }
    ],
    plugins: [
        resolve(),                              // Helps Rollup find external modules
        commonjs(),                             // Converts CommonJS modules to ES6
        typescript(),                           // Compile TypeScript
        nodePolyfills({
            include: ['crypto']

        })
    ]
};