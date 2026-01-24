import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Billboard from "@/components/Billboard";
import CategoryRow from "@/components/CategoryRow";
import MovieModal from "@/components/MovieModal";
import useMovieCategories from "@/hooks/useMovieCategories";
import tmdb from "@/lib/tmdb";
import useMoviesByCategory from "@/hooks/useMoviesByCategory";

export default function Home() {
    const { categories } = useMovieCategories();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchQueryText, setSearchQueryText] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null); // ✅ Global modal state

    const { movies: selectedMovies, loadMovies, hasMore } = useMoviesByCategory(selectedCategory || "");

    const handleType = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await tmdb.get("/search/movie", {
                params: { query, page: 1 },
            });

            const normalize = (str: string) =>
                str.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

            const inputNorm = normalize(query);

            const filtered = res.data.results
                .map((m: any) => m.title)
                .filter((title: string) => {
                    const titleNorm = normalize(title);
                    return titleNorm.startsWith(inputNorm) || titleNorm.includes(inputNorm);
                });

            setSuggestions(Array.from(new Set(filtered)).slice(0, 10));
        } catch (err) {
            console.error("Suggestions fetch error:", err);
            setSuggestions([]);
        }
    };

    const handleSearch = async (query: string) => {
        try {
            const res = await tmdb.get("/search/movie", {
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

    return (
        <div className="bg-black">
            <Navbar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSearchResults(null);
                }}
                onSearch={handleSearch}
                onType={handleType}
                suggestions={suggestions}
            />

            {!selectedCategory && !searchResults && (
                <Billboard onOpenModal={(movieId) => setSelectedMovie({ id: movieId })} />
            )}

            <div className="mt-20 px-4 md:px-16 bg-gradiAent-to-b from-[#18181b] to-red-800"
                 style={{ background: "linear-gradient(to bottom, #18181b 0%, #18181b 45%, red 100%)" }}>
                {searchResults ? (
                    <>
                        <h2 className="text-white text-2xl font-semibold mb-4">
                            Search Results for: "{searchQueryText}"
                        </h2>
                        <CategoryRow
                            key="search"
                            title=""
                            movies={searchResults}
                            isGrid={true}
                            onSelectMovie={setSelectedMovie}
                        />
                    </>
                ) : selectedCategory ? (
                    <>
                        <CategoryRow
                            key={selectedCategory}
                            title={selectedCategory.replace("_", " ").toUpperCase()}
                            movies={selectedMovies}
                            isGrid={true}
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
                    categories.map((cat) => (
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

            {/* ✅ Global Modal */}
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </div>
    );
}