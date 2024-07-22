import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [preact(), Icons({ compiler: 'jsx', jsx: 'preact' })],
});
