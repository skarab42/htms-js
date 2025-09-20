import esbuild from 'esbuild';

const iife = {
  format: 'iife',
  globalName: 'htms',
  entryPoints: ['src/index.ts'],
  platform: 'neutral',
  target: 'esnext',
  bundle: true,
};

await Promise.all([
  esbuild.build({ ...iife, outfile: 'dist/umd/index.js' }),
  esbuild.build({ ...iife, outfile: 'dist/umd/index.min.js', minify: true }),
]);
