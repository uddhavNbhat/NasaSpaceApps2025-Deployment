"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon, CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/toast-provider";

interface Publication {
  Title?: string;
  Link?: string;
  Abstract?: string;
  Introduction?: string;
}

interface PublicationsData {
  [key: string]: Publication;
}

interface SummaryCache {
  [key: string]: string;
}

interface ModalState {
  isOpen: boolean;
  isLoading: boolean;
}

// Modal portal to ensure the modal is rendered at document.body and
// not trapped by parent stacking contexts (fixes transparent/partial overlay)
function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function SearchPage() {
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [publications, setPublications] = useState<PublicationsData>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Cache for storing summaries
  const [summaryCache, setSummaryCache] = useState<SummaryCache>({});
  
  // Modal states for each publication
  const [modalStates, setModalStates] = useState<{[key: string]: ModalState}>({});

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const anyOpen = Object.values(modalStates).some(s => s?.isOpen);
    const prev = typeof document !== 'undefined' ? document.body.style.overflow : undefined;
    if (anyOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (typeof document !== 'undefined' && prev !== undefined) document.body.style.overflow = prev;
    };
  }, [modalStates]);

  // Load publications data on component mount
  React.useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await fetch("/sb_publication_output.json");
        const data = await response.json();
        setPublications(data);
      } catch (error) {
        console.error("Error loading publications:", error);
      }
    };
    loadPublications();
  }, []);

  // Clean and extract text content
  const cleanText = (text: string | undefined): string => {
    if (!text) return "";
    return text
      .replace(/^(Abstract|Introduction)\s*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();
  };
  
  // Escape HTML to avoid XSS
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Convert **bold** to <strong> and URLs to clickable blue links (open in new tab)
  const formatTextToHtml = (text: string) => {
    if (!text) return '';
    // First escape
    let out = escapeHtml(text);
    // Convert bold markdown **bold**
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert URLs to links
    out = out.replace(/(https?:\/\/[\w\-._~:\/?#[\]@!$&'()*+,;=%]+)/g, (m) => {
      return `<a href="${m}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${m}</a>`;
    });
    // Preserve line breaks
    out = out.replace(/\n/g, '<br/>');
    return out;
  };

  // Search function
  const searchResults = useMemo(() => {
    if (!inputValue.trim() || !hasSearched) return [];
    
    const query = inputValue.toLowerCase();
    const results: Array<{ id: string; publication: Publication; relevance: number }> = [];

    Object.entries(publications).forEach(([id, pub]) => {
      const title = cleanText(pub.Title?.toLowerCase()) || "";
      const abstract = cleanText(pub.Abstract?.toLowerCase()) || "";
      const introduction = cleanText(pub.Introduction?.toLowerCase()) || "";
      
      let relevance = 0;
      
      if (title.includes(query)) relevance += 10;
      if (abstract.includes(query)) relevance += 5;
      if (introduction.includes(query)) relevance += 2;

      const queryWords = query.split(/\s+/).filter(word => word.length > 2);
      queryWords.forEach(word => {
        if (title.includes(word)) relevance += 3;
        if (abstract.includes(word)) relevance += 2;
        if (introduction.includes(word)) relevance += 1;
      });

      if (relevance > 0) {
        results.push({ id, publication: pub, relevance });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }, [inputValue, publications, hasSearched]);

  const handleCopyInput = async () => {
    if (inputValue.trim() !== "") {
      try {
        await navigator.clipboard.writeText(inputValue);
        showToast("Copied input!", "success");
      } catch {
        showToast("Clipboard only works on HTTPS or localhost.", "error");
      }
    } else {
      showToast("Nothing to copy", "info");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setLoading(true);
      setHasSearched(true);
      setTimeout(() => setLoading(false), 300);
    }
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const handleAiSummarize = async (publication: Publication, id: string) => {
    try {
      // Set modal state to open and loading
      setModalStates(prev => ({
        ...prev,
        [id]: { isOpen: true, isLoading: true }
      }));

      // Check cache first
      if (summaryCache[id]) {
        setModalStates(prev => ({
          ...prev,
          [id]: { isOpen: true, isLoading: false }
        }));
        return;
      }

  const apiBase = process.env.NEXT_PUBLIC_API_URI || 'http://127.0.0.1:8000';
  const response = await fetch(`${apiBase}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: `Give me content and Links on ${publication.Title}`,
          context: publication
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI summary');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      let content = '';
      if (typeof data.content === 'string') {
        content = data.content;
      } else if (typeof data === 'string') {
        content = data;
      } else {
        content = JSON.stringify(data, null, 2);
      }
      
      // Cache the result
      setSummaryCache(prev => ({
        ...prev,
        [id]: content
      }));
    } catch (error) {
      showToast('Failed to get AI summary', 'error');
      console.error('Error:', error);
      setModalStates(prev => ({
        ...prev,
        [id]: { isOpen: false, isLoading: false }
      }));
    } finally {
      setModalStates(prev => ({
        ...prev,
        [id]: { ...prev[id], isLoading: false }
      }));
    }
  };
  return (
    <main className="max-w-4xl mx-auto py-8 px-4 sm:px-8 bg-gray-100/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 my-4 sm:my-8" style={{boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}>
  <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight mb-4 sm:mb-8 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
        Search NASA Bioscience Publications
      </h1>
  <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 mb-8 sm:mb-12">
        <span className="absolute left-3 top-3 sm:left-4 sm:top-1/2 sm:-translate-y-1/2 text-indigo-400 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </span>
        <Input
          type="text"
          placeholder="Search by keyword, topic, or experiment"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="flex-1 h-12 sm:h-14 pl-10 sm:pl-12 pr-3 sm:pr-5 text-base sm:text-lg font-medium border-none bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-2xl rounded-2xl focus:ring-2 focus:ring-indigo-400 transition-all duration-200 placeholder:text-gray-700 dark:placeholder:text-gray-300 ring-1 ring-white/40"
          style={{fontFamily: 'Inter, ui-sans-serif, system-ui', boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}
        />
        <button
          type="button"
          onClick={handleCopyInput}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors border border-gray-200 dark:border-gray-700"
          aria-label="Copy input text"
        >
          <CopyIcon className="w-5 h-5 text-indigo-400" />
        </button>
        <Button type="submit" size="lg" disabled={!inputValue.trim() || loading} className="h-12 sm:h-14 px-4 sm:px-8 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:brightness-110 hover:scale-105 focus:ring-2 focus:ring-indigo-400 transition-all duration-200" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      {/* Results */}
      {!hasSearched && (
        <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground text-base sm:text-lg font-medium bg-white/60 dark:bg-black/30 rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md backdrop-blur-md" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
          <span>No results yet. Try searching for something!</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4 text-muted-foreground text-base sm:text-lg font-medium bg-white/60 dark:bg-black/30 rounded-xl px-4 sm:px-6 py-8 shadow-md backdrop-blur-md" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span>Searching publications...</span>
        </div>
      )}

      {hasSearched && !loading && searchResults.length === 0 && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground text-base sm:text-lg font-medium bg-white/60 dark:bg-black/30 rounded-xl px-4 sm:px-6 py-8 shadow-md backdrop-blur-md" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mb-2" />
          <span className="font-semibold">No results found</span>
          <span className="text-sm">Try different keywords or check your spelling</span>
        </div>
      )}

      {hasSearched && !loading && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {searchResults.map(({ id, publication }) => (
            <div key={id} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-white/40 hover:shadow-xl transition-all duration-200" style={{boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
                  {cleanText(publication.Title) || "Untitled Publication"}
                </h3>
              </div>
              
              {publication.Abstract && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}} dangerouslySetInnerHTML={{ __html: formatTextToHtml(truncateText(cleanText(publication.Abstract))) }} />
              )}
              
              <div className="flex gap-2">
                {publication.Link && (
                  <button
                    onClick={() => window.open(publication.Link?.replace(/^["']|["']$/g, ''), '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:brightness-110 hover:scale-105 transition-all duration-200"
                    style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                    Read Full Paper
                  </button>
                )}
                <button
                  onClick={() => handleAiSummarize(publication, id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:brightness-110 hover:scale-105 transition-all duration-200"
                  style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}
                  disabled={modalStates[id]?.isLoading}
                >
                  {modalStates[id]?.isLoading ? 'Summarizing...' : 'AI Summarize'}
                </button>
              </div>
            </div>
          ))}
          
          {/* Dynamic Modals */}
          {Object.entries(modalStates).map(([id, state]) => {
            if (!state.isOpen) return null;
            const pub = searchResults.find(r => r.id === id)?.publication;
            if (!pub) return null;

            return (
              <ModalPortal key={id}>
                <div className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center">
                  <div className="absolute inset-0" onClick={() => setModalStates(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }))} />
                  <div className="relative w-11/12 max-w-2xl bg-white dark:bg-[#0b0b0b] p-6 rounded-2xl shadow-2xl z-[9999] border border-white/10 max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Summary</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pub.Title}</p>
                      </div>
                      <button
                        onClick={() => {
                          setModalStates(prev => ({
                            ...prev,
                            [id]: { ...prev[id], isOpen: false }
                          }));
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      {state.isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                          <p className="text-gray-600 dark:text-gray-400">Generating AI summary...</p>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                          <div dangerouslySetInnerHTML={{ __html: formatTextToHtml(summaryCache[id] || '') }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ModalPortal>
            );
          })}
        </div>
      )}
    </main>
  );
}
