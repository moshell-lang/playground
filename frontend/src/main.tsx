import { render } from 'preact';
import { Playground } from './playground.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

let theme = 'light';
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  theme = 'dark';
}
document.documentElement.setAttribute('data-bs-theme', theme);

render(<Playground />, document.getElementById('app')!);
