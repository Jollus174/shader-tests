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
	const handleChange = (val: string) => {
		onChange(val);
	};

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

	return (
		<div className="code-editor-wrapper">
			<CodeMirror
				value={value}
				height="100%"
				theme={oneDark}
				onChange={handleChange}
				extensions={[
					glslLanguage,
					EditorView.lineWrapping,
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
					})
				]}
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
