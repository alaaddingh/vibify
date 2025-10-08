"use client";
import { useMemo, useState } from "react";
import { FaShareAltSquare } from "react-icons/fa";

type ShareProps = {
  sentence: string;
  tracks: any[];
  onOpen?: () => void;
};

export default function Share({ sentence, tracks, onOpen }: ShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  //either renders stand-alone footer button or deep-linked share page (is used in 'Share' route folder)
  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        title="Share playlist"
        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <FaShareAltSquare style={{ color: "silver", scale: 2 }} />
      </button>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-[var(--bg-center)]/60 shadow-lg p-5 space-y-4">
      <div>
        <p className="text-sm text-font-secondary">Your sentence</p>
        <p className="mt-1 text-lg">“{sentence}”</p>
      </div>
      <div>
        <p className="text-sm text-font-secondary">Tracks ({tracks?.length || 0})</p>
        <ul className="mt-2 max-h-48 overflow-auto space-y-1">
          {(tracks || []).map((t: any, i: number) => (
            <li key={t?.id || i} className="text-sm truncate">
              {t?.name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm text-font-secondary">Shareable link</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs"
          />
          <button
            type="button"
            onClick={copy}
            className="px-3 py-2 rounded-lg bg-icons-primary text-black text-sm font-medium"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
