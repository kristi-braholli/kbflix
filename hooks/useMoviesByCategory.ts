import { useEffect, useState } from "react";
import tmdb from "@/lib/tmdb";

// Map string keys to TMDB genre IDs
const genreMap: Record<string, number> = {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    history: 36,
    horror: 27,
    music: 10402,
    mystery: 9648,
    romance: 10749,
    sci_fi: 878,
    tv_movie: 10770,
    thriller: 53,
    war: 10752,
    western: 37,
};

const useMoviesByCategory = (categoryKey: string) => {
    const [movies, setMovies] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadMovies = async (reset: boolean = false) => {
        if (!categoryKey) return;

        try {
            let endpoint = "/movie/popular";
            let params: any = { page: reset ? 1 : page };

            if (categoryKey === "top_rated") endpoint = "/movie/top_rated";
            else if (categoryKey === "upcoming") endpoint = "/movie/upcoming";
            else {
                endpoint = "/discover/movie";
                params.with_genres = genreMap[categoryKey];
            }

            const res = await tmdb.get(endpoint, { params });

            if (reset) {
                setMovies(res.data.results);
                setPage(2);
            } else {
                setMovies((prev) => [...prev, ...res.data.results]);
                setPage((prev) => prev + 1);
            }

            setHasMore(res.data.page < res.data.total_pages);
        } catch (err) {
            console.error("Movies fetch error:", err);
        }
    };

    useEffect(() => {
        if (!categoryKey) return;
        loadMovies(true); // reset when category changes
    }, [categoryKey]);

    return { movies, loadMovies, hasMore };
};

export default useMoviesByCategory;
