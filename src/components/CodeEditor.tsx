import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { toggleComment } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { cpp } from '@codemirror/lang-cpp';

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	language?: string;
}

function CodeEditor({ value, onChange }: CodeEditorProps) {
	const [lineWrapping, setLineWrapping] = useState(true);
	const editorViewRef = useRef<EditorView | null>(null);

	// Use C++ language support (similar syntax to GLSL) for comment support
	// GLSL uses // and /* */ comments, same as C++
	const glslLanguage = cpp();

	// Key binding for comment toggling (Ctrl+/ or Cmd+/)
	const commentKeymap: Extension = keymap.of([
		{
			key: 'Mod-/',
			run: toggleComment
		}
	]);

	// Build extensions array conditionally based on line wrapping
	const extensions = [
		glslLanguage,
		...(lineWrapping ? [EditorView.lineWrapping] : []),
		commentKeymap,
		EditorView.theme({
			'&': {
				fontSize: '14px'
			},
			'.cm-content': {
				padding: '12px',
				minHeight: '100%'
			},
			'.cm-scroller': {
				fontFamily: 'monospace'
			}
		}),
		EditorView.updateListener.of((update) => {
			if (update.view) {
				editorViewRef.current = update.view;
			}
		})
	];

	const handleChange = (val: string) => {
		onChange(val);
	};

	// Scroll to top when value changes (shader switch)
	useEffect(() => {
		if (editorViewRef.current) {
			// Use requestAnimationFrame to ensure the view is ready
			requestAnimationFrame(() => {
				if (editorViewRef.current) {
					const scrollDOM = editorViewRef.current.scrollDOM;
					if (scrollDOM) {
						scrollDOM.scrollTop = 0;
					}
				}
			});
		}
	}, [value]);

	return (
		<div className="code-editor-wrapper">
			<div className="code-editor-controls">
				<label className="line-wrap-toggle">
					<input
						type="checkbox"
						checked={lineWrapping}
						onChange={(e) => setLineWrapping(e.target.checked)}
						aria-label="Toggle line wrapping"
					/>
					<span>Wrap lines</span>
				</label>
			</div>

			<CodeMirror
				value={value}
				height="100%"
				theme={oneDark}
				onChange={handleChange}
				extensions={extensions}
				basicSetup={{
					lineNumbers: true,
					highlightSelectionMatches: false,
					indentOnInput: true,
					bracketMatching: true,
					closeBrackets: true,
					autocompletion: false,
					crosshairCursor: false,
					highlightActiveLine: true,
					tabSize: 2
				}}
			/>
		</div>
	);
}

export default CodeEditor;
