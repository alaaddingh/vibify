"use client"
import Logo from "./components/Logo";
import {FaSpotify} from "react-icons/fa";
import {useEffect, useState, ChangeEvent} from "react";
import Share from "./components/Share";
import { useRouter } from "next/navigation";
type Artist = { id?: string; name?: string };
type Track = {
  id?: string;
  name?: string;
  uri?: string;
  external_url?: string;
  artists?: Artist[];
  album?: { id?: string; name?: string; images?: Array<{ url: string; width?: number; height?: number }> };
};

export default function Home() {
  const [entry, setEntry] = useState<string>("");
  const [reccomendations, setReccomendations] = useState<Array<Track | null>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    console.log("recs:", reccomendations);
  }, [reccomendations]);

  const fetchRecsFor = async (vibe: string) => {
    setEntry(vibe);
    setLoading(true);
    setSearched(true);
    setReccomendations([]);
    try {
      const res = await fetch(`/api/spotify?vibe=${encodeURIComponent(vibe)}`);
      if (!res.ok) {
        let details: any = {};
        try { details = await res.json(); } catch {}
        console.error("/api/spotify error", res.status, details);
        return;
      }
      const recsdata = await res.json();
      setReccomendations(recsdata);
    } catch (err) {
      console.error("Network error calling /api/spotify", err);
    } finally {
      setLoading(false);
    }
  };

  
  const vibify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchRecsFor(entry);
  };

  
  return (
    <main className="min-h-dvh text-font-primary flex flex-col bg-radial-[at_50%_75%] from-[var(--bg-center)] via-[var(--bg-center)] to-[var(--background)] to-90% ">
      {/* header */}
      <header className="flex flex-col items-center mt-10">
        <Logo primary="var(--icons-primary)" secondary="var(--icons-secondary)" size={0.75} />
        <h1 className="pt-2 text-2xl tracking-wide">Silly Playlist Generator</h1>
      </header>

      {/* body */}
      <section className="flex flex-col flex-grow items-center justify-center font-semibold text-lg text-font-primary">
        <p className="pb-2 mr-25 font-light text-sm"> Write out a wacky sentence.. </p>
        <div className="pb-10 flex items-center flex-row gap-4 font-light text-sm">
          <form onSubmit={vibify} className="flex items-center gap-4 w-full max-w-lg">
            <input
              type="search"
              placeholder="e.g, I am a stinky monkey"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEntry(e.target.value)}
              value={entry}
              className="p-2 bg-icons-secondary border-1 rounded-lg flex-1"
            />
            <button type="submit" className="p-2 bg-icons-primary w-15 rounded-lg">
              GO
            </button>
          </form>
        </div>

        {/* body, conditional rendering */}
        {loading ? (
          <p className="text-font-secondary">Loading...</p>
        ) : reccomendations && reccomendations.filter(Boolean).length > 0 ? (
          <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[var(--bg-center)]/60 shadow-lg p-4">
            <ul className="divide-y divide-white/10">
              {reccomendations.filter(Boolean).map((t: any, idx: number) => (
                <li key={t.id || idx} className="py-1">
                  <a
                    href={t.external_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {t.album?.images?.[0]?.url ? (
                      <img src={t.album.images[0].url} alt={t.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-icons-secondary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-base">{t.name}</div>
                      <div className="truncate text-sm text-font-secondary">
                        {(t.artists || []).map((a: any) => a.name).join(", ")}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : searched ? (
          <p className="text-font-secondary">No exact matches found. Try different words.</p>
        ) : (
          <>
            {/* desc. area */}
            <Logo primary="var(--icons-secondary)" secondary="var(--icons-primary)" margintop={20} />
            <p className="mb-5 text-font-secondary text-center">
              Write out a wacky phrase <br /> to generate a silly playlist!
            </p>
          </>
        )}
      </section>

      {/* footer */}
      <section className="flex flex-col flex-grow items-center justify-center font-semibold text-md text-font-primary">
        <div className="w-3/4 h-px bg-font-secondary/40 my-6" />
        {!searched ? (
          <div className="flex items-center gap-4">
            <FaSpotify style={{ color: "var(--icons-primary)", scale: 2 }} />
            <p>Powered by Spotify</p>
          </div>
        ) : (
          <Share
            sentence={entry}
            tracks={(reccomendations || []).filter(Boolean) as Track[]}
            onOpen={() => {
              const compact = (reccomendations || []).filter(Boolean).map((t: any) => ({
                id: t.id,
                name: t.name,
                external_url: t.external_url,
                artists: (t.artists || []).map((a: any) => ({ id: a.id, name: a.name })),
                album: t.album?.images?.[0]?.url ? { images: [{ url: t.album.images[0].url }] } : { images: [] },
              }));
              const payload = { sentence: entry, tracks: compact };
              const json = JSON.stringify(payload);
              const data = btoa(encodeURIComponent(json));
              router.push(`/share?data=${data}`);
            }}
          />
        )}
      </section>
    </main>
  );
}
