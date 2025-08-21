import React, { useState, useEffect, useRef } from "react";
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
// 'React', 'Redux', 'Node.js', 'Express', 'GraphQL', 'MongoDB', 'PostgreSQL',
// 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Docker', 'Kubernetes',
// 'AWS', 'Azure', 'Google Cloud', 'Next.js', 'Nuxt', 'Angular', 'Vue', 'Svelte'
// ]
//
// export default function Demo() {
// return (
// <div className="p-8">
// <h1 className="mb-4 text-2xl font-bold">Autocomplete demo</h1>
// <Autocomplete
// placeholder="Search tech stack..."
// data={words}
// onSelect={(v) => alert('Selected: ' + v)}
// />
// </div>
// )
// }
