// pages/api/suggestions.ts
import tmdb from "@/lib/tmdb";

export default async function handler(req, res) {
    const { query } = req.body;

    if (!query) return res.status(400).json({ suggestions: [] });

    try {
        const response = await tmdb.get("/search/movie", {
            params: { query, page: 1 },
        });

        const movies = response.data.results.map((m: any) => m.title).slice(0, 5); // 5 sugjerime max
        res.status(200).json({ suggestions: movies });
    } catch (err) {
        console.error(err);
        res.status(500).json({ suggestions: [] });
    }
}
