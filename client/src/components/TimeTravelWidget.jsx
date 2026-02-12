import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Play, Shuffle } from 'lucide-react';

const EVENTS = [
  { id: 'covid_start', label: 'Covid Crash Start', date: '2020-02-19', icon: '📉', desc: 'The peak before the pandemic plunge.' },
  { id: 'covid_bottom', label: 'Market Bottom', date: '2020-03-23', icon: '🐻', desc: 'The absolute bottom. Maximum fear.' },
  { id: 'tech_peak', label: 'Tech Bubble Peak', date: '2021-11-19', icon: '🚀', desc: 'Historical highs for Nasdaq & Crypto.' },
  { id: 'bear_2022', label: '2022 Meltdown', date: '2022-06-13', icon: '❄️', desc: 'Inflation fears trigger massive selloff.' },
  { id: 'ai_boom', label: 'AI Rally Start', date: '2023-01-03', icon: '🤖', desc: 'The beginning of the generative AI boom.' },
];

const TimeTravelWidget = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' or 'events'
  const [mode, setMode] = useState('GBM');
  const [targetDate, setTargetDate] = useState('2020-03-01');

  const switchMode = async (newMode) => {
    try {
      setMode(newMode);
      await fetch('http://localhost:5000/api/simulation/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mode: newMode })
      });
    } catch (err) {
      console.error("Failed to switch mode:", err);
    }
  };

  const jumpToDate = async (date) => {
    const d = date || targetDate;
    try {
      // Automatic switch to HISTORICAL if not already
      if (mode !== 'HISTORICAL') {
        await switchMode('HISTORICAL');
      }

      // Create ISO string for noon to avoid timezone jumps
      const isoDate = new Date(d).toISOString();
      await fetch('http://localhost:5000/api/simulation/jump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: isoDate })
      });
      // alert(`Jumped to ${d}`); // Remove alert for smoother XP
    } catch (err) {
      console.error("Failed to jump:", err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-cyan-900/80 border border-cyan-500/50 p-2 rounded-full hover:bg-cyan-800 transition-all z-50 group shadow-[0_0_15px_rgba(8,145,178,0.5)]"
      >
        <Settings className="w-6 h-6 text-cyan-400 group-hover:rotate-90 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-0 z-50 animate-in fade-in slide-in-from-bottom-10 overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-800/50">
        <h3 className="text-cyan-400 font-mono text-sm font-bold flex items-center gap-2">
          <Settings className="w-4 h-4" /> TIME MACHINE
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'controls' ? 'text-white bg-white/5 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          CONTROLS
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'events' ? 'text-white bg-white/5 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          SCENARIOS
        </button>
      </div>

      <div className="p-4 min-h-[250px]">
        {activeTab === 'controls' ? (
          <div className="space-y-6">
            {/* Mode Toggles */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold tracking-wider">SIMULATION MODE</label>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => switchMode('GBM')}
                  className={`flex-1 py-2 text-xs font-mono rounded flex items-center justify-center gap-2 transition-all ${mode === 'GBM' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Shuffle className="w-3 h-3" /> RANDOM
                </button>
                <button
                  onClick={() => switchMode('HISTORICAL')}
                  className={`flex-1 py-2 text-xs font-mono rounded flex items-center justify-center gap-2 transition-all ${mode === 'HISTORICAL' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Calendar className="w-3 h-3" /> HISTORY
                </button>
              </div>
            </div>

            {/* Manual Date */}
            <div className={`space-y-2 transition-opacity duration-300 ${mode === 'HISTORICAL' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="text-[10px] text-slate-500 font-bold tracking-wider">JUMP TO DATE (UTC)</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-black/40 border border-white/20 text-white text-xs rounded-md px-3 py-2 flex-1 font-mono focus:border-purple-500 outline-none transition-colors"
                />
                <button
                  onClick={() => jumpToDate()}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-xs font-bold font-mono transition-colors flex items-center gap-2"
                >
                  GO <Play className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-4">
              <span className="text-cyan-400">Random Mode:</span> Simulates a live market using GBM math.<br />
              <span className="text-purple-400">History Mode:</span> Replays exact historical data day-by-day.
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {EVENTS.map(evt => (
              <button
                key={evt.id}
                onClick={() => jumpToDate(evt.date)}
                className="w-full text-left p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 group transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-bold text-xs flex items-center gap-2">
                    <span className="text-base">{evt.icon}</span> {evt.label}
                  </span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                    {evt.date}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pl-6 group-hover:text-slate-300 transition-colors">
                  {evt.desc}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-black/60 text-[9px] text-slate-600 text-center border-t border-white/5 font-mono">
        OVERVIEW INVEST V5 • SIMULATION ENGINE
      </div>
    </div>
  );
};

export default TimeTravelWidget;
