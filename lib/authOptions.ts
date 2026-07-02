import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";

import { isAdminEmail } from "@/lib/admin";
import prismadb from "@/lib/prismadb";
import {
    approveAdminUsers,
    ensureUserDataReady,
    findUserByEmail,
} from "@/lib/users";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await ensureUserDataReady();

                const user = await findUserByEmail(credentials.email);

                if (!user || !user.hashedPassword) {
                    return null;
                }

                const isCorrectPassword = await compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isCorrectPassword) {
                    return null;
                }

                if (!user.approved) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    pages: {
        signIn: "/auth",
        error: "/auth",
    },
    debug: process.env.NODE_ENV === "development",
    adapter: PrismaAdapter(prismadb),
    session: {
        strategy: "jwt",
    },
    events: {
        async createUser({ user }) {
            await ensureUserDataReady();

            const approved = isAdminEmail(user.email);
            await prismadb.user.update({
                where: { id: user.id },
                data: { approved },
            });
        },
    },
    callbacks: {
        async signIn({ user }) {
            try {
                await ensureUserDataReady();

                if (isAdminEmail(user.email)) {
                    await approveAdminUsers();
                    return true;
                }

                const dbUser = await findUserByEmail(user.email || "");
                if (dbUser && !dbUser.approved) {
                    return false;
                }

                return true;
            } catch (error) {
                console.error("signIn callback error:", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user?.email) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }

            if (token.email) {
                try {
                    const dbUser = await findUserByEmail(token.email as string);
                    token.approved = Boolean(dbUser?.approved);
                } catch (error) {
                    console.error("jwt callback error:", error);
                }
            }

            token.isAdmin = isAdminEmail(token.email as string | undefined);
            if (token.isAdmin) {
                token.approved = true;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.picture as string | undefined;
                session.user.isAdmin = Boolean(token.isAdmin);
                session.user.approved = Boolean(token.approved);
            }

            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith(baseUrl)) {
                return url;
            }

            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }

            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
