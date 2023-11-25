import { useEffect, useState } from 'preact/hooks';
import './playground.css';
import Split from 'react-split';
import { SSE } from 'sse.js';
import { Console } from './components/Console.tsx';
import { Editor } from './components/Editor.tsx';
import { Navbar } from './components/Navbar.tsx';

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
      const sse = new SSE('http://localhost:3000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        payload: JSON.stringify({ version: 'latest', code: editorText }),
      });
      sse.addEventListener('message', (event: MessageEvent<string>) => {
        // @ts-ignore - id is not in the type definition
        if (event.id === 'end') {
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

  useEffect(() => {
    localStorage.setItem('editorText', editorText);
  }, [editorText]);

  return (
    <>
      <Navbar
        isRunning={sse !== null}
        onRunClick={handleRunClick}
      />
      <Split
        class="d-flex"
        cursor="col-resize"
        direction="horizontal"
        id="content"
      >
        <Editor text={editorText} onChange={setEditorText} />
        <Console text={outputText} />
      </Split>
    </>
  );
}
