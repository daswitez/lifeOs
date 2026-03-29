"use client";

import { useState } from "react";

export function ColorPicker() {
  const [enabled, setEnabled] = useState(false);
  const [color, setColor] = useState("#10b981");

  return (
    <div className="mt-3 space-y-3">
      <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer w-max">
        <input 
          type="checkbox" 
          checked={enabled} 
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded border-[var(--border)] bg-transparent accent-[var(--foreground)]"
        />
        <span>Enable custom color</span>
      </label>
      
      {enabled && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border-2 border-[var(--border)] p-0.5 bg-transparent"
          />
          <input
            type="text"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="block w-28 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono text-[var(--foreground)] outline-none hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)]/80"
          />
        </div>
      )}
    </div>
  );
}
