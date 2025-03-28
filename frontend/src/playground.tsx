import { useEffect, useState } from 'preact/hooks';
import './playground.css';
import { SSE } from 'sse.js';
import { Console } from './components/Console.tsx';
import { Editor } from './components/Editor.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Split } from './components/Split.tsx';

export function Playground() {
  const [editorText, setEditorText] = useState(localStorage.getItem('editorText') || '');
  const [outputText, setOutputText] = useState('');
  const [sse, setSSE] = useState<SSE | null>(null);
  const appendOutputText = (text: string) =>
    setOutputText((current) => {
      if (current === '') {
        return text;
      }
      return current + '\n' + text;
    });
  const handleRunClick = () => {
    setOutputText('');
    setSSE((current) => {
      if (current) {
        current.close();
      }
      const sse = new SSE(import.meta.env.VITE_BACKEND || 'http://localhost:3000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        payload: JSON.stringify({ version: 'latest', code: editorText }),
      });
      sse.addEventListener('message', (event: MessageEvent<string>) => {
        if (event.lastEventId === 'end') {
          sse.close();
          setSSE(null);
        }
        appendOutputText(event.data);
      });
      sse.addEventListener('error', () => {
        setSSE(null);
      });
      sse.addEventListener('close', () => {
        setSSE(null);
      });
      return sse;
    });
  };

  const handleStopClick = () =>
    setSSE((current) => {
      if (current) {
        current.close();
        appendOutputText('Process terminated by user');
      }
      return null;
    });

  useEffect(() => {
    localStorage.setItem('editorText', editorText);
  }, [editorText]);

  return (
    <>
      <Navbar
        isRunning={sse !== null}
        onRunClick={sse === null ? handleRunClick : handleStopClick}
      />
      <Split id="content">
        <Editor text={editorText} onChange={setEditorText} />
        <Console text={outputText} />
      </Split>
    </>
  );
}
