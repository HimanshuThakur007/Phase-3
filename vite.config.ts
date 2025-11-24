import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs/promises';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-windowed-select': path.resolve(__dirname, 'node_modules/react-windowed-select/dist/main.js'),
    },
  },
  build: {
    minify: 'terser',
    sourcemap: true, // Keep source maps for debugging
    terserOptions: {
      mangle: false, // Disable mangling
      keep_fnames: true, // Preserve function names
      keep_classnames: true, // Preserve class names
      compress: {
        pure_getters: false,
        keep_infinity: true,
        sequences: false,
        drop_console: false, // Keep console logs
        inline: 0, // Disable inlining
        collapse_vars: false, // Prevent variable collapsing
        reduce_vars: false, // Avoid variable reduction
        unused: false, // Keep unused variables
      },
      format: {
        beautify: false,
      },
    },
    rollupOptions: {
      output: {
        freeze: false, // Prevent Rollup from freezing objects
        manualChunks: {
          'react-hook-form': ['react-hook-form'], // Isolate react-hook-form
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'no-freeze-json',
          setup(build) {
            build.onLoad({ filter: /\.json$/ }, async (args) => {
              const source = await fs.readFile(args.path, 'utf8');
              const parsed = JSON.parse(source);
              // Ensure deep extensible copy
              const extensibleCopy = JSON.parse(JSON.stringify(parsed));
              return {
                contents: `export default ${JSON.stringify(extensibleCopy)}`,
                loader: 'js',
              };
            });
          },
        },
      ],
    },
  },
});
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import path from 'path';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       'react-windowed-select': path.resolve(__dirname, 'node_modules/react-windowed-select/dist/main.js'),
//     },
//   },
// })


// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       'react-windowed-select': path.resolve(__dirname, 'node_modules/react-windowed-select/dist/main.js'),
//     },
//   },
//   build: {
//     chunkSizeWarningLimit: 1000, // Raise limit to 1000 KB
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes('node_modules')) {
//             if (id.includes('react')) return 'react-vendor';
//             if (id.includes('react-dom')) return 'react-vendor';
//             if (id.includes('redux')) return 'redux';
//             if (id.includes('i18next')) return 'i18n';
//             if (id.includes('axios')) return 'axios';
//             if (id.includes('bootstrap')) return 'bootstrap';
//             if (id.includes('react-icons')) return 'icons';
//             return 'vendor';
//           }
//         }
//       }
//     }
//   }
// });
