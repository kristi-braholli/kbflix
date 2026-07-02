import React, { useEffect, useState, useRef } from "react";
import tmdb from "@/lib/tmdb";

export default function MovieModal({ movie, onClose, openedFromMoreInfo = false }: any) {
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [details, setDetails] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isWatchingMovie, setIsWatchingMovie] = useState(openedFromMoreInfo);
    const [imdbId, setImdbId] = useState<string | null>(null);
    const playerRef = useRef<any>(null);
    const [server, setServer] = useState<string | null>(null);
    const [movieIdType, setMovieIdType] = useState<string | null>(null);

    console.log(imdbId,movie.id)
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
        if (!trailerKey || isWatchingMovie) return;

        let interval: any;

        const initPlayer = () => {
            if (!window.YT || !window.YT.Player) return;

            if (playerRef.current) return;

            const playerId = `modal-player-${movie.id}`;

            playerRef.current = new window.YT.Player(playerId, {
                videoId: trailerKey,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                    playsinline: 1,
                    mute: 1, // 🔥 MUST BE MUTED
                },
                events: {
                    onReady: (e: any) => {
                        e.target.mute();       // 🔥 force mute
                        e.target.playVideo(); // 🔥 then play
                        setIsMuted(true);
                        setIsPlaying(true);
                    },
                    onStateChange: (e: any) => {
                        setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
                    },
                },
            });

            clearInterval(interval);
        };

        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        }

        interval = setInterval(initPlayer, 300);

        return () => {
            clearInterval(interval);
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch {}
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

    function handleWatchMovie (server: any, type: any){
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
        setServer(server)
        setMovieIdType(type)
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
                            src={`${server}${movieIdType}`}
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
                            onClick={()=> {handleWatchMovie(process.env.NEXT_PUBLIC_SERVER_1, imdbId)}}
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md font-semibold"
                            disabled={!imdbId}
                        >
                            🎥 Watch Movie
                        </button>
                        <button
                            onClick={()=> {handleWatchMovie(process.env.NEXT_PUBLIC_SERVER_2_FALLBACK, movie.id)}}
                            className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-md font-semibold"
                            disabled={!imdbId}
                        >
                            🎥 Server 2
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
