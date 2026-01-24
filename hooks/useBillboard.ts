import { useEffect, useState } from "react";
import tmdb from "@/lib/tmdb";

const useBillboard = () => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchBillboard() {
            try {
                // 1️⃣ Filma popullorë
                const moviesRes = await tmdb.get("/movie/popular");
                const movies = moviesRes.data.results;

                const randomMovie =
                    movies[Math.floor(Math.random() * movies.length)];

                // 2️⃣ Trailer
                const videoRes = await tmdb.get(
                    `/movie/${randomMovie.id}/videos`
                );

                const trailer =
                    videoRes.data.results.find(
                        (v: any) =>
                            v.site === "YouTube" &&
                            (v.type === "Trailer" || v.type === "Teaser")
                    );

                if (!trailer) return;

                // 3️⃣ Billboard data
                setData({
                    id: randomMovie.id,
                    title: randomMovie.title,
                    description: randomMovie.overview,
                    thumbnailUrl: `https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`,
                    videoUrl: `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&rel=0&loop=1&playlist=${trailer.key}`
                });
            } catch (err) {
                console.error("Billboard fetch error:", err);
            }
        }

        fetchBillboard();
    }, []);

    return { data };
};

export default useBillboard;
