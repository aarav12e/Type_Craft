import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// ─── Word bank ────────────────────────────────────────────────────────────────
const WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
  'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
  'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
  'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
  'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
  'program', 'computer', 'science', 'data', 'code', 'build', 'learn', 'class',
  'project', 'function', 'array', 'object', 'string', 'number', 'type',
  'variable', 'loop', 'logic', 'system', 'design', 'test', 'debug', 'server',
  'network', 'cloud', 'database', 'query', 'user', 'input', 'output', 'file',
  'module', 'import', 'export', 'async', 'await', 'promise', 'error', 'value',
  'key', 'map', 'filter', 'reduce', 'sort', 'search', 'index', 'stack', 'queue',
  'tree', 'graph', 'node', 'edge', 'path', 'binary', 'hash', 'cache', 'state',
  'render', 'component', 'style', 'theme', 'color', 'font', 'size', 'width',
  'height', 'margin', 'padding', 'border', 'shadow', 'gradient', 'flex', 'grid',
  'block', 'inline', 'static', 'fixed', 'relative', 'absolute', 'display', 'flex',
  'space', 'align', 'justify', 'center', 'start', 'end', 'wrap', 'gap', 'row',
];

const generateWords = (count = 80) => {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  const result = [];
  while (result.length < count) result.push(...shuffled);
  return result.slice(0, count).map((w) => w.toLowerCase());
};

const DURATIONS = [15, 30, 60, 120];

const TypingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [duration, setDuration] = useState(60);
  const [words, setWords] = useState(generateWords());
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedWords, setTypedWords] = useState([]); // {word, typed, correct}[]
  const [status, setStatus] = useState('idle'); // idle | running | finished
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });

  const inputRef = useRef(null);
  const wordsRef = useRef(null);
  const timerRef = useRef(null);
  const wordElemsRef = useRef([]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const [finalStats, setFinalStats] = useState(null);

  const calcStats = useCallback(() => {
    const elapsed = duration - timeLeft;
    const minutesElapsed = Math.max(elapsed / 60, 1 / 60);

    let correct = 0, incorrect = 0, totalChars = 0;
    typedWords.forEach(({ word, typed }) => {
      const len = Math.max(word.length, typed.length);
      for (let i = 0; i < len; i++) {
        if (word[i] === typed[i]) correct++;
        else incorrect++;
      }
      totalChars += typed.length + 1; // +1 for space
    });

    const wpm = Math.round(correct / 5 / minutesElapsed);
    const rawWpm = Math.round(totalChars / 5 / minutesElapsed);
    const accuracy = totalChars > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;
    const wordsTyped = typedWords.filter((w) => w.correct).length;

    return { wpm, rawWpm, accuracy, correct, incorrect, totalChars, wordsTyped, elapsed };
  }, [typedWords, duration, timeLeft]);

  // ─── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'running') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setStatus('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  // ─── When finished, calculate & save stats ─────────────────────────────────
  useEffect(() => {
    if (status !== 'finished') return;
    const stats = calcStats();
    setFinalStats(stats);

    if (user) {
      axios.post('/api/scores', {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        duration,
        correctChars: stats.correct,
        incorrectChars: stats.incorrect,
        totalChars: stats.totalChars,
        rawWpm: stats.rawWpm,
        wordsTyped: stats.wordsTyped,
      }).then(() => toast.success('Score saved!')).catch(() => {});
    }
  }, [status]);

  // ─── Caret position ────────────────────────────────────────────────────────
  useEffect(() => {
    const wordEl = wordElemsRef.current[currentWordIdx];
    if (!wordEl) return;
    const letters = wordEl.querySelectorAll('.letter');
    const charIdx = currentInput.length;
    const targetLetter = letters[charIdx] || letters[letters.length - 1];
    if (!targetLetter) return;

    const wordRect = wordsRef.current.getBoundingClientRect();
    const letterRect = targetLetter.getBoundingClientRect();

    const isAfterLast = charIdx >= letters.length;
    setCaretPos({
      top: letterRect.top - wordRect.top,
      left: isAfterLast ? letterRect.right - wordRect.left : letterRect.left - wordRect.left,
    });
  }, [currentInput, currentWordIdx]);

  // ─── Auto-scroll current word into view ────────────────────────────────────
  useEffect(() => {
    const wordEl = wordElemsRef.current[currentWordIdx];
    if (wordEl && wordsRef.current) {
      const containerTop = wordsRef.current.scrollTop;
      const containerBottom = containerTop + wordsRef.current.clientHeight;
      const top = wordEl.offsetTop;
      const bottom = top + wordEl.offsetHeight;
      if (bottom > containerBottom) {
        wordsRef.current.scrollTop = top - wordsRef.current.clientHeight / 2;
      }
    }
  }, [currentWordIdx]);

  // ─── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (status === 'finished') return;

    if (status === 'idle') {
      if (e.key.length === 1 || e.key === 'Backspace') {
        setStatus('running');
        setStartTime(Date.now());
      }
    }

    // Space → submit word
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.trim() === '') return;

      const word = words[currentWordIdx];
      const typed = currentInput.trim();
      const correct = typed === word;

      setTypedWords((prev) => [...prev, { word, typed, correct }]);
      setCurrentInput('');
      setCurrentWordIdx((i) => i + 1);

      if (currentWordIdx + 1 >= words.length) {
        setWords((prev) => [...prev, ...generateWords(40)]);
      }
      return;
    }

    // Backspace at start of word → go back
    if (e.key === 'Backspace' && currentInput === '' && typedWords.length > 0) {
      e.preventDefault();
      const prev = typedWords[typedWords.length - 1];
      setTypedWords((arr) => arr.slice(0, -1));
      setCurrentInput(prev.typed);
      setCurrentWordIdx((i) => i - 1);
    }
  };

  const handleInput = (e) => {
    if (status === 'finished') return;
    setCurrentInput(e.target.value);
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    clearInterval(timerRef.current);
    setWords(generateWords());
    setCurrentWordIdx(0);
    setCurrentInput('');
    setTypedWords([]);
    setStatus('idle');
    setTimeLeft(duration);
    setStartTime(null);
    setFinalStats(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const changeDuration = (d) => {
    setDuration(d);
    setTimeLeft(d);
    reset();
  };

  // ─── Focus input on click ──────────────────────────────────────────────────
  const handleContainerClick = () => inputRef.current?.focus();

  // ─── Live WPM (during test) ────────────────────────────────────────────────
  const liveWpm = () => {
    if (status !== 'running' || typedWords.length === 0) return 0;
    const elapsed = (Date.now() - startTime) / 60000;
    if (elapsed === 0) return 0;
    const correctChars = typedWords.reduce((sum, { word, typed }) => {
      let c = 0;
      for (let i = 0; i < Math.min(word.length, typed.length); i++) {
        if (word[i] === typed[i]) c++;
      }
      return sum + c;
    }, 0);
    return Math.round(correctChars / 5 / elapsed);
  };

  // ─── Render word chars ─────────────────────────────────────────────────────
  const renderWord = (word, idx) => {
    const isActive = idx === currentWordIdx;
    const typed = typedWords[idx];

    let chars;
    if (typed) {
      // Already submitted
      chars = word.split('').map((char, ci) => {
        const typedChar = typed.typed[ci];
        const cls = typedChar === undefined ? 'missed' : typedChar === char ? 'correct' : 'wrong';
        return <span key={ci} className={`letter ${cls}`}>{char}</span>;
      });
      // Extra typed chars
      if (typed.typed.length > word.length) {
        typed.typed.slice(word.length).split('').forEach((ch, ci) => {
          chars.push(<span key={`extra-${ci}`} className="letter extra wrong">{ch}</span>);
        });
      }
    } else if (isActive) {
      // Current word
      chars = word.split('').map((char, ci) => {
        const typedChar = currentInput[ci];
        const cls = typedChar === undefined ? '' : typedChar === char ? 'correct' : 'wrong';
        return <span key={ci} className={`letter ${cls}`}>{char}</span>;
      });
      // Extra chars typed beyond word length
      if (currentInput.length > word.length) {
        currentInput.slice(word.length).split('').forEach((ch, ci) => {
          chars.push(<span key={`extra-${ci}`} className="letter extra wrong">{ch}</span>);
        });
      }
    } else {
      // Upcoming word
      chars = word.split('').map((char, ci) => (
        <span key={ci} className="letter">{char}</span>
      ));
    }

    return (
      <div
        key={idx}
        ref={(el) => (wordElemsRef.current[idx] = el)}
        className={`word ${isActive ? 'active-word' : ''} ${typed && !typed.correct ? 'word-incorrect' : ''}`}
      >
        {chars}
      </div>
    );
  };

  // ─── Results overlay ───────────────────────────────────────────────────────
  if (status === 'finished' && finalStats) {
    return (
      <div className="typing-page">
        <div className="results-card">
          <h2 className="results-title">results</h2>
          <div className="results-grid">
            <div className="result-stat big">
              <span className="stat-value accent">{finalStats.wpm}</span>
              <span className="stat-label">wpm</span>
            </div>
            <div className="result-stat big">
              <span className="stat-value">{finalStats.accuracy}%</span>
              <span className="stat-label">accuracy</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{finalStats.rawWpm}</span>
              <span className="stat-label">raw wpm</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{finalStats.wordsTyped}</span>
              <span className="stat-label">correct words</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{finalStats.correct}</span>
              <span className="stat-label">correct chars</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{finalStats.incorrect}</span>
              <span className="stat-label">incorrect chars</span>
            </div>
          </div>

          {!user && (
            <p className="results-hint">
              <a href="/register">create an account</a> to save your scores to the leaderboard
            </p>
          )}

          <div className="results-actions">
            <button className="btn-primary" onClick={reset}>try again</button>
            <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>leaderboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="typing-page" onClick={handleContainerClick}>
      {/* Controls */}
      <div className="test-controls">
        <div className="duration-tabs">
          {DURATIONS.map((d) => (
            <button
              key={d}
              className={`dur-btn ${duration === d ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); changeDuration(d); }}
            >
              {d}s
            </button>
          ))}
        </div>

        <div className="test-timer">
          <span className={`timer-num ${timeLeft <= 5 ? 'danger' : ''}`}>{timeLeft}</span>
        </div>

        <div className="live-wpm">
          {status === 'running' && <span>{liveWpm()} <small>wpm</small></span>}
        </div>
      </div>

      {/* Word display */}
      {status === 'idle' && (
        <p className="start-hint">start typing to begin the test</p>
      )}

      <div className="words-area" ref={wordsRef}>
        {/* Caret */}
        {(status === 'running' || status === 'idle') && (
          <div
            className="caret"
            style={{ top: caretPos.top, left: caretPos.left }}
          />
        )}
        {words.map((word, idx) => renderWord(word, idx))}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        className="hidden-input"
        value={currentInput}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        tabIndex={0}
      />

      <div className="test-footer">
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); reset(); }} title="Restart (Tab)">
          ↺ restart
        </button>
      </div>
    </div>
  );
};

export default TypingPage;
