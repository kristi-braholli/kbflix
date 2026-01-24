import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Billboard from "@/components/Billboard";
import CategoryRow from "@/components/CategoryRow";
import MovieModal from "@/components/MovieModal";
import useMovieCategories from "@/hooks/useMovieCategories";
import tmdb from "@/lib/tmdb";
import useMoviesByCategory from "@/hooks/useMoviesByCategory";

/* ---------------- Types ---------------- */


export interface Movie {
    id: number;
    title?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    release_date?: string;
}

interface TmdbSearchResponse {
    results: Movie[];
}

/* ---------------- Component ---------------- */

export default function Home() {
    const { categories } = useMovieCategories();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchQueryText, setSearchQueryText] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | any>(null);

    const {
        movies: selectedMovies,
        loadMovies,
        hasMore,
    } = useMoviesByCategory(selectedCategory ?? "");

    /* ---------------- Handlers ---------------- */

    const handleType = async (query: string): Promise<void> => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await tmdb.get<TmdbSearchResponse>("/search/movie", {
                params: { query, page: 1 },
            });

            const normalize = (str: string) =>
                str
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "")
                    .replace(/\s+/g, " ")
                    .trim();

            const inputNorm = normalize(query);

            const filtered = res.data.results
                .map((m) => m.title)
                .filter((title): title is string => Boolean(title))
                .filter((title) => {
                    const titleNorm = normalize(title);
                    return (
                        titleNorm.startsWith(inputNorm) ||
                        titleNorm.includes(inputNorm)
                    );
                });

            const unique: string[] = [];
            for (const title of filtered) {
                if (!unique.includes(title)) {
                    unique.push(title);
                }
            }

            setSuggestions(unique.slice(0, 10));
        } catch (err) {
            console.error("Suggestions fetch error:", err);
            setSuggestions([]);
        }
    };

    const handleSearch = async (query: string): Promise<void> => {
        try {
            const res = await tmdb.get<TmdbSearchResponse>("/search/movie", {
                params: { query },
            });

            setSearchResults(res.data.results);
            setSelectedCategory(null);
            setSearchQueryText(query);
            setSuggestions([]);
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    /* ---------------- Render ---------------- */

    return (
        <div className="bg-black">
            <Navbar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat: string | null) => {
                    setSelectedCategory(cat);
                    setSearchResults(null);
                }}
                onSearch={handleSearch}
                onType={handleType}
                suggestions={suggestions}
            />

            {!selectedCategory && !searchResults && (
                <Billboard
                    onOpenModal={(movieId: number) =>
                        setSelectedMovie({ id: movieId })
                    }
                />
            )}

            <div
                className="mt-20 px-4 md:px-16"
                style={{
                    background:
                        "linear-gradient(to bottom, #18181b 0%, #18181b 45%, red 100%)",
                }}
            >
                {searchResults ? (
                    <>
                        <h2 className="text-white text-2xl font-semibold mb-4">
                            Search Results for: {searchQueryText}
                        </h2>
                        <CategoryRow
                            key="search"
                            title=""
                            movies={searchResults}
                            isGrid
                            onSelectMovie={setSelectedMovie}
                        />
                    </>
                ) : selectedCategory ? (
                    <>
                        <CategoryRow
                            key={selectedCategory}
                            title={selectedCategory.replace("_", " ").toUpperCase()}
                            movies={selectedMovies}
                            isGrid
                            onSelectMovie={setSelectedMovie}
                        />
                        {hasMore && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => loadMovies(false)}
                                    className="bg-black hover:bg-red-800 text-white font-semibold py-2 px-6 rounded-md"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    categories.map((cat: any) => (
                        <CategoryRow
                            key={cat.key}
                            title={cat.name}
                            movies={cat.movies}
                            isGrid={false}
                            onSelectMovie={setSelectedMovie}
                        />
                    ))
                )}
            </div>

            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </div>
    );
}
