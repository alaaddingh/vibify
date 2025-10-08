// app/api/spotify/route.ts — returns an ordered list of tracks,
// one per word in the provided sentence.
export const runtime = "nodejs"; // Buffer required (Edge lacks Buffer)

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const sentence =
    (params.get("vibe") || params.get("sentence") || params.get("q") || "").trim();

  if (!sentence) {
    return Response.json({ error: "Missing 'vibe' (sentence) query param" }, { status: 400 });
  }

  // Normalize to words, stripping punctuation; keep order
  const words = sentence
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}'’]/gu, "").trim())
    .filter(Boolean);

  if (words.length === 0) {
    return Response.json([], { status: 200 });
  }

  // Acquire app token once
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
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
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const t = await tokenRes.text().catch(() => "");
    console.error("[spotify] token error:", tokenRes.status, t);
    return Response.json({ error: "Token request failed" }, { status: 500 });
  }

  const { access_token } = await tokenRes.json();

  // For each word, find an exact title match (case-insensitive) if possible
  const results = await Promise.all(
    words.map(async (word) => {
      const wordLower = word.toLowerCase();
      const searchParams = new URLSearchParams({
        q: `track:"${word}"`,
        type: "track",
        limit: "50",
        market: "US",
      }).toString();

      try {
        const r = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
          headers: { Authorization: `Bearer ${access_token}` },
          cache: "no-store",
        });

        if (!r.ok) {
          const tt = await r.text().catch(() => "");
          console.warn("[spotify] search error for word:", word, r.status, tt);
          return null;
        }

        const data = await r.json();
        const items = data?.tracks?.items ?? [];
        if (!items.length) return null;

        // Prefer an exact, case-insensitive title match; fallback to first result
        const exact = items.find((t: any) => t?.name?.trim()?.toLowerCase() === wordLower) || items[0];

        // Return a compact object
        return {
          id: exact.id,
          name: exact.name,
          uri: exact.uri,
          external_url: exact.external_urls?.spotify,
          artists: (exact.artists || []).map((a: any) => ({ id: a.id, name: a.name })),
          album: {
            id: exact.album?.id,
            name: exact.album?.name,
            images: exact.album?.images || [],
          },
        };
      } catch (err) {
        console.warn("[spotify] search exception for word:", word, err);
        return null;
      }
    })
  );

  // Results align with words; may include nulls if a word has no match
  return Response.json(results);
}

