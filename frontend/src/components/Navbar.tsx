import GitHubLogo from '~icons/bi/github';
import Play from '~icons/bi/play-fill';

interface NavbarProps {
  isRunning: boolean;
  onRunClick: () => void;
}

export function Navbar({ onRunClick, isRunning }: NavbarProps) {
  let runColor = 'btn-success';
  let runIcon = 'me-1';
  let runText = 'Run';

  if (isRunning) {
    runColor = 'btn-danger';
    runIcon = 'me-2 spinner-grow spinner-grow-sm';
    runText = 'Stop';
  }

  return (
    <nav class="navbar bg-body-tertiary p-2" id="navbar">
      <div class="navbar-brand">
        Moshell Playground
      </div>
      <div>
        <a
          class="btn btn-dark me-1"
          href="https://github.com/moshell-lang/moshell"
          target="_blank"
          title="Visit GitHub repository"
          aria-label="GitHub"
        >
          <GitHubLogo />
        </a>
        <button
          id="run-btn"
          class={`btn ${runColor}`}
          onClick={onRunClick}
          aria-label="Run code"
        >
          {isRunning ? <span class={runIcon} role="status" aria-hidden="true" /> : <Play class={runIcon} />}
          {runText}
        </button>
      </div>
    </nav>
  );
}
