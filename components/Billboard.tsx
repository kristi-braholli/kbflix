import React, {useCallback, useState, useRef, useEffect} from "react";
import useBillboard from "@/hooks/useBillboard";

import {AiOutlineInfoCircle} from "react-icons/ai";
import {VscMute, VscUnmute} from "react-icons/vsc";
import {BsPlayFill, BsPauseFill} from "react-icons/bs";
import useInfoModal from "@/hooks/useInfoModal";
import useMuteBillboard from "@/hooks/useMuteBillboard";

interface BillboardProps {
    onOpenModal: (movieId: any) => void;
}

const Billboard: React.FC<BillboardProps> = ({ onOpenModal }) => {
    const {data} = useBillboard()
    const {openModal} = useInfoModal()
    const {isMuted, muteBillboard, unmuteBillboard} = useMuteBillboard()
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef<any>(null);

    const handleOpenModal = useCallback(() => {
        if (playerRef.current) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        }
        onOpenModal(data?.id);
    }, [onOpenModal, data?.id])

    useEffect(() => {
        let interval: any;

        const loadPlayer = () => {
            if (window.YT && window.YT.Player && data?.videoUrl) {
                const videoId =
                    new URL(data.videoUrl).searchParams.get("v") ||
                    data.videoUrl.split("/").pop()?.split("?")[0];

                if (playerRef.current) return;

                playerRef.current = new window.YT.Player("billboard-player", {
                    videoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0,
                        fs: 0,
                        mute: 1,
                        loop: 1,
                        playlist: videoId,
                    },
                    events: {
                        onReady: (e: any) => {
                            e.target.mute();
                            e.target.playVideo();
                            setIsPlaying(true);
                        },
                        onStateChange: (e: any) => {
                            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
                        },
                    },
                });

                clearInterval(interval);
            }
        };

        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        }

        interval = setInterval(loadPlayer, 300);

        return () => clearInterval(interval);
    }, [data?.videoUrl]);


    const handleToggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.unMute();
                unmuteBillboard();
            } else {
                playerRef.current.mute();
                muteBillboard();
            }
        }
    };

    const handleTogglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    const MuteIcon = isMuted ? VscMute : VscUnmute;
    const PlayIcon = isPlaying ? BsPauseFill : BsPlayFill;

    return (
        <div className="relative h-[60vh] sm:h-[70vh] md:h-screen md:max-h-[56.25vw]">
            {data?.videoUrl && (
                <div className="relative w-full h-full overflow-hidden">
                    <div
                        id="billboard-player"
                        className="absolute -top-[100px] sm:-top-[150px] md:-top-[200px] -bottom-[100px] sm:-bottom-[150px] md:-bottom-[200px] left-0 w-full h-[calc(100%+200px)] sm:h-[calc(100%+300px)] md:h-[calc(100%+400px)]"
                    />
                </div>
            )}

            <div className="absolute inset-x-0 bottom-8 sm:bottom-12 md:bottom-16 lg:bottom-24 px-4 sm:px-8 md:px-12 lg:px-16 z-10">
                <p className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold drop-shadow-xl mb-2 sm:mb-3 md:mb-4 w-full sm:w-[80%] md:w-[70%] lg:w-[60%]">
                    {data?.title}
                </p>
                <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg drop-shadow-xl mb-3 sm:mb-4 md:mb-5 w-full sm:w-[90%] md:w-[80%] lg:w-[60%] line-clamp-3 md:line-clamp-none">
                    {data?.description}
                </p>
                <div className="flex flex-row items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleTogglePlay}
                        className="bg-white rounded-md py-1.5 px-3 sm:py-2 sm:px-4 md:py-2 md:px-5 text-xs sm:text-sm md:text-base lg:text-lg font-semibold flex flex-row items-center hover:bg-neutral-300 transition"
                    >
                        <PlayIcon className="text-black w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
                    </button>
                    <button
                        onClick={handleToggleMute}
                        className="bg-white text-white bg-opacity-30 rounded-md py-1.5 px-3 sm:py-2 sm:px-4 md:py-2 md:px-5 text-xs sm:text-sm md:text-base lg:text-lg font-semibold flex flex-row items-center hover:bg-opacity-20 transition"
                    >
                        <MuteIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-0 sm:mr-1"/>
                        <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
                    </button>
                    <button
                        onClick={handleOpenModal}
                        className="bg-white text-white bg-opacity-30 rounded-md py-1.5 px-3 sm:py-2 sm:px-4 md:py-2 md:px-5 text-xs sm:text-sm md:text-base lg:text-lg font-semibold flex flex-row items-center hover:bg-opacity-20 transition">
                        <AiOutlineInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2"/>
                        <span className="hidden sm:inline">More Info</span>
                        <span className="sm:hidden">Info</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Billboard