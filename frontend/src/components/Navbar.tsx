interface NavbarProps {
  isRunning: boolean;
  onRunClick: () => void;
}

export function Navbar({ onRunClick, isRunning }: NavbarProps) {
  let runColor = 'btn-success';
  let runIcon = 'me-1 bi bi-play-fill';
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
          class="btn btn-dark bi bi-github me-1"
          href="https://github.com/moshell-lang/moshell"
          target="_blank"
          title="Visit GitHub repository"
          aria-label="GitHub"
        >
        </a>
        <button
          id="run-btn"
          class={`btn ${runColor}`}
          onClick={onRunClick}
          aria-label="Run code"
        >
          <span class={runIcon} role="status" aria-hidden="true" />
          {runText}
        </button>
      </div>
    </nav>
  );
}
