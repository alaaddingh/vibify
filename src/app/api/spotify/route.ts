export const runtime = "nodejs";



// hardcoded song IDs for stopper words (API is a bit annoying)
const STOPWORD_OVERRIDES: Record<string, string> = {
  i: '7wdzLe2Gsx1RGqbvYZHASz', am: '5omYVLodGmaxnhua99xIE8', you: '0hcW7qPqWWJc8189OaqQvX', he: '5MES8pWN75QiZaFCdaHtp1', she: '6SQLk9HSNketfgs2AyIiMs', it: '5RMlyZp5bVeo4Pjoab6Puw', we: '21ZnJc0Dzia8z32HTLuN0Y', they: '5HiVagjTjqdvu3Ke2aqMc7',
  a: '3fbyI27JXFkYK4hL1NSLei',
  me: '2Rk4JlNc2TPmZe2af99d45', is: '01xk3w0V2OxuUDfE8y98HV', was: '01xk3w0V2OxuUDfE8y98HV', were: '1Q7G91IUn88PmpTnpm467S',
   on: '0fZRNhPJ4AGmwY7rkpdbqK', at: '23lpXblF7QUq7iRA5s4NRO', from: '5agmWuBAor2UQcNqByOvWC',
  and: '0vBU67PO1Et2EmLuMrLO0B', but: '7cQA473EDBf6VTmoERARtT',
  have: '2tyMpfWoDcvKITX5kANpjZ', has: '1WxlAC8X5NGx2ZDJrDSR7I', had: '0uwXUmgQNzhPofwIGubhtX',
  can: '04dwKexmvS72dg9xfNjRYx', could: '', should: '3FjHWRfmNNYClBLZVtQAYT', would: '03RHqSKX3InFMqhTIjKamS', will: '40ijlFtuamT3J2zR2mwfmm',
  not: '1pKgowJO3me94yeQg7qZ8J', no: '0l0CvurVUrr2w3Jj1hOVFc', yes: '0Rdfu7NQubmGmYz90usRCU', like: '55Ctj6nVfobn9AcPe6sLG2',
  this: '0pJfsPQesJyCnR5XWZyvj9', day: "5cCMNwD4NUQjHI7bHRQNxl", are: "3vWdcEFgGYMN7Iu1rgPuTb", for: "1zpKDAAT4ADo3PxKWWAyKT?", to: "3RGb0VDcsKEl5nfsvK8kcv", going: "2cZy6nPKRxRmOKJoF49VZJ"

};

async function findExactTrack(word: string, token: string) {
  const w = word.toLowerCase();

  if (w in STOPWORD_OVERRIDES) {
    const id = STOPWORD_OVERRIDES[w];
    if (!id) return null; // skip  word
    const r = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return await r.json();
  }

  const queries = [`track:"${word}"`, word]; 
  for (const q of queries) {
    for (let offset = 0; offset < 20000; offset += 50) {
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
      if (items.length < 50) break;
    }
  }
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sentence =
    url.searchParams.get("vibe") ||
    url.searchParams.get("q") ||
    url.searchParams.get("word") ||
    "";
  const words = sentence.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return Response.json([]);

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

  const tracks = await Promise.all(words.map((w) => findExactTrack(w, token)));
  return Response.json(tracks);
}
