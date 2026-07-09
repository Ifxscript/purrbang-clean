import { useState, useEffect, useRef } from 'react';
import './TerminalSearch.css';

function TerminalSearch({ onSearch, onClear }) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [output, setOutput] = useState(null); // { type: 'success' | 'error', message: string }
    const inputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            const result = onSearch(query.trim());
            if (result.found) {
                setOutput({ type: 'success', message: result.message });
            } else {
                setOutput({ type: 'error', message: 'ERROR: item not found' });
            }
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);

        // Clear output when typing starts
        if (output) {
            setOutput(null);
        }

        // If input is cleared, reset the grid
        if (newValue === '') {
            onClear();
        }
    };

    // Blinking cursor effect
    const [cursorVisible, setCursorVisible] = useState(true);
    useEffect(() => {
        if (isFocused) {
            const interval = setInterval(() => {
                setCursorVisible(prev => !prev);
            }, 530);
            return () => clearInterval(interval);
        } else {
            setCursorVisible(true);
        }
    }, [isFocused]);

    return (
        <div
            className={`terminal-search ${isFocused ? 'focused' : ''}`}
            onClick={() => inputRef.current?.focus()}
        >
            <div className="terminal-search__input-line">
                <span className="terminal-search__prompt">&gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="terminal-search__input"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        // Clear output when clicking/focusing to allow editing
                        if (output) {
                            setOutput(null);
                        }
                        // Scroll input into view after keyboard opens (mobile fix)
                        setTimeout(() => {
                            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder={!output ? "search by cat # or inscription id..." : ""}
                    spellCheck={false}
                    autoComplete="off"
                />
                <span className="terminal-search__text-wrapper">
                    {query ? (
                        <span className="terminal-search__text">{query}</span>
                    ) : (
                        !isFocused && <span className="terminal-search__placeholder">search by cat # or inscription id...</span>
                    )}
                    <span className={`terminal-search__cursor ${cursorVisible && isFocused ? 'visible' : ''}`}>_</span>
                </span>
            </div>

            {output && (
                <div className="terminal-search__output">
                    {output.message}
                </div>
            )}
        </div>
    );
}

export default TerminalSearch;
