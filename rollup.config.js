import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',                      // Entry point of your library
    output: [
        {
            file: 'dist/index.cjs.js',          // CommonJS format
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: 'dist/index.esm.js',          // ES Module format
            format: 'es',
            sourcemap: true,
        },
        {
            file: 'dist/index.umd.js',          // UMD format for wider compatibility
            format: 'umd',
            name: 'LessOtp',                    // Global variable name for UMD
            sourcemap: true,
        }
    ],
    plugins: [
        resolve(),                              // Helps Rollup find external modules
        commonjs(),                             // Converts CommonJS modules to ES6
        typescript()                            // Compile TypeScript
    ]
};