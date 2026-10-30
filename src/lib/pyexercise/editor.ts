// The code editor's visual system, shared by the lesson exercises and the
// landing terminal so both read as the same voice. Callers own the
// `EditorView`; this module only supplies extensions.
import { EditorView } from 'codemirror';
import {
	HighlightStyle,
	defaultHighlightStyle,
	syntaxHighlighting
} from '@codemirror/language';
import { tags } from '@lezer/highlight';

export type EditorPalette = {
	dark: boolean;
	surface: string;
	ink: string;
	muted: string;
	keyword: string;
	builtin: string;
	function: string;
	number: string;
	string: string;
	comment: string;
	selection: string;
};

export const LIGHT_PALETTE: EditorPalette = {
	dark: false,
	surface: 'var(--color-paper)',
	ink: 'var(--color-ink)',
	muted: 'var(--color-muted)',
	keyword: 'var(--syntax-keyword)',
	builtin: 'var(--syntax-builtin)',
	function: 'var(--syntax-function)',
	number: 'var(--syntax-number)',
	string: 'var(--syntax-string)',
	comment: 'var(--syntax-comment)',
	selection: 'color-mix(in srgb, var(--color-ink) 22%, transparent)'
};

/**
 * Dark mode is not the light palette with inverted variables. The editor is
 * a black instrument panel, so every tone is set explicitly and never falls
 * through to `defaultHighlightStyle`, whose fallback colours are dark.
 */
export const DARK_PALETTE: EditorPalette = {
	dark: true,
	surface: '#000000',
	ink: '#f1f1f1',
	muted: '#a3a2a7',
	keyword: '#f1f1f1',
	builtin: '#40f51a',
	function: '#f1f1f1',
	number: '#40f51a',
	string: '#a3a2a7',
	comment: '#777777',
	selection: 'rgba(241, 241, 241, 0.22)'
};

/**
 * The landing terminal keeps green for execution alone: the lesson palette's
 * teal call names would otherwise read as "this is running" while idle.
 */
export const TERMINAL_PALETTE: EditorPalette = {
	...DARK_PALETTE,
	builtin: '#cfcdc7',
	number: '#cfcdc7',
	function: '#e6e4de'
};

/**
 * The editor is paper too: ink on canvas with one hairline frame. Syntax is
 * carried by weight and tone — comments and strings recede, keywords and
 * numbers are set bold — because the page has no colour to spend. The tones
 * are shared with the static MDX blocks so both read as one code voice.
 */
export function editorHighlight(palette: EditorPalette) {
	return HighlightStyle.define([
		{
			tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword],
			color: palette.keyword,
			fontWeight: '700'
		},
		{
			// `escape` is a literal, not a string: leaving it out lets the default
			// fallback paint backslash escapes dark green on black.
			tag: [tags.string, tags.special(tags.string), tags.docString, tags.regexp, tags.escape],
			color: palette.string
		},
		{
			tag: [
				tags.function(tags.variableName),
				tags.function(tags.propertyName),
				tags.definition(tags.function(tags.variableName)),
				tags.definition(tags.function(tags.propertyName)),
				tags.function(tags.definition(tags.variableName)),
				tags.function(tags.definition(tags.propertyName))
			],
			color: palette.function
		},
		{
			tag: [tags.definition(tags.variableName), tags.definition(tags.propertyName)],
			color: palette.ink
		},
		{ tag: [tags.className, tags.typeName, tags.namespace], color: palette.function },
		{ tag: [tags.bool, tags.null, tags.atom], color: palette.builtin },
		{ tag: [tags.number, tags.unit], color: palette.number },
		{
			tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment],
			color: palette.comment,
			fontStyle: 'italic'
		},
		{ tag: [tags.propertyName, tags.attributeName], color: palette.ink },
		{ tag: tags.variableName, color: palette.ink },
		{ tag: [tags.modifier, tags.special(tags.variableName)], color: palette.ink },
		{ tag: tags.operator, color: palette.ink },
		{ tag: [tags.punctuation, tags.bracket], color: palette.muted },
		{ tag: tags.invalid, color: palette.ink, textDecoration: 'underline wavy' },
		{ tag: tags.meta, color: palette.muted }
	]);
}

/** Geometry the caller can tighten without forking the palette. */
export type EditorScale = {
	fontSize?: string;
	lineHeight?: string;
	padding?: string;
	linePadding?: string;
	minHeight?: string;
	margin?: string;
};

export function editorChrome(palette: EditorPalette, scale: EditorScale = {}) {
	const fontSize = scale.fontSize ?? '14px';
	const lineHeight = scale.lineHeight ?? '1.75';

	return EditorView.theme(
		{
			'&': {
				backgroundColor: palette.surface,
				color: palette.ink,
				fontSize,
				marginRight: scale.margin ?? '6px',
				marginBottom: scale.margin ?? '6px'
			},
			'&.cm-focused': { outline: 'none' },
			'.cm-scroller': {
				fontFamily: 'var(--font-mono)',
				fontSize,
				lineHeight
			},
			'.cm-content': {
				padding: scale.padding ?? '1.6rem 0 1.8rem',
				minHeight: scale.minHeight ?? '10.5rem',
				fontSize,
				caretColor: palette.ink
			},
			'.cm-line': { padding: scale.linePadding ?? '0 1.8rem 0 1rem' },
			'.cm-gutters': {
				backgroundColor: 'transparent',
				color: palette.muted,
				border: 'none',
				paddingLeft: '1rem'
			},
			'.cm-lineNumbers .cm-gutterElement': {
				padding: '0 1rem 0 0.8rem',
				minWidth: '3rem'
			},
			'.cm-activeLine': { backgroundColor: 'transparent' },
			'.cm-activeLineGutter': {
				backgroundColor: 'transparent',
				color: palette.ink
			},
			'.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
				backgroundColor: palette.selection
			},
			'.cm-cursor, .cm-dropCursor': { borderLeftColor: palette.ink },
			'.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
				backgroundColor: 'transparent',
				outline: `1px solid ${palette.ink}`
			},
			'.cm-tooltip': {
				backgroundColor: palette.surface,
				border: `1px solid ${palette.ink}`,
				borderRadius: '0',
				color: palette.ink
			},
			'.cm-tooltip-autocomplete > ul > li[aria-selected]': {
				backgroundColor: palette.ink,
				color: palette.surface
			},
			'.cm-panels': {
				backgroundColor: palette.surface,
				color: palette.ink
			},
			'.cm-foldPlaceholder': {
				backgroundColor: 'transparent',
				border: `1px solid ${palette.muted}`,
				color: palette.muted
			}
		},
		{ dark: palette.dark }
	);
}

/** Chrome plus syntax colour for a theme, ready to drop into a Compartment. */
export function editorTheme(
	theme: 'light' | 'dark',
	scale: EditorScale = {},
	dark: EditorPalette = DARK_PALETTE
) {
	if (theme === 'dark') {
		return [editorChrome(dark, scale), syntaxHighlighting(editorHighlight(dark))];
	}

	return [
		editorChrome(LIGHT_PALETTE, scale),
		syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
		syntaxHighlighting(editorHighlight(LIGHT_PALETTE))
	];
}
