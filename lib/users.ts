import { isAdminEmail } from "@/lib/admin";
import prismadb from "@/lib/prismadb";

export type DbUser = {
    id: string;
    email: string | null;
    name: string;
    hashedPassword: string | null;
    image: string | null;
    favouriteIds: string[];
    approved: boolean;
};

export type UserSummary = {
    id: string;
    email: string | null;
    name: string;
    createdAt: string | null;
    hasPassword: boolean;
    approved: boolean;
};

let emailVerifiedFixPromise: Promise<void> | null = null;
let approvedFieldFixPromise: Promise<void> | null = null;

function parseObjectId(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (value && typeof value === "object" && "$oid" in value) {
        return (value as { $oid: string }).$oid;
    }

    return String(value);
}

function parseApproved(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }

    return false;
}

export async function fixUserEmailVerifiedFields(): Promise<void> {
    await prismadb.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: { emailVerified: { $type: "bool" } },
                u: { $unset: { emailVerified: "" } },
                multi: true,
            },
        ],
    });
}

export async function ensureApprovedFieldMigrated(): Promise<void> {
    await prismadb.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: { approved: { $exists: false } },
                u: { $set: { approved: true } },
                multi: true,
            },
        ],
    });

    const adminRegex = `^${ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;
    await prismadb.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: {
                    email: {
                        $regex: adminRegex,
                        $options: "i",
                    },
                },
                u: { $set: { approved: true } },
                multi: true,
            },
        ],
    });
}

const ADMIN_EMAIL = "kristi.artan.braholli@gmail.com";

export async function ensureUserEmailVerifiedFixed(): Promise<void> {
    if (!emailVerifiedFixPromise) {
        emailVerifiedFixPromise = fixUserEmailVerifiedFields().catch((error) => {
            emailVerifiedFixPromise = null;
            throw error;
        });
    }

    return emailVerifiedFixPromise;
}

export async function ensureUserDataReady(): Promise<void> {
    await ensureUserEmailVerifiedFixed();

    if (!approvedFieldFixPromise) {
        approvedFieldFixPromise = ensureApprovedFieldMigrated().catch((error) => {
            approvedFieldFixPromise = null;
            throw error;
        });
    }

    await approvedFieldFixPromise;
}

function mapDbUser(doc: Record<string, unknown>): DbUser {
    const email = (doc.email as string) ?? null;

    return {
        id: parseObjectId(doc._id),
        email,
        name: doc.name as string,
        hashedPassword: (doc.hashedPassword as string) ?? null,
        image: (doc.image as string) ?? null,
        favouriteIds: Array.isArray(doc.favouriteIds)
            ? doc.favouriteIds.map(parseObjectId)
            : [],
        approved: isAdminEmail(email) || parseApproved(doc.approved),
    };
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
    await ensureUserDataReady();

    const normalizedEmail = email.trim();

    const result = (await prismadb.$runCommandRaw({
        find: "User",
        filter: {
            email: {
                $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            },
        },
        limit: 1,
    })) as {
        cursor?: { firstBatch?: Array<Record<string, unknown>> };
    };

    const doc = result.cursor?.firstBatch?.[0];
    if (!doc) {
        return null;
    }

    return mapDbUser(doc);
}

function mapUserSummary(doc: Record<string, unknown>): UserSummary {
    const email = (doc.email as string) ?? null;

    return {
        id: parseObjectId(doc._id),
        email,
        name: doc.name as string,
        createdAt: doc.createdAt ? String(doc.createdAt) : null,
        hasPassword: Boolean(doc.hashedPassword),
        approved: isAdminEmail(email) || parseApproved(doc.approved),
    };
}

export async function listAllUsers(): Promise<UserSummary[]> {
    await ensureUserDataReady();

    const result = (await prismadb.$runCommandRaw({
        find: "User",
        filter: {},
        sort: { createdAt: -1 },
    })) as {
        cursor?: { firstBatch?: Array<Record<string, unknown>> };
    };

    return (result.cursor?.firstBatch ?? []).map(mapUserSummary);
}

export async function setUserApproval(userId: string, approved: boolean): Promise<void> {
    await ensureUserDataReady();
    await prismadb.user.update({
        where: { id: userId },
        data: { approved },
    });
}

export async function deleteUserById(userId: string): Promise<void> {
    await ensureUserDataReady();
    await prismadb.user.delete({
        where: { id: userId },
    });
}

export async function approveAdminUsers(): Promise<void> {
    await ensureUserDataReady();

    const adminRegex = `^${ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;
    await prismadb.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: {
                    email: {
                        $regex: adminRegex,
                        $options: "i",
                    },
                },
                u: { $set: { approved: true } },
                multi: true,
            },
        ],
    });
}
