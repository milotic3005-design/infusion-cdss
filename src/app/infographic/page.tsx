'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Copy, Check, Sparkles, ExternalLink, Monitor, ImageIcon } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { DrugSearchInput } from '@/components/drug-search/DrugSearchInput';
import { DrugSuggestionList } from '@/components/drug-search/DrugSuggestionList';
import { useDrugSearch } from '@/hooks/useDrugSearch';
import type { RxNormConcept } from '@/types/drug.types';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'loading' | 'done' | 'error';
type Tab = 'preview' | 'prompt';

export default function InfographicPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [html, setHtml] = useState('');
  const [prompt, setPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const blobUrlRef = useRef<string | null>(null);

  const { data: suggestions = [], isLoading: isSearching } = useDrugSearch(searchTerm);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSelectedName(term);
    setShowSuggestions(true);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSelectedName('');
    setShowSuggestions(false);
  }, []);

  const handleSelect = useCallback((concept: RxNormConcept) => {
    setShowSuggestions(false);
    setSearchTerm('');
    let name = concept.name;
    if (concept.tty !== 'IN') {
      const match = concept.name.match(/\d+\s+ML\s+(\S+)/i)
        || concept.name.match(/(\S+)\s+\d+\s+MG/i);
      if (match) {
        name = match[1];
      } else {
        const words = concept.name.split(' ');
        name = words.find(w => /^[a-zA-Z]{3,}/.test(w) && !['MG', 'ML', 'MG/ML'].includes(w.toUpperCase())) || words[0];
      }
    }
    setSelectedName(name.toLowerCase());
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedName.trim()) return;

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setStatus('loading');
    setHtml('');
    setPrompt('');
    setErrorMsg('');
    setCopied(false);

    try {
      const res = await fetch('/api/infographic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName: selectedName }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json() as { html: string; prompt: string };
      setHtml(data.html);
      setPrompt(data.prompt);
      setStatus('done');
      setActiveTab('preview');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed. Please try again.');
      setStatus('error');
    }
  }, [selectedName]);

  const handleOpenFullPage = useCallback(() => {
    if (!html) return;
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blob = new Blob([html], { type: 'text/html' });
    blobUrlRef.current = URL.createObjectURL(blob);
    window.open(blobUrlRef.current, '_blank');
  }, [html]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [prompt]);

  const canGenerate = selectedName.trim().length >= 2 && status !== 'loading';
  const drugTitle = selectedName.charAt(0).toUpperCase() + selectedName.slice(1);

  return (
    <div className="flex flex-col items-center pt-8 md:pt-12 pb-16">
      {/* Back nav */}
      <div className="w-full max-w-4xl mb-6 px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#5A7A5A] hover:text-[#4E6F4E] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Clinical CDSS
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <FileText size={26} className="text-[#4E6F4E]" />
          <h1 className="text-2xl md:text-3xl font-bold text-[#4E6F4E]">
            Drug Reference Infographic
          </h1>
        </div>
        <p className="text-[#5A7A5A] text-sm max-w-md">
          One-page print-ready pharmacist reference card — BUD, storage, mixing workflow &amp; inspection criteria
        </p>
      </div>

      {/* Search + Generate */}
      <GlassPanel className="w-full max-w-2xl p-6 md:p-8 relative z-10" intensity="medium">
        <div className="space-y-4">
          <div className="relative">
            <DrugSearchInput
              onSearch={handleSearch}
              onClear={handleClear}
              isLoading={isSearching}
            />
            <DrugSuggestionList
              suggestions={suggestions}
              onSelect={handleSelect}
              isVisible={showSuggestions}
            />
          </div>

          {selectedName && (
            <div className="flex items-center gap-2 text-sm text-[#4E6F4E]">
              <span className="font-medium">Selected:</span>
              <span className="bg-[#C1E1B1] text-[#3A5A3A] px-3 py-1 rounded-full font-semibold capitalize">
                {selectedName}
              </span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full"
            disabled={!canGenerate}
            icon={<Sparkles size={18} />}
          >
            Generate Infographic
          </Button>

          <p className="text-xs text-center text-[#5A7A5A]/70">
            Pulls live FDA label data · No API key required
          </p>
        </div>
      </GlassPanel>

      {/* Loading */}
      {status === 'loading' && (
        <div className="mt-10 flex flex-col items-center gap-4 text-[#4E6F4E]">
          <Spinner size="lg" className="border-[#8AB78A] border-t-[#4E6F4E]" />
          <p className="font-medium text-lg capitalize">{selectedName}</p>
          <p className="text-sm text-[#5A7A5A]">Compiling BUD, storage, mixing workflow…</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-8 w-full max-w-2xl">
          <GlassPanel className="p-5 border-red-200 bg-red-50/60" intensity="light">
            <p className="text-red-700 font-medium text-sm">{errorMsg}</p>
          </GlassPanel>
        </div>
      )}

      {/* Results */}
      {status === 'done' && html && (
        <div className="w-full max-w-4xl mt-8">

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 bg-white/60 backdrop-blur rounded-xl p-1 border border-[#B8D4B8]/40 w-fit">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                activeTab === 'preview'
                  ? 'bg-[#4E6F4E] text-white shadow-sm'
                  : 'text-[#5A7A5A] hover:text-[#4E6F4E]'
              )}
            >
              <Monitor size={15} />
              HTML Preview
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                activeTab === 'prompt'
                  ? 'bg-[#4E6F4E] text-white shadow-sm'
                  : 'text-[#5A7A5A] hover:text-[#4E6F4E]'
              )}
            >
              <ImageIcon size={15} />
              Image Prompt
            </button>
          </div>

          {/* ── HTML Preview Tab ── */}
          {activeTab === 'preview' && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-sm font-semibold text-[#4E6F4E] capitalize">
                  {drugTitle} — Reference Card
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenFullPage}
                  icon={<ExternalLink size={14} />}
                >
                  Open Full Page
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-[#B8D4B8]/60">
                <iframe
                  srcDoc={html}
                  title={`${selectedName} pharmacist infographic`}
                  className="w-full"
                  style={{ height: '1120px', border: 'none', display: 'block' }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
              <p className="mt-3 text-xs text-center text-[#5A7A5A]/60">
                Use &ldquo;⬇ Export PDF&rdquo; inside the card to download · Always verify against current PI
              </p>
            </div>
          )}

          {/* ── Image Prompt Tab ── */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <GlassPanel className="p-4" intensity="light">
                <div className="flex items-start gap-3">
                  <ExternalLink size={18} className="text-[#4E6F4E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#3A5A3A] text-sm">How to use this prompt</p>
                    <p className="text-xs text-[#5A7A5A] mt-1">
                      Copy → open <span className="font-medium text-[#4E6F4E]">Google Gemini</span> or NanoBanana → paste → generate a one-page pharmacy infographic poster.
                    </p>
                  </div>
                </div>
              </GlassPanel>

              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-[#4E6F4E]">
                  📋 {drugTitle} — Image Generation Prompt
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                >
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </Button>
              </div>

              <div className="rounded-2xl border border-[#B8D4B8]/60 bg-white shadow-lg overflow-hidden">
                <div className="bg-[#0F172A] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">{drugTitle}-infographic-prompt.txt</span>
                </div>
                <pre
                  className="p-5 text-xs leading-relaxed text-[#1A1A2E] font-mono whitespace-pre-wrap break-words overflow-auto"
                  style={{ maxHeight: '520px' }}
                >
                  {prompt}
                </pre>
              </div>

              <Button
                onClick={handleCopy}
                size="lg"
                className="w-full"
                icon={copied ? <Check size={18} /> : <Copy size={18} />}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Full Prompt'}
              </Button>

              <p className="text-xs text-center text-[#5A7A5A]/60">
                Data sourced from OpenFDA label · Always verify BUD and mixing values against current PI
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
