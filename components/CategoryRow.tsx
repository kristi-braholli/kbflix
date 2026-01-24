import React from "react";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
}

interface CategoryRowProps {
    title: string;
    movies: Movie[];
    isGrid?: boolean;
    onSelectMovie: (movie: Movie) => void; // ✅ New prop
}

const CategoryRow: React.FC<CategoryRowProps> = ({ title, movies, isGrid = false, onSelectMovie }) => {
    return (
        <div className="mb-12 px-4 md:px-0">
            <h2 className="text-white text-2xl font-bold mb-4">{title}</h2>

            {isGrid ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies.map((movie) => (
                        <div
                            onClick={() => onSelectMovie(movie)}
                            key={movie.id}
                            className="bg-zinc-900 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                            <p className="text-white text-sm mt-1 px-1">{movie.title}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide touch-pan-x">
                    {movies.map((movie) => (
                        <div
                            onClick={() => onSelectMovie(movie)}
                            key={movie.id}
                            className="min-w-[140px] sm:min-w-[180px] md:min-w-[200px] bg-zinc-900 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                            <p className="text-white text-sm mt-1 px-1">{movie.title}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryRow;