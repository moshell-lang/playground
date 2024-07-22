import { indentWithTab } from '@codemirror/commands';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useEffect, useRef } from 'preact/hooks';
import { moshell } from '../lezer/moshell.ts';
import { colorSchemeQuery } from '../theme.ts';

interface EditorProps {
  text: string;
  onChange: (value: string) => void;
}
export function Editor({ onChange, text }: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const themeConfig = new Compartment();
    const extensions: Extension[] = [
      basicSetup,
      keymap.of([indentWithTab]),
      moshell(),
      EditorView.updateListener.of((update) => {
        onChange(update.state.doc.toString());
      }),
      themeConfig.of(currentTheme()),
    ];
    const state = EditorState.create({
      doc: text,
      extensions,
    });
    const view = new EditorView({
      state,
      parent: ref.current!,
    });

    function setTheme(): void {
      view.dispatch({
        effects: themeConfig.reconfigure(currentTheme()),
      });
    }
    colorSchemeQuery.addEventListener('change', setTheme);
    return () => {
      colorSchemeQuery.removeEventListener('change', setTheme);
      view.destroy();
    };
  }, []);
  return (
    <div
      id="editor"
      ref={ref}
    />
  );
}
function currentTheme(): Extension {
  return colorSchemeQuery.matches
    ? oneDark
    : syntaxHighlighting(defaultHighlightStyle, { fallback: true });
}
