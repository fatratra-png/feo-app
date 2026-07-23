const LLM_API_URL = process.env.LLM_API_URL || '';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tags: string[];
  mood: string;
  tempo: number;
}

interface LLMResponse {
  track_ids: string[];
  reasoning: string;
}

export async function getRecommendations(
  currentTrack: TrackMetadata,
  candidates: TrackMetadata[],
  recentSkips: string[],
): Promise<LLMResponse | null> {
  if (!LLM_API_URL || !LLM_API_KEY) return null;

  const trackList = candidates.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    tags: t.tags,
    mood: t.mood,
    tempo: t.tempo,
  }));

  const prompt = `You are a music recommendation engine. Given the currently playing track and a list of candidate tracks, select the best 10 tracks to play next. Prioritize: same artist > same genre > same mood/tags > popular tracks.

Current track: ${JSON.stringify({ title: currentTrack.title, artist: currentTrack.artist, genre: currentTrack.genre, tags: currentTrack.tags, mood: currentTrack.mood, tempo: currentTrack.tempo })}

Recently skipped track IDs (deprioritize these artists/genres): ${recentSkips.join(', ') || 'none'}

Candidates: ${JSON.stringify(trackList)}

Respond with ONLY a JSON object: { "track_ids": ["id1", "id2", ...], "reasoning": "brief explanation" }`;

  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    return parsed;
  } catch {
    return null;
  }
}
