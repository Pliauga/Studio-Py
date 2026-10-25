// CodeMirror for the landing terminal. Loaded on idle, never on the critical
// path: the terminal renders a plain source block until this module arrives.
import { EditorView, basicSetup } from 'codemirror';
import { indentUnit } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { TERMINAL_PALETTE, editorTheme } from './editor.ts';

/** Terminal proportions: tighter than the lesson editor, no gutter, no frame. */
const SCALE = {
	fontSize: '13px',
	lineHeight: '1.85',
	padding: '14px 14px 0',
	linePadding: '0',
	minHeight: '4.4em',
	margin: '0'
};

const chrome = EditorView.theme({
	'&': { backgroundColor: 'transparent', color: '#f1f1f1' },
	'&.cm-focused': { outline: 'none' },
	'.cm-gutters': { display: 'none' },
	'.cm-activeLine': { backgroundColor: 'transparent' },
	'.cm-content': { caretColor: '#f1f1f1' },
	'.cm-scroller': { padding: '0' },
	'.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
		backgroundColor: 'rgba(241, 241, 241, 0.22)'
	}
});

export function mountLandingEditor(
	host: HTMLElement,
	doc: string,
	onChange: (code: string) => void
): EditorView {
	return new EditorView({
		doc,
		extensions: [
			basicSetup,
			python(),
			editorTheme('dark', SCALE, TERMINAL_PALETTE),
			chrome,
			EditorView.contentAttributes.of({ 'aria-label': 'Python code editor' }),
			indentUnit.of('    '),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) onChange(update.state.doc.toString());
			})
		],
		parent: host
	});
}
