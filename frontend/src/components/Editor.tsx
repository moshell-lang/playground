import { indentWithTab } from '@codemirror/commands';
import { EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useEffect, useRef } from 'preact/hooks';
import { moshell } from '../lezer/moshell.ts';

interface EditorProps {
  text: string;
  onChange: (value: string) => void;
}
export function Editor({ onChange, text }: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const extensions: Extension[] = [
    basicSetup,
    keymap.of([indentWithTab]),
    moshell(),
    EditorView.updateListener.of((update) => {
      onChange(update.state.doc.toString());
    }),
  ];
  if (document.documentElement.getAttribute('data-bs-theme')! === 'dark') {
    extensions.push(oneDark);
  }
  useEffect(() => {
    const state = EditorState.create({
      doc: text,
      extensions,
    });
    const view = new EditorView({
      state,
      parent: ref.current!,
    });
    return () => view.destroy();
  }, []);
  return (
    <div
      id="editor"
      ref={ref}
    />
  );
}
