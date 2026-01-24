import { useEffect, useState } from "react";
import tmdb from "@/lib/tmdb";

interface Category {
    id: number;
    key: string;      // new string key for dropdown / fetching
    name: string;
    movies: any[];
}

const genreKeyMap: Record<number, string> = {
    28: "action",
    12: "adventure",
    16: "animation",
    35: "comedy",
    80: "crime",
    99: "documentary",
    18: "drama",
    10751: "family",
    14: "fantasy",
    36: "history",
    27: "horror",
    10402: "music",
    9648: "mystery",
    10749: "romance",
    878: "sci_fi",
    10770: "tv_movie",
    53: "thriller",
    10752: "war",
    37: "western",
};

const useMovieCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const genreRes = await tmdb.get("/genre/movie/list");
                const genres = genreRes.data.genres;

                const categoryPromises = genres.map(async (genre: any) => {
                    const moviesRes = await tmdb.get("/discover/movie", {
                        params: { with_genres: genre.id },
                    });

                    return {
                        id: genre.id,
                        key: genreKeyMap[genre.id] || genre.name.toLowerCase(), // use string key
                        name: genre.name,
                        movies: moviesRes.data.results,
                    };
                });

                const allCategories = await Promise.all(categoryPromises);
                setCategories(allCategories);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        }

        fetchCategories();
    }, []);

    return { categories };
};

export default useMovieCategories;
