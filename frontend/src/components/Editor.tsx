import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-github_dark';

interface EditorProps {
  text: string;
  onChange: (value: string) => void;
}
export const Editor = ({ onChange, text }: EditorProps) => (
  <AceEditor
    className="h-100 font-monospace fs-6"
    focus
    mode="text"
    name="editor"
    theme={document.documentElement.getAttribute('data-bs-theme')! === 'dark' ? 'github_dark' : 'github'}
    onChange={onChange}
    showGutter={false}
    showPrintMargin={false}
    value={text}
  />
);
