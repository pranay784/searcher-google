/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Building2, Globe, Users, TrendingUp, Newspaper, Link as LinkIcon, Loader2, Info, ArrowRight, ExternalLink, Copy, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { researchFirm, FirmResearchResult } from './services/geminiService';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FirmResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const loadingMessages = [
    "Initializing search grounding...",
    "Scanning Google for latest firm data...",
    "Extracting key leadership and financials...",
    "Analyzing recent news and market trends...",
    "Synthesizing intelligence report...",
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);
    setCopied(false);

    try {
      const data = await researchFirm(query);
      setResult(data);
    } catch (err) {
      setError("Failed to gather intelligence. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickSearches = ["NVIDIA", "OpenAI", "SpaceX", "Stripe", "Anthropic"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-line p-6 flex justify-between items-center bg-brand-bg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-brand-ink p-2 rounded-sm">
            <Building2 className="text-brand-bg w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif italic tracking-tight leading-none">FirmScout</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Intelligence Dashboard</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest font-medium">
          {result && !isLoading && (
            <button
              onClick={() => { setResult(null); setQuery(''); }}
              className="flex items-center gap-2 hover:opacity-50 transition-opacity cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> New Search
            </button>
          )}
          <a href="#" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#" className="hover:opacity-50 transition-opacity">API</a>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        {/* Search Section */}
        <AnimatePresence>
          {!result && !isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter firm name (e.g. NVIDIA, OpenAI)..."
                  className="w-full bg-transparent border-b-2 border-brand-line py-4 px-2 text-2xl md:text-4xl font-serif italic focus:outline-none placeholder:opacity-20 transition-all focus:border-opacity-100"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-brand-ink hover:text-brand-bg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ArrowRight className="w-8 h-8" />}
                </button>
              </form>
              
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <span className="text-[10px] uppercase tracking-widest opacity-40">Quick Search:</span>
                {quickSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); handleSearch(); }}
                    className="text-[11px] uppercase tracking-widest border border-brand-line/20 px-3 py-1 hover:bg-brand-ink hover:text-brand-bg transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 border-2 border-brand-line border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-xl font-serif italic mb-2">{loadingMessages[loadingStep]}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Grounding intelligence in real-time</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 p-6 rounded-sm text-red-800 flex items-start gap-4"
            >
              <Info className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Error Encountered</h3>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={() => { setError(null); setIsLoading(false); }}
                  className="mt-4 text-xs uppercase tracking-widest font-bold underline cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12"
            >
              {/* Main Report */}
              <div className="relative">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-line">
                  <h2 className="text-sm uppercase tracking-[0.3em] font-bold opacity-40">Intelligence Report: {query}</h2>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-brand-line/20 px-3 py-1 hover:bg-brand-ink hover:text-brand-bg transition-all cursor-pointer"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Report</>}
                  </button>
                </div>
                <div className="markdown-body">
                  <ReactMarkdown>{result.markdown}</ReactMarkdown>
                </div>
              </div>

              {/* Sidebar / Sources */}
              <aside className="space-y-8">
                <div>
                  <h3 className="text-[11px] uppercase tracking-widest font-bold mb-4 border-b border-brand-line pb-2">Intelligence Sources</h3>
                  <div className="space-y-3">
                    {result.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-3 border border-brand-line/10 hover:border-brand-line transition-all"
                      >
                        <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1 flex items-center gap-1">
                          Source {idx + 1} <ExternalLink className="w-2 h-2" />
                        </p>
                        <p className="text-xs font-medium line-clamp-2 group-hover:underline">{source.title}</p>
                      </a>
                    ))}
                    {result.sources.length === 0 && (
                      <p className="text-xs italic opacity-40">No specific source links extracted.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-brand-ink text-brand-bg rounded-sm">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Research Note</h4>
                  <p className="text-[11px] leading-relaxed opacity-80">
                    This intelligence report is generated using real-time Google Search grounding. Data accuracy depends on the availability of public information.
                  </p>
                </div>

                <button
                  onClick={() => { setResult(null); setQuery(''); }}
                  className="w-full py-4 border-2 border-brand-line text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-ink hover:text-brand-bg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> New Investigation
                </button>
              </aside>
            </motion.div>
          )}

          {!isLoading && !result && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center border-2 border-dashed border-brand-line/10 rounded-sm"
            >
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-xl font-serif italic opacity-30">Enter a firm name to begin intelligence gathering</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-line p-8 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-brand-ink w-4 h-4 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest font-bold">FirmScout v1.0</span>
          </div>
          
          <p className="text-[10px] uppercase tracking-widest opacity-40 text-center md:text-right">
            &copy; 2026 FirmScout Intelligence Systems. Powered by Google Search Grounding.
          </p>
        </div>
      </footer>
    </div>
  );
}
