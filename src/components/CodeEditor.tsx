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
	onHeightChange?: (height: number) => void;
	shaderId?: string; // Used to detect shader switches
	error?: string | null; // Shader compilation error message
}

function CodeEditor({ value, onChange, onHeightChange, shaderId, error }: CodeEditorProps) {
	const [lineWrapping, setLineWrapping] = useState(true);
	const [editorHeight, setEditorHeight] = useState<number | null>(null);
	const editorViewRef = useRef<EditorView | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isResizingRef = useRef(false);
	const startYRef = useRef(0);
	const startHeightRef = useRef(0);

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

	// Extension to fix mobile Chrome scroll jump issue
	// Prevents aggressive scrolling when keyboard is open
	const mobileScrollFix: Extension = EditorView.domEventHandlers({
		// Intercept touchstart to prevent Chrome's automatic scroll-into-view
		touchstart: (_event, view) => {
			// Only apply fix when keyboard is likely open
			if (window.visualViewport) {
				const viewport = window.visualViewport;
				const keyboardOpen = viewport.height < window.innerHeight * 0.75;
				
				if (keyboardOpen) {
					const scrollDOM = view.scrollDOM;
					const scrollTop = scrollDOM.scrollTop;
					
					// Store scroll position and check multiple times
					// Chrome's scroll-into-view happens asynchronously and may take multiple frames
					const checkScroll = () => {
						const newScrollTop = scrollDOM.scrollTop;
						// If scroll jumped unexpectedly (more than ~100px), restore it
						if (Math.abs(newScrollTop - scrollTop) > 100) {
							scrollDOM.scrollTop = scrollTop;
						}
					};
					
					// Check immediately and after delays to catch Chrome's scroll
					requestAnimationFrame(checkScroll);
					setTimeout(checkScroll, 50);
					setTimeout(checkScroll, 150);
				}
			}
		},
		// Also handle click events (which can trigger on mobile after touch)
		click: (_event, view) => {
			if (window.visualViewport) {
				const viewport = window.visualViewport;
				const keyboardOpen = viewport.height < window.innerHeight * 0.75;
				
				if (keyboardOpen) {
					const scrollDOM = view.scrollDOM;
					const scrollTop = scrollDOM.scrollTop;
					
					// Prevent scroll jumps after click
					const checkScroll = () => {
						const newScrollTop = scrollDOM.scrollTop;
						if (Math.abs(newScrollTop - scrollTop) > 100) {
							scrollDOM.scrollTop = scrollTop;
						}
					};
					
					requestAnimationFrame(checkScroll);
					setTimeout(checkScroll, 50);
					setTimeout(checkScroll, 150);
				}
			}
		}
	});

	// Build extensions array conditionally based on line wrapping
	const extensions = [
		glslLanguage,
		...(lineWrapping ? [EditorView.lineWrapping] : []),
		commentKeymap,
		mobileScrollFix,
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

	// Unified resize move handler (works for both mouse and touch)
	const handleResizeMove = (clientY: number) => {
		if (!isResizingRef.current || !containerRef.current) return;

		const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
		if (!parentContainer) return;

		const deltaY = startYRef.current - clientY; // Inverted: dragging up increases height
		const newHeight = Math.max(150, Math.min(window.innerHeight * 0.8, startHeightRef.current + deltaY));
		setEditorHeight(newHeight);
		parentContainer.style.height = `${newHeight}px`;
		onHeightChange?.(newHeight);
	};

	// Mouse event handlers
	const handleResizeStartMouse = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isResizingRef.current = true;
		startYRef.current = e.clientY;
		if (containerRef.current) {
			const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
			if (parentContainer) {
				startHeightRef.current = parentContainer.offsetHeight;
			}
		}
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseEnd);
		document.body.style.cursor = 'ns-resize';
		document.body.style.userSelect = 'none';
	};

	const handleMouseMove = (e: MouseEvent) => {
		e.preventDefault();
		handleResizeMove(e.clientY);
	};

	const handleMouseEnd = () => {
		isResizingRef.current = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseEnd);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	};

	// Touch event handlers
	const handleResizeStartTouch = (e: React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.touches.length !== 1) return;
		isResizingRef.current = true;
		startYRef.current = e.touches[0].clientY;
		if (containerRef.current) {
			const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
			if (parentContainer) {
				startHeightRef.current = parentContainer.offsetHeight;
			}
		}
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd);
		document.body.style.userSelect = 'none';
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isResizingRef.current || e.touches.length !== 1) return;
		e.preventDefault();
		handleResizeMove(e.touches[0].clientY);
	};

	const handleTouchEnd = () => {
		isResizingRef.current = false;
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleTouchEnd);
		document.body.style.userSelect = '';
	};
	
	// Scroll to top only when shader changes (not on user edits)
	useEffect(() => {
		if (editorViewRef.current && shaderId !== undefined) {
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
	}, [shaderId]);

	// Initialize height from CSS variable on mount
	useEffect(() => {
		if (containerRef.current) {
			const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
			if (parentContainer) {
				const computedHeight = getComputedStyle(parentContainer).height;
				const heightValue = parseFloat(computedHeight);
				if (!isNaN(heightValue)) {
					setEditorHeight(heightValue);
					onHeightChange?.(heightValue);
				}
			}
		}
	}, [onHeightChange]);

	// Handle scroll jumps on mobile Chrome when keyboard is open
	// This effect sets up listeners to detect and prevent unwanted scroll jumps
	useEffect(() => {
		if (!window.visualViewport) return;

		let savedScrollTop: number | null = null;
		let scrollRestoreTimeout: number | null = null;
		let cleanup: (() => void) | null = null;

		const setupListeners = () => {
			if (!editorViewRef.current) return;
			
			const scrollDOM = editorViewRef.current.scrollDOM;

			const handleTouchStart = () => {
				// Save scroll position when user touches the editor
				savedScrollTop = scrollDOM.scrollTop;
			};

			const handleScroll = () => {
				// If we have a saved scroll position and keyboard is open, check for jumps
				if (savedScrollTop !== null && window.visualViewport) {
					const viewport = window.visualViewport;
					const keyboardOpen = viewport.height < window.innerHeight * 0.75;
					
					if (keyboardOpen) {
						const currentScroll = scrollDOM.scrollTop;
						const scrollDiff = Math.abs(currentScroll - savedScrollTop);
						
						// If scroll jumped unexpectedly (more than ~100px), restore it
						if (scrollDiff > 100) {
							// Clear any pending restore
							if (scrollRestoreTimeout !== null) {
								clearTimeout(scrollRestoreTimeout);
							}
							
							// Restore scroll position after a short delay to let Chrome finish its scroll
							scrollRestoreTimeout = window.setTimeout(() => {
								if (scrollDOM && savedScrollTop !== null) {
									scrollDOM.scrollTop = savedScrollTop;
									savedScrollTop = null;
									scrollRestoreTimeout = null;
								}
							}, 100);
						} else {
							// Normal scroll, update saved position
							savedScrollTop = currentScroll;
						}
					}
				}
			};

			// Listen for touch events on the editor
			scrollDOM.addEventListener('touchstart', handleTouchStart, { passive: true });
			scrollDOM.addEventListener('scroll', handleScroll, { passive: true });

			cleanup = () => {
				scrollDOM.removeEventListener('touchstart', handleTouchStart);
				scrollDOM.removeEventListener('scroll', handleScroll);
				if (scrollRestoreTimeout !== null) {
					clearTimeout(scrollRestoreTimeout);
				}
			};
		};

		// Set up listeners when editor is ready (check periodically)
		const intervalId = setInterval(() => {
			if (editorViewRef.current) {
				clearInterval(intervalId);
				setupListeners();
			}
		}, 50);

		// Also try immediately in case editor is already ready
		setupListeners();

		return () => {
			clearInterval(intervalId);
			if (cleanup) cleanup();
		};
	}, []);

	// Cleanup event listeners on unmount
	useEffect(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseEnd);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, []);

	return (
		<div className="code-editor-wrapper" ref={containerRef} style={editorHeight !== null ? { height: `${editorHeight}px` } : undefined}>
			<div 
				className="code-editor-resize-handle"
				onMouseDown={handleResizeStartMouse}
				onTouchStart={handleResizeStartTouch}
				title="Drag to resize"
			/>
			{error && (
				<div className="shader-error-box">
					<div className="shader-error-header">Shader Error</div>
					<div className="shader-error-message">{error}</div>
				</div>
			)}
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
