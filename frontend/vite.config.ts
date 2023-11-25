import preact from '@preact/preset-vite';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [preact(), splitVendorChunkPlugin()],
});
