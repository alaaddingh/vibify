export const runtime = "nodejs";

const STOPWORD_OVERRIDES: Record<string, string> = {
  i: '7wdzLe2Gsx1RGqbvYZHASz', am: '5omYVLodGmaxnhua99xIE8', you: '0hcW7qPqWWJc8189OaqQvX', he: '5MES8pWN75QiZaFCdaHtp1', she: '6SQLk9HSNketfgs2AyIiMs', it: '5RMlyZp5bVeo4Pjoab6Puw', we: '21ZnJc0Dzia8z32HTLuN0Y', they: '5HiVagjTjqdvu3Ke2aqMc7',
  a: '3fbyI27JXFkYK4hL1NSLei',
  me: '2Rk4JlNc2TPmZe2af99d45', is: '01xk3w0V2OxuUDfE8y98HV', was: '01xk3w0V2OxuUDfE8y98HV', were: '1Q7G91IUn88PmpTnpm467S',
   on: '0fZRNhPJ4AGmwY7rkpdbqK', at: '23lpXblF7QUq7iRA5s4NRO', to: '', from: '', for: '', of: '', by: '', with: '',
  and: '', or: '', but: '',
  do: '', does: '', did: '', have: '', has: '', had: '',
  can: '', could: '', should: '', would: '', will: '',
  not: '', no: '', yes: '',

};

async function findExactTrack(word: string, token: string) {
  const w = word.toLowerCase();

  // 1) Stopword override path
  if (w in STOPWORD_OVERRIDES) {
    const id = STOPWORD_OVERRIDES[w];
    if (!id) return null; // explicitly skip this word
    const r = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return await r.json();
  }

  // 2) Exact title search path
  const queries = [`track:"${word}"`, word]; // quoted, then general
  for (const q of queries) {
    for (let offset = 0; offset < 10000; offset += 50) {
      const url =
        "https://api.spotify.com/v1/search?" +
        new URLSearchParams({
          q,
          type: "track",
          limit: "50",
          offset: String(offset),
        });
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      const items = data?.tracks?.items ?? [];
      const exact =
        items.find((t: any) => (t?.name || "").toLowerCase().trim() === w) || null;
      if (exact) return exact;
      if (items.length < 50) break; // no more pages
    }
  }
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sentence =
    url.searchParams.get("vibe") ||
    url.searchParams.get("sentence") ||
    url.searchParams.get("q") ||
    url.searchParams.get("word") ||
    "";
  const words = sentence.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return Response.json([]);

  // token
  const tok = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
  }).then((r) => r.json());
  const token = tok.access_token as string;

  // exact one-word match per word (with overrides), in order
  const tracks = await Promise.all(words.map((w) => findExactTrack(w, token)));
  return Response.json(tracks);
}
