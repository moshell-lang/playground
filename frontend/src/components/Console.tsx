import Ansi from '@curvenote/ansi-to-react';

interface ConsoleProps {
  text: string;
}
export const Console = ({ text }: ConsoleProps) => (
  <pre
    className="h-100 fs-6 ps-1"
    id="output"
  ><Ansi>{text}</Ansi></pre>
);
