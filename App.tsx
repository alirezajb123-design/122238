
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Base, PAIRING, BASE_COLORS, BASE_NAMES } from './types';
import { NucleotideCard } from './components/NucleotideCard';

const SEQUENCE: Base[] = ['A', 'T', 'C', 'G', 'G', 'C', 'T', 'A', 'G', 'C'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<(Base | null)[]>(new Array(SEQUENCE.length).fill(null));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('به آزمایشگاه ژنتیک خوش آمدید. برای شروع همانندسازی آماده شوید.');
  const [unzippedIndices, setUnzippedIndices] = useState<number[]>([]);
  
  const dnaRef = useRef<HTMLDivElement>(null);

  // Scroll to active part of DNA
  useEffect(() => {
    if (dnaRef.current && (gameState === GameState.POLYMERASE || gameState === GameState.HELICASE)) {
        const activeNode = dnaRef.current.querySelector(`.node-${currentIndex}`);
        if (activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    }
  }, [currentIndex, gameState]);

  const startHelicase = () => {
    setGameState(GameState.HELICASE);
    setCurrentIndex(0);
    setFeedback('آنزیم هلیکاز در حال شکستن پیوندهای هیدروژنی است. روی دکمه "باز کردن" کلیک کنید.');
  };

  const unzipNext = () => {
    if (currentIndex < SEQUENCE.length) {
      setUnzippedIndices(prev => [...prev, currentIndex]);
      if (currentIndex < SEQUENCE.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setScore(s => s + 10);
      } else {
        setGameState(GameState.POLYMERASE);
        setCurrentIndex(0);
        setFeedback('مارپیچ باز شد! حالا با انتخاب نوکلئوتیدهای درست، رشته مکمل را بسازید.');
      }
    }
  };

  const matchBase = (selected: Base) => {
    const target = SEQUENCE[currentIndex];
    const correct = PAIRING[target];

    if (selected === correct) {
      const newSeq = [...userSequence];
      newSeq[currentIndex] = selected;
      setUserSequence(newSeq);
      setScore(s => s + 50);
      setFeedback('عالی! پیوند هیدروژنی تشکیل شد.');
      
      if (currentIndex < SEQUENCE.length - 1) {
        setTimeout(() => setCurrentIndex(c => c + 1), 300);
      } else {
        setGameState(GameState.LIGASE);
        setFeedback('رشته تکمیل شد. حالا نوبت آنزیم لیگاز برای اتصال نهایی است.');
      }
    } else {
      setScore(s => Math.max(0, s - 20));
      setFeedback(`خطا! ${BASE_NAMES[target]} باید با ${BASE_NAMES[correct]} جفت شود.`);
    }
  }

  const finalizeLigase = () => {
    setGameState(GameState.FINISHED);
    setScore(s => s + 100);
    setFeedback('تبریک! دو مولکول DNA کاملاً مشابه ایجاد شد.');
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#050a18] text-white">
      
      {/* HUD (Heads Up Display) */}
      <div className="absolute top-0 w-full p-4 md:p-8 flex justify-between items-start z-30 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 p-5 rounded-3xl shadow-2xl">
          <h1 className="text-xl md:text-3xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            DNA REPLICATION <pre> javad babaei</pre>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${gameState === GameState.FINISHED ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em]">Lab Session: Active</span>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-2xl backdrop-blur-xl flex flex-col items-end">
            <span className="text-[10px] text-emerald-400 font-black mb-1">XP POINTS</span>
            <span className="text-3xl font-black text-white glow-text">{score}</span>
          </div>
        </div>
      </div>

      {/* DNA Dynamic Simulation Area */}
      <div className="flex-1 relative flex items-center justify-center perspective-1000 overflow-hidden">
        <div 
          ref={dnaRef}
          className="relative w-full h-full flex items-center overflow-x-auto no-scrollbar px-[40vw] py-20"
        >
          {/* Sugar-Phosphate Backbones */}
          <div className="absolute top-[40%] left-0 h-1.5 w-[5000px] bg-blue-900/40 rounded-full"></div>
          <div className={`absolute bottom-[40%] left-0 h-1.5 w-[5000px] transition-all duration-1000 bg-indigo-900/40 rounded-full ${gameState !== GameState.START ? 'opacity-30' : 'opacity-100'}`}></div>

          {/* DNA Units */}
          <div className="flex gap-16 md:gap-24 relative z-10">
            {SEQUENCE.map((base, idx) => {
              const isUnzipped = unzippedIndices.includes(idx);
              const isActive = (gameState === GameState.HELICASE || gameState === GameState.POLYMERASE) && idx === currentIndex;
              
              return (
                <div key={idx} className={`relative flex flex-col items-center node-${idx} dna-node`}>
                  
                  {/* Template Strand (Top) */}
                  <div className={`transition-transform duration-700 ${isUnzipped ? '-translate-y-8 md:-translate-y-12' : ''}`}>
                    <NucleotideCard 
                      base={base} 
                      isTemplate 
                      isActive={isActive && gameState === GameState.POLYMERASE}
                    />
                  </div>

                  {/* Hydrogen Bond (The connection) */}
                  <div className={`
                    w-1 bg-gradient-to-b from-blue-400/50 to-indigo-400/50 transition-all duration-500
                    ${isUnzipped ? 'h-0 opacity-0' : 'h-16 md:h-24 opacity-100'}
                  `}></div>

                  {/* Complementary Strand (Bottom) */}
                  <div className={`transition-all duration-700 ${isUnzipped ? 'translate-y-8 md:translate-y-12' : ''}`}>
                    {gameState === GameState.POLYMERASE || gameState === GameState.LIGASE || gameState === GameState.FINISHED ? (
                      userSequence[idx] ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                          <NucleotideCard base={userSequence[idx]!} isCorrect />
                        </div>
                      ) : (
                        isUnzipped && (
                          <div className={`w-12 h-16 md:w-14 md:h-18 rounded-lg border-2 border-dashed flex items-center justify-center transition-all
                            ${isActive ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700'}`}>
                            <span className="text-slate-600 font-black text-xl">?</span>
                          </div>
                        )
                      )
                    ) : (
                      // Original complementary strand before unzipping
                      <div className={`${isUnzipped ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                        <NucleotideCard base={PAIRING[base]} />
                      </div>
                    )}
                  </div>

                  {/* Enzyme Marker */}
                  {isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className={`w-16 h-16 rounded-full blur-2xl enzyme-glow ${gameState === GameState.HELICASE ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap">
                        {gameState === GameState.HELICASE ? 'HELICASE' : 'DNA POLYMERASE'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Center */}
      <div className="w-full p-6 md:p-10 z-40 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* Instruction Panel */}
          <div className={`p-4 rounded-2xl border-r-4 transition-all duration-300 flex items-center gap-4
            ${gameState === GameState.FINISHED ? 'bg-green-500/10 border-green-500' : 'bg-blue-500/10 border-blue-500'}`}>
            <div className="text-2xl">{gameState === GameState.FINISHED ? '🏆' : '🔬'}</div>
            <p className="text-sm md:text-lg font-medium text-slate-200">{feedback}</p>
          </div>

          {/* Dynamic Controls */}
          <div className="flex justify-center h-24">
            {gameState === GameState.START && (
              <button 
                onClick={startHelicase}
                className="group relative px-12 py-5 bg-blue-600 rounded-3xl font-black text-xl hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-900/40"
              >
                شروع اسکن DNA
                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100"></div>
              </button>
            )}

            {gameState === GameState.HELICASE && (
              <button 
                onClick={unzipNext}
                className="px-12 py-5 bg-purple-600 rounded-3xl font-black text-xl hover:bg-purple-500 active:scale-95 transition-all flex items-center gap-3"
              >
                <span>باز کردن مارپیچ (هلیکاز)</span>
                <span className="animate-bounce">⚡</span>
              </button>
            )}

            {gameState === GameState.POLYMERASE && (
              <div className="grid grid-cols-4 gap-3 md:gap-6 w-full">
                {(['A', 'T', 'C', 'G'] as Base[]).map(base => (
                  <button
                    key={base}
                    onClick={() => matchBase(base)}
                    className={`
                      relative p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all active:scale-90 hover:brightness-125
                      border-b-4 border-black/30 flex flex-col items-center justify-center
                      ${BASE_COLORS[base]}
                    `}
                  >
                    <span className="text-2xl md:text-3xl font-black text-white">{base}</span>
                    <span className="text-[10px] font-bold text-white/70 uppercase">{BASE_NAMES[base]}</span>
                  </button>
                ))}
              </div>
            )}

            {gameState === GameState.LIGASE && (
              <button 
                onClick={finalizeLigase}
                className="px-12 py-5 bg-amber-500 rounded-3xl font-black text-xl hover:bg-amber-400 transition-all flex items-center gap-3 shadow-lg shadow-amber-900/30"
              >
                <span>اتصال نهایی (لیگاز)</span>
                <span className="text-2xl">🔗</span>
              </button>
            )}

            {gameState === GameState.FINISHED && (
              <button 
                onClick={() => window.location.reload()}
                className="px-12 py-5 bg-slate-800 rounded-3xl font-black text-xl hover:bg-slate-700 transition-all"
              >
                تکرار آزمایش
              </button>
            )}
          </div>

          <div className="flex justify-center gap-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Adenine (A)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Thymine (T)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Cytosine (C)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Guanine (G)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
