import { render } from 'preact';
import { Playground } from './playground.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { colorSchemeQuery } from './theme.ts';

function setTheme(): void {
  const theme = colorSchemeQuery.matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
}
colorSchemeQuery.addEventListener('change', setTheme);
setTheme();

render(<Playground />, document.getElementById('app')!);
