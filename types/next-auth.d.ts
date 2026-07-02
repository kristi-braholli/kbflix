import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            email?: string | null;
            name?: string | null;
            image?: string | null;
            isAdmin?: boolean;
            approved?: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        isAdmin?: boolean;
        approved?: boolean;
    }
}
