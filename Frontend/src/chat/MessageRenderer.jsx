import React from 'react';
import { MapPin, Mountain, Home, Bike } from 'lucide-react';

const ROUTE_BADGE_RE = /\b(Nainital|Rishikesh|Kedarnath|Badrinath|Mussoorie|Dehradun|Haridwar|Auli|Chopta|Munsiyari|Lansdowne|Jim Corbett)\b/gi;
const PRICE_RE = /₹[\d,]+(?:\/night|\/day|\/km)?/g;

function RouteChip({ name }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-[10px] font-semibold mx-0.5">
      <MapPin size={9} />
      {name}
    </span>
  );
}

function PriceChip({ price }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10px] font-bold mx-0.5">
      {price}
    </span>
  );
}

function renderInlineTokens(text) {
  const parts = [];
  let last = 0;
  let combined = [];

  // Collect all matches with their type
  const allMatches = [];
  let m;
  const routeRe = new RegExp(ROUTE_BADGE_RE.source, 'gi');
  const priceRe = new RegExp(PRICE_RE.source, 'g');
  while ((m = routeRe.exec(text)) !== null) allMatches.push({ type: 'route', match: m[0], index: m.index, end: m.index + m[0].length });
  while ((m = priceRe.exec(text)) !== null) allMatches.push({ type: 'price', match: m[0], index: m.index, end: m.index + m[0].length });
  allMatches.sort((a, b) => a.index - b.index);

  // Deduplicate overlapping
  const deduped = [];
  let cursor = 0;
  for (const hit of allMatches) {
    if (hit.index >= cursor) { deduped.push(hit); cursor = hit.end; }
  }

  last = 0;
  for (const hit of deduped) {
    if (hit.index > last) parts.push(text.slice(last, hit.index));
    if (hit.type === 'route') parts.push(<RouteChip key={hit.index} name={hit.match} />);
    else parts.push(<PriceChip key={hit.index} price={hit.match} />);
    last = hit.end;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    if (/^#{1,3}\s/.test(line)) {
      const lvl = line.match(/^(#+)/)[1].length;
      const content = line.replace(/^#+\s/, '');
      const cls = lvl === 1 ? 'text-sm font-black text-white mt-2 mb-1' : lvl === 2 ? 'text-xs font-bold text-stone-100 mt-2 mb-0.5' : 'text-[11px] font-bold text-emerald-300 mt-1';
      return <div key={i} className={cls}>{renderInlineTokens(content)}</div>;
    }
    if (/^[-*]\s/.test(line)) {
      return (
        <div key={i} className="flex items-start gap-1.5 text-[11px] text-stone-300 leading-relaxed">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
          <span>{renderInlineTokens(line.replace(/^[-*]\s/, ''))}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      return (
        <div key={i} className="flex items-start gap-2 text-[11px] text-stone-300 leading-relaxed">
          <span className="font-bold text-emerald-400 flex-shrink-0 w-4">{num}.</span>
          <span>{renderInlineTokens(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    return <p key={i} className="text-[11px] text-stone-300 leading-relaxed">{renderInlineTokens(line)}</p>;
  });
}

export default function MessageRenderer({ role, content, isStreaming }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-2">
        <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-tr-sm bg-emerald-600 text-white text-[11px] leading-relaxed shadow-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-2">
      <div className="max-w-[88%] px-3 py-2.5 rounded-2xl rounded-tl-sm bg-stone-800/80 border border-stone-700/60 shadow-sm space-y-0.5">
        {renderMarkdown(content)}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse rounded-sm ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}
