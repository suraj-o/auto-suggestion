import React, { useState, useEffect, useRef } from "react";

export default function Autocomplete({
  placeholder = "Search...",
  data = [
  'React', 'Redux', 'Node.js', 'Express', 'GraphQL', 'MongoDB', 'PostgreSQL',
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'Google Cloud', 'Next.js', 'Nuxt', 'Angular', 'Vue', 'Svelte'
], // array of strings for local suggestions
  fetchSuggestions = null, // optional async function (q) => Promise<string[]>
  maxSuggestions = 8,
  debounceMs = 250,
  onSelect = null, // (value) => void
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getSuggestions(query);
    }, debounceMs);
  }, [query]);

  async function getSuggestions(q) {
    setLoading(true);
    try {
      let results = [];
      if (typeof fetchSuggestions === "function") {
        const res = await fetchSuggestions(q);
        if (Array.isArray(res)) results = res;
      } else {
        const ql = q.toLowerCase();
        results = (data || [])
          .filter((s) => s && s.toLowerCase().includes(ql))
          .slice(0, 100)
          .sort((a, b) => {
            const al = a.toLowerCase();
            const bl = b.toLowerCase();
            const aStarts = al.startsWith(ql) ? 0 : 1;
            const bStarts = bl.startsWith(ql) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            if (al.length !== bl.length) return al.length - bl.length;
            return a.localeCompare(b);
          });
      }

      setSuggestions(results.slice(0, maxSuggestions));
      setOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Autocomplete: error fetching suggestions", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) selectSuggestion(suggestions[activeIndex]);
      else if (suggestions.length === 1) selectSuggestion(suggestions[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function selectSuggestion(value) {
    setQuery(value);
    setOpen(false);
    setActiveIndex(-1);
    if (typeof onSelect === "function") onSelect(value);
  }

  function highlightMatch(text, q) {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <span className="font-semibold underline decoration-yellow-400/40">{match}</span>
        {after}
      </>
    );
  }

  return (
    <div className="w-full max-w-xl" ref={containerRef}>
      <div className="relative">
        <div className="flex items-center border rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-300">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="autocomplete-list"
            aria-activedescendant={activeIndex >= 0 ? `ac-item-${activeIndex}` : undefined}
            className="w-full p-3 outline-none bg-white"
          />

          <div className="flex items-center gap-2 pr-2">
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeOpacity="0.25" fill="none" />
                <path d="M22 12a10 10 0 0 0-10-10" strokeWidth="4" stroke="currentColor" fill="none" />
              </svg>
            ) : query ? (
              <button
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setOpen(false);
                  inputRef.current?.focus();
                }}
                aria-label="Clear"
                className="p-2"
              >
                ✕
              </button>
            ) : (
              <svg className="w-5 h-5 opacity-60 mr-2" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </div>
        </div>

        {open && suggestions && suggestions.length > 0 && (
          <ul
            id="autocomplete-list"
            role="listbox"
            className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((s, idx) => (
              <li
                id={`ac-item-${idx}`}
                key={`${s}-${idx}`}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                  idx === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 text-sm truncate">{highlightMatch(s, query)}</div>
              </li>
            ))}
          </ul>
        )}

        {open && !loading && suggestions && suggestions.length === 0 && query && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg p-3 text-sm text-gray-500">
            No results for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

// Example usage:
//
// import React from 'react'
// import Autocomplete from './Autocomplete'
//
// const words = [
//   'React', 'Redux', 'Node.js', 'Express', 'GraphQL', 'MongoDB', 'PostgreSQL',
//   'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Docker', 'Kubernetes',
//   'AWS', 'Azure', 'Google Cloud', 'Next.js', 'Nuxt', 'Angular', 'Vue', 'Svelte'
// ]
//
// export default function Demo() {
//   return (
//     <div className="p-8">
//       <h1 className="mb-4 text-2xl font-bold">Autocomplete demo</h1>
//       <Autocomplete
//         placeholder="Search tech stack..."
//         data={words}
//         onSelect={(v) => alert('Selected: ' + v)}
//       />
//     </div>
//   )
// }
