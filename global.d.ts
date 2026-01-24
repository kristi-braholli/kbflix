import {PrismaClient} from "@prisma/client";

declare global {
    namespace globalThis {
        var prismadb: PrismaClient;
    }
}

export {};

declare global {
    interface Window {
        YT?: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}