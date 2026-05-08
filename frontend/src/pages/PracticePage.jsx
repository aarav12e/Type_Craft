import React, { useState, useEffect, useRef } from 'react';
import { Zap, Target, Code2, RotateCcw, Trophy, ChevronRight, Flame, Check, X } from 'lucide-react';

// ─── Word banks ───────────────────────────────────────────────────────────────
const COMMON_WORDS = [
  'the','be','to','of','and','a','in','that','have','it','for','not','on','with',
  'he','as','you','do','at','this','but','his','by','from','they','we','say','her',
  'she','or','an','will','my','one','all','would','there','their','what','so','up',
  'out','if','about','who','get','which','go','me','when','make','can','like','time',
  'no','just','him','know','take','people','into','year','your','good','some','could',
  'them','see','other','than','then','now','look','only','come','its','over','think',
  'also','back','after','use','two','how','our','work','first','well','way','even',
  'new','want','because','any','these','give','day','most','us','great','between',
  'need','large','often','hand','high','place','hold','turn','was','here','much',
];

const CODE_SNIPPETS = [
  { lang: 'JavaScript', code: 'const sum = (a, b) => a + b;' },
  { lang: 'JavaScript', code: 'const arr = [1, 2, 3].map(x => x * 2);' },
  { lang: 'JavaScript', code: 'async function fetchData(url) { return await fetch(url); }' },
  { lang: 'Python',     code: 'def factorial(n): return 1 if n <= 1 else n * factorial(n-1)' },
  { lang: 'Python',     code: 'squares = [x**2 for x in range(10)]' },
  { lang: 'Python',     code: 'with open("file.txt", "r") as f: data = f.read()' },
  { lang: 'Java',       code: 'public int add(int a, int b) { return a + b; }' },
  { lang: 'Java',       code: 'List<String> list = new ArrayList<>();' },
  { lang: 'CSS',        code: 'display: flex; align-items: center; justify-content: space-between;' },
  { lang: 'HTML',       code: '<div class="container"><h1>Hello World</h1></div>' },
  { lang: 'SQL',        code: 'SELECT name, score FROM users ORDER BY score DESC LIMIT 10;' },
  // eslint-disable-next-line no-template-curly-in-string
  { lang: 'TypeScript', code: 'const greet = (name: string): string => `Hello, \\${name}!`;' },
  { lang: 'JavaScript', code: 'const obj = { ...defaults, ...overrides };' },
  { lang: 'Python',     code: 'result = list(filter(lambda x: x > 0, numbers))' },
  { lang: 'JavaScript', code: 'useEffect(() => { return () => clearTimeout(timer); }, []);' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─── Speed Burst game ─────────────────────────────────────────────────────────
const SpeedBurst = () => {
  const WORD_COUNT = 15;
  const [words] = useState(() => shuffle(COMMON_WORDS).slice(0, WORD_COUNT));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | running | done
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status, startTime]);

  const handleInput = (e) => {
    const val = e.target.value;
    if (status === 'idle') { setStatus('running'); setStartTime(Date.now()); }
    if (val.endsWith(' ')) {
      const typed = val.trim();
      if (typed === words[currentIdx]) setCorrect(c => c + 1);
      else setIncorrect(i => i + 1);
      const next = currentIdx + 1;
      if (next >= words.length) { setStatus('done'); setElapsed(Date.now() - startTime); }
      else setCurrentIdx(next);
      setInput('');
    } else {
      setInput(val);
    }
  };

  const wpm = elapsed > 0 ? Math.round((correct / (elapsed / 60000))) : 0;
  const accuracy = (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 100;

  const reset = () => {
    setCurrentIdx(0); setInput(''); setStatus('idle');
    setStartTime(null); setElapsed(0); setCorrect(0); setIncorrect(0);
    inputRef.current?.focus();
  };

  if (status === 'done') return (
    <div className="pg-result">
      <Trophy size={36} className="pg-result-icon" />
      <h3>speed burst complete!</h3>
      <div className="pg-result-stats">
        <div className="pg-rstat"><span className="pg-rval accent">{wpm}</span><span className="pg-rlabel">wpm</span></div>
        <div className="pg-rstat"><span className="pg-rval">{accuracy}%</span><span className="pg-rlabel">accuracy</span></div>
        <div className="pg-rstat"><span className="pg-rval" style={{color:'var(--correct)'}}>{correct}</span><span className="pg-rlabel">correct</span></div>
        <div className="pg-rstat"><span className="pg-rval" style={{color:'var(--wrong)'}}>{incorrect}</span><span className="pg-rlabel">wrong</span></div>
      </div>
      <p className="pg-no-rank-note">
        <Zap size={12} style={{display:'inline', marginRight:'4px'}}/>
        practice mode — not saved to leaderboard
      </p>
      <button className="btn-primary" onClick={reset}><RotateCcw size={14} style={{display:'inline',marginRight:'6px'}}/>play again</button>
    </div>
  );

  return (
    <div className="pg-game-area" onClick={() => inputRef.current?.focus()}>
      <div className="pg-info-row">
        <span className="pg-info-chip">
          <Flame size={13}/> word {currentIdx + 1} / {words.length}
        </span>
        <span className="pg-info-chip accent-chip">
          {status === 'running' ? `${(elapsed / 1000).toFixed(1)}s` : 'start typing'}
        </span>
      </div>

      <div className="pg-words-wrap">
        {words.map((w, i) => {
          let cls = 'pg-word';
          if (i < currentIdx) cls += ' pg-done';
          if (i === currentIdx) cls += ' pg-active';
          return <span key={i} className={cls}>{w}</span>;
        })}
      </div>

      <input
        ref={inputRef}
        className="pg-input"
        value={input}
        onChange={handleInput}
        placeholder="type here and press space..."
        autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
      />
    </div>
  );
};

// ─── Accuracy Drill game ──────────────────────────────────────────────────────
const AccuracyDrill = () => {
  const ROUNDS = 10;
  const [words] = useState(() => shuffle(COMMON_WORDS).slice(0, ROUNDS * 5));
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [round, setRound] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime] = useState(Date.now);
  const inputRef = useRef(null);

  const currentWord = words[wordIdx] || '';

  const handleInput = (e) => {
    const val = e.target.value;
    // Check for wrong input — only allow correct prefixes
    if (val && !currentWord.startsWith(val.toLowerCase())) {
      setShake(true);
      setMistakes(m => m + 1);
      setTimeout(() => setShake(false), 300);
      return; // reject the input
    }
    setInput(val.toLowerCase());

    if (val.toLowerCase() === currentWord) {
      const next = round + 1;
      if (next >= ROUNDS) {
        setTotalTime(Date.now() - startTime);
        setDone(true);
      } else {
        setRound(next);
        setWordIdx(wi => wi + 1);
        setInput('');
      }
    }
  };

  const reset = () => {
    setWordIdx(0); setInput(''); setRound(0); setMistakes(0); setDone(false);
    inputRef.current?.focus();
  };

  if (done) return (
    <div className="pg-result">
      <Check size={36} className="pg-result-icon" style={{color:'var(--correct)'}} />
      <h3>accuracy drill complete!</h3>
      <div className="pg-result-stats">
        <div className="pg-rstat"><span className="pg-rval">{(totalTime / 1000).toFixed(1)}s</span><span className="pg-rlabel">time</span></div>
        <div className="pg-rstat"><span className="pg-rval" style={{color:'var(--wrong)'}}>{mistakes}</span><span className="pg-rlabel">mistakes</span></div>
        <div className="pg-rstat"><span className="pg-rval accent">{ROUNDS}</span><span className="pg-rlabel">words done</span></div>
      </div>
      <p className="pg-no-rank-note"><Zap size={12} style={{display:'inline', marginRight:'4px'}}/>practice mode — not saved to leaderboard</p>
      <button className="btn-primary" onClick={reset}><RotateCcw size={14} style={{display:'inline',marginRight:'6px'}}/>try again</button>
    </div>
  );

  return (
    <div className="pg-game-area" onClick={() => inputRef.current?.focus()}>
      <div className="pg-info-row">
        <span className="pg-info-chip"><Target size={13}/> round {round + 1} / {ROUNDS}</span>
        <span className="pg-info-chip" style={{color:'var(--wrong)'}}>
          <X size={13}/> {mistakes} mistakes
        </span>
      </div>

      <p className="pg-drill-hint">type the word exactly — wrong keys are rejected</p>

      <div className="pg-big-word">
        {currentWord.split('').map((ch, i) => {
          let cls = 'pg-big-ch';
          if (i < input.length) cls += ' typed';
          if (i === input.length) cls += ' current-pos';
          return <span key={i} className={cls}>{ch}</span>;
        })}
      </div>

      <input
        ref={inputRef}
        className={`pg-input ${shake ? 'pg-shake' : ''}`}
        value={input}
        onChange={handleInput}
        placeholder="type the word above..."
        autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
      />
    </div>
  );
};

