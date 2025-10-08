"use client";
import {useEffect, useMemo, useState} from "react";
import {useSearchParams, useRouter} from "next/navigation";

type Artist = { id?: string; name?: string };
type Track = {
  id?: string;
  name?: string;
  uri?: string;
  external_url?: string;
  artists?: Artist[];
  album?: { id?: string; name?: string; images?: Array<{ url: string; width?: number; height?: number }> };
};

function decodeShareData(dataParam: string | null): { sentence: string; tracks: Track[] } | null {
  if (!dataParam) return null;
  try {
    const json = decodeURIComponent(atob(dataParam));
    const obj = JSON.parse(json);
    if (obj && typeof obj.sentence === "string" && Array.isArray(obj.tracks)) {
      return { sentence: obj.sentence, tracks: obj.tracks };
    }
    return null;
  } catch {
    return null;
  }
}

export default function SharePage() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sentence, setSentence] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);

  const dataParam = params.get("data");
  const vibeParam = params.get("vibe");

  useEffect(() => {
    const decoded = decodeShareData(dataParam);
    if (decoded) {
      setSentence(decoded.sentence);
      setTracks(decoded.tracks.filter(Boolean));
      return;
    }
    const v = vibeParam?.trim();
    if (v) {
      setSentence(v);
      setLoading(true);
      fetch(`/api/spotify?vibe=${encodeURIComponent(v)}`)
        .then(async (r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then((arr) => setTracks((Array.isArray(arr) ? arr : []).filter(Boolean)))
        .catch(() => setTracks([]))
        .finally(() => setLoading(false));
    }
  }, [dataParam, vibeParam]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [typeof window === "undefined" ? "" : window.location.href]);

  return (
    <main className="min-h-dvh text-font-primary flex flex-col items-center justify-start gap-6 p-6 bg-radial-[at_50%_75%] from-[var(--bg-center)] via-[var(--bg-center)] to-[var(--background)] to-90% ">
      <div className="m-auto w-full max-w-2xl mx-auto rounded-2xl border border-primary shadow-lg p-5 space-y-4 bg-icons-secondary">
        <div>
          <p className="text-sm text-font-secondary">Sentence</p>
          <p className="mt-1 text-lg">“{sentence}”</p>
        </div>
        <div>
          <p className="text-sm text-font-secondary">Tracks ({tracks.length})</p>
          {loading ? (
            <p className="mt-2 text-font-secondary">Loading…</p>
          ) : (
            <ul className="mt-2 divide-y divide-white/10">
              {tracks.map((t, i) => (
                <li key={t.id || i} className="py-2">
                  <a
                    href={t.external_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {/* individual album image, musician name, and song name*/}
                    {t.album?.images?.[0]?.url ? (
                      <img src={t.album.images[0].url} alt={t.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-icons-secondary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-base">{t.name}</div>
                      <div className="truncate text-sm text-font-secondary">
                        {(t.artists || []).map((a) => a.name).join(", ")}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-sm text-font-secondary">Share it!</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs"
            />
            <button
              type="button"
              onClick={async () => {
                try { await navigator.clipboard.writeText(shareUrl); } catch {}
              }}
              className="px-3 py-2 rounded-lg bg-icons-primary text-black text-sm font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

