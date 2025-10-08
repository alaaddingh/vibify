"use client"
import Logo from "./components/Logo";
import { FaSpotify } from "react-icons/fa";
import {useEffect, useState, ChangeEvent } from "react";
export default function Home() {

  const [entry, setEntry] = useState<string>("");
  const[reccomendations, setReccomendations] = useState<Array<object>>([]);


  useEffect(() => {
    console.log("recs:", reccomendations);
  }, [reccomendations]);


  const vibify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const res = await fetch(`/api/spotify?word=${encodeURIComponent(entry)}`);
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
          Playlist Generator
        </h1>
       </header>

      {/* Body*/}
      {reccomendations ? (
        <section className="flex flex-col flex-grow items-center justify-center font-semibold text-lg text-font-primary">
          {/* Search Bar */}
            <p
              className="pb-2 mr-35 font-light text-sm"
              > Search for your vibe.. </p>
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



          {/* Description area */}
          <Logo
            primary="var(--icons-secondary)"
            secondary="var(--icons-primary)"
            margintop={20}
          />
          <p className="text-font-secondary text-center">Describe your unique vibe <br></br>
          to generate a curated and
          shareable playlist.</p>
        </section>
      ) :
      (
        <div>
          pooop
        </div>
      )
    }

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
