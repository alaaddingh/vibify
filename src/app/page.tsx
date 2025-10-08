"use client"
import Logo from "./components/Logo";
import { FaSpotify } from "react-icons/fa";
import {useEffect, useState, ChangeEvent } from "react";

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
  const[reccomendations, setReccomendations] = useState<Array<Track | null>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);


  useEffect(() => {
    console.log("recs:", reccomendations);
  }, [reccomendations]);


  const vibify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    setReccomendations([]);
    try {
      const res = await fetch(`/api/spotify?vibe=${encodeURIComponent(entry)}`);
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
  
  return (
    <main className="min-h-dvh text-font-primary flex flex-col bg-radial-[at_50%_75%] from-[var(--bg-center)] via-[var(--bg-center)] to-[var(--background)] to-90% ">
      {/* Header */}
      <header className="flex flex-col items-center mt-10">
          <Logo
            primary="var(--icons-primary)"
            secondary="var(--icons-secondary)"
            size= {0.75}
           />
        <h1 className="pt-2 text-2xl tracking-wide">
          Silly Playlist Generator
        </h1>
       </header>

      {/* Body */}
      <section className="flex flex-col flex-grow items-center justify-center font-semibold text-lg text-font-primary">
            <p
              className="pb-2 mr-25 font-light text-sm"
              > Write out a wacky sentence.. </p>
          <div className="pb-10 flex items-center flex-row gap-4 font-light text-sm">
            <form onSubmit={vibify} className="flex items-center gap-4 w-full max-w-lg">
              <input 
                type="search"
                placeholder="e.g, Sea Sailing Playlist.."
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEntry(e.target.value)}
                value={entry}
                className="p-2 bg-icons-secondary border-1 rounded-lg flex-1"
              />
              <button
                type="submit"
                className="p-2 bg-icons-primary w-15 rounded-lg"
              >
                GO
              </button>
            </form>
          </div>

          {/* Results or description */}
          {loading ? (
            <p className="text-font-secondary">Loading…</p>
          ) : reccomendations && reccomendations.filter(Boolean).length > 0 ? (
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reccomendations.filter(Boolean).map((t: any, idx: number) => (
                <a
                  key={t.id || idx}
                  href={t.external_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-icons-secondary/40 hover:bg-icons-secondary/60 transition-colors"
                >
                  {t.album?.images?.[0]?.url ? (
                    <img src={t.album.images[0].url} alt={t.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-icons-secondary" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-base">{t.name}</span>
                    <span className="text-sm text-font-secondary">
                      {(t.artists || []).map((a: any) => a.name).join(", ")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : searched ? (
            <p className="text-font-secondary">No exact matches found. Try different words.</p>
          ) : (
            <>
              {/* Description area */}
              <Logo
                primary="var(--icons-secondary)"
                secondary="var(--icons-primary)"
                margintop={20}
              />
              <p className="text-font-secondary text-center">Write out a wacky phrase <br></br>
              to generate a silly playlist!</p>
            </>
          )}
        </section>

      {/* Footer */}
      <section className="flex flex-col flex-grow items-center justify-center font-semibold text-md text-font-primary">

          <div className="w-3/4 h-px bg-font-secondary/40 my-6" />
          <div className="flex items-center gap-4">
            <FaSpotify
              style={{color: "var(--icons-primary)", scale: 2}}
            />
            <p>Powered by Spotify</p>
          </div>
      </section>
    </main>


  );
}