// ─── Code Snap game ──────────────────────────────────────────────────────────
const CodeSnap = () => {
  const [snipIdx, setSnipIdx] = useState(() => Math.floor(Math.random() * CODE_SNIPPETS.length));
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef(null);

  const snippet = CODE_SNIPPETS[snipIdx];
  const target = snippet.code;

  const handleInput = (e) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setInput(val);
    if (val === target) {
      setElapsed(Date.now() - startTime);
      setDone(true);
    }
  };

  const wpm = elapsed > 0 ? Math.round((target.length / 5) / (elapsed / 60000)) : 0;

  const next = () => {
    setSnipIdx(i => (i + 1) % CODE_SNIPPETS.length);
    setInput(''); setStartTime(null); setDone(false); setElapsed(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="pg-game-area">
      <div className="pg-info-row">
        <span className="pg-info-chip"><Code2 size={13}/> {snippet.lang}</span>
        <span className="pg-info-chip accent-chip">
          {startTime && !done ? `${((Date.now() - startTime) / 1000).toFixed(1)}s` : done ? `${(elapsed/1000).toFixed(1)}s` : 'start typing'}
        </span>
      </div>

      <div className="pg-code-display">
        {target.split('').map((ch, i) => {
          let cls = 'pg-code-ch';
          if (i < input.length) cls += input[i] === ch ? ' code-correct' : ' code-wrong';
          if (i === input.length) cls += ' code-cursor';
          return <span key={i} className={cls}>{ch === ' ' ? '\u00A0' : ch}</span>;
        })}
      </div>

      {done ? (
        <div className="pg-code-done">
          <Check size={18} style={{color:'var(--correct)'}}/> done in {(elapsed/1000).toFixed(2)}s — {wpm} wpm
          <button className="btn-ghost small" style={{marginLeft:'1rem'}} onClick={next}>
            <ChevronRight size={14} style={{display:'inline', marginRight:'3px'}}/>next snippet
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          className="pg-input pg-code-input"
          value={input}
          onChange={handleInput}
          placeholder="type the code above..."
          autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
        />
      )}
      <p className="pg-no-rank-note"><Zap size={12} style={{display:'inline', marginRight:'4px'}}/>practice mode — not saved to leaderboard</p>
    </div>
  );
};

