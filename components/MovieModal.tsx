import React, { useEffect, useState, useRef } from "react";
import tmdb from "@/lib/tmdb";

export default function MovieModal({ movie, onClose }: any) {
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [details, setDetails] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isWatchingMovie, setIsWatchingMovie] = useState(false); // ✅ New state
    const [imdbId, setImdbId] = useState<string | null>(null); // ✅ New state
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // Merr trailer nga TMDB
        tmdb.get(`/movie/${movie.id}/videos`).then(res => {
            const trailer =
                res.data.results.find((v: any) => v.type === "Trailer") ||
                res.data.results.find((v: any) => v.type === "Teaser");

            setTrailerKey(trailer?.key || null);
        });

        // Merr detajet e filmit
        tmdb.get(`/movie/${movie.id}`).then(res => {
            setDetails(res.data);
        });

        // Merr IMDB ID
        tmdb.get(`/movie/${movie.id}/external_ids`).then(res => {
            setImdbId(res.data.imdb_id);
        });
    }, [movie.id]);

    useEffect(() => {
        if (!trailerKey || isWatchingMovie) return; // ✅ Don't init player if watching movie

        const initPlayer = () => {
            // Destroy existing player if any
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.log("Player destroy error:", e);
                }
            }

            const playerId = `modal-player-${movie.id}`;

            try {
                playerRef.current = new window.YT.Player(playerId, {
                    videoId: trailerKey,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        modestbranding: 1,
                        showinfo: 0,
                        rel: 0,
                        fs: 0,
                        iv_load_policy: 3,
                        disablekb: 1,
                        playsinline: 1,
                        mute: 0
                    },
                    events: {
                        onStateChange: (event: any) => {
                            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);

                            if (event.data === window.YT.PlayerState.ENDED) {
                                playerRef.current.seekTo(0);
                                playerRef.current.pauseVideo();
                                setIsPlaying(false);
                            }
                        },
                        onReady: (event: any) => {
                            console.log("Player ready!");
                            event.target.playVideo();
                            setIsPlaying(true);
                        }
                    }
                });
            } catch (e) {
                console.error("Error creating player:", e);
            }
        };

        if (window.YT && window.YT.Player) {
            console.log("YouTube API already loaded, initializing player");
            initPlayer();
        } else {
            console.log("Loading YouTube API");
            if (!window?.YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            }
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.log("Cleanup error:", e);
                }
                playerRef.current = null;
            }
        };
    }, [trailerKey, movie.id, isWatchingMovie]);

    const togglePlay = () => {
        if (playerRef.current && playerRef.current.playVideo) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    const toggleMute = () => {
        if (playerRef.current && playerRef.current.mute) {
            if (isMuted) {
                playerRef.current.unMute();
            } else {
                playerRef.current.mute();
            }
            setIsMuted(!isMuted);
        }
    };

    const handleWatchMovie = () => {
        // Destroy YouTube player
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) {
                console.log("Error destroying player:", e);
            }
            playerRef.current = null;
        }
        setIsWatchingMovie(true);
    };

    const handleBackToTrailer = () => {
        setIsWatchingMovie(false);
    };

    if (!details) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative w-[90%] md:w-[900px] bg-zinc-900 rounded-lg overflow-hidden">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-50 text-white text-xl hover:text-gray-300"
                >
                    ✕
                </button>

                {/* Video Area */}
                {isWatchingMovie && imdbId ? (
                    // Show full movie
                    <div className="relative w-full h-[260px] md:h-[420px] bg-black">
                        <iframe
                            src={`https://vidsrc-embed.ru/embed/movie?imdb=${imdbId}`}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                        />
                        {/* Back to Trailer button */}
                        <button
                            onClick={handleBackToTrailer}
                            className="absolute top-4 left-4 bg-zinc-800/80 hover:bg-zinc-700 text-white px-3 py-2 rounded-md text-sm font-semibold z-10"
                        >
                            ← Back to Trailer
                        </button>
                    </div>
                ) : trailerKey ? (
                    // Show trailer
                    <div className="relative w-full h-[260px] md:h-[420px] bg-black overflow-hidden">
                        <div
                            id={`modal-player-${movie.id}`}
                            className="absolute -top-[60px] -bottom-[150px] left-0 right-0 w-full h-[calc(100%+210px)]"
                        ></div>

                        {/* Control Buttons */}
                        <div className="absolute bottom-4 left-4 flex gap-3 z-10">
                            <button
                                onClick={togglePlay}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold"
                            >
                                {isPlaying ? '⏸ Pause' : '▶ Play'}
                            </button>

                            <button
                                onClick={toggleMute}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md font-semibold"
                            >
                                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-[260px] md:h-[420px] flex items-center justify-center text-gray-400">
                        Trailer not available
                    </div>
                )}

                {/* Movie Info */}
                <div className="p-6 text-white">
                    <h2 className="text-2xl font-bold mb-4">{details.title}</h2>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-3 mb-5">
                        {/* Watch Movie */}
                        <button
                            onClick={handleWatchMovie}
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md font-semibold"
                            disabled={!imdbId}
                        >
                            🎥 Watch Movie
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 mb-4">{details.overview}</p>

                    {/* Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>⭐ {details.vote_average?.toFixed(1)}</span>
                        <span>👥 {details.vote_count} votes</span>
                        <span>📅 {details.release_date}</span>
                        <span>⏱ {details.runtime} min</span>
                    </div>

                    {/* Genres */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {details.genres?.map((g: any) => (
                            <span
                                key={g.id}
                                className="text-xs bg-zinc-800 px-3 py-1 rounded-full"
                            >
                                {g.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}