// ─── Practice Hub page ────────────────────────────────────────────────────────
const GAMES = [
  {
    id: 'speed',
    icon: <Flame size={22}/>,
    title: 'Speed Burst',
    desc: 'Type 15 words as fast as you can. Measures raw typing speed.',
    tag: 'speed',
  },
  {
    id: 'accuracy',
    icon: <Target size={22}/>,
    title: 'Accuracy Drill',
    desc: 'Wrong keypresses are blocked. Train clean, error-free typing.',
    tag: 'precision',
  },
  {
    id: 'code',
    icon: <Code2 size={22}/>,
    title: 'Code Snap',
    desc: 'Type real code snippets in JS, Python, Java, SQL and more.',
    tag: 'dev',
  },
];

const PracticePage = () => {
  const [activeGame, setActiveGame] = useState(null);

  const GameComponent = activeGame === 'speed' ? SpeedBurst
    : activeGame === 'accuracy' ? AccuracyDrill
    : activeGame === 'code' ? CodeSnap
    : null;

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1 className="practice-title">
          <Zap size={24} className="practice-title-icon"/>
          practice hub
        </h1>
        <p className="practice-subtitle">
          sharpen your skills — no rankings affected, play as much as you want
        </p>
      </div>

      {!activeGame ? (
        <div className="pg-card-grid">
          {GAMES.map((g) => (
            <button key={g.id} className="pg-card" onClick={() => setActiveGame(g.id)}>
              <div className="pg-card-icon">{g.icon}</div>
              <div className="pg-card-tag">{g.tag}</div>
              <h3 className="pg-card-title">{g.title}</h3>
              <p className="pg-card-desc">{g.desc}</p>
              <div className="pg-card-cta">
                play <ChevronRight size={14}/>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="pg-game-wrapper">
          <div className="pg-game-topbar">
            <button className="btn-ghost small" onClick={() => setActiveGame(null)}>
              ← back to games
            </button>
            <span className="pg-game-title">
              {GAMES.find(g => g.id === activeGame)?.icon}
              {GAMES.find(g => g.id === activeGame)?.title}
            </span>
            <span className="pg-practice-badge">practice mode</span>
          </div>
          <GameComponent />
        </div>
      )}
    </div>
  );
};

export default PracticePage;
