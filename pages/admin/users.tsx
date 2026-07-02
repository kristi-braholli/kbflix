import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import axios from "axios";
import useSWR from "swr";

import { authOptions } from "@/lib/authOptions";
import fetcher from "@/lib/fetcher";
import { UserSummary } from "@/lib/users";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        const session = await getServerSession(context.req, context.res, authOptions);

        if (!session?.user?.isAdmin) {
            return {
                redirect: {
                    destination: "/",
                    permanent: false,
                },
            };
        }

        return { props: {} };
    } catch {
        return {
            redirect: {
                destination: "/auth",
                permanent: false,
            },
        };
    }
}

const AdminUsers = () => {
    const router = useRouter();
    const { data: users, mutate, isLoading } = useSWR<UserSummary[]>("/api/admin/users", fetcher);
    const [actionId, setActionId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleDelete = useCallback(async (userId: string, name: string) => {
        if (!window.confirm(`Delete user "${name}"?`)) {
            return;
        }

        setActionId(userId);
        setError("");

        try {
            await axios.delete(`/api/admin/users/${userId}`);
            await mutate();
        } catch (err) {
            console.log(err);
            setError("Failed to delete user.");
        } finally {
            setActionId(null);
        }
    }, [mutate]);

    const handleApprove = useCallback(async (userId: string, approved: boolean) => {
        setActionId(userId);
        setError("");

        try {
            await axios.patch(`/api/admin/users/${userId}`, { approved });
            await mutate();
        } catch (err) {
            console.log(err);
            setError("Failed to update user.");
        } finally {
            setActionId(null);
        }
    }, [mutate]);

    return (
        <div className="min-h-screen bg-black text-white px-4 md:px-16 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Users</h1>
                        <p className="text-zinc-400 mt-2">Approve new users before they can access the app</p>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md text-sm"
                    >
                        Back to Home
                    </button>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {isLoading ? (
                    <p className="text-zinc-400">Loading users...</p>
                ) : (
                    <div className="overflow-x-auto border border-zinc-800 rounded-lg">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold">Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Login</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Status</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Created</th>
                                    <th className="px-4 py-3 text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(users ?? []).map((user) => (
                                    <tr key={user.id} className="border-t border-zinc-800">
                                        <td className="px-4 py-3">{user.name}</td>
                                        <td className="px-4 py-3">{user.email ?? "-"}</td>
                                        <td className="px-4 py-3">
                                            {user.hasPassword ? "Email/Password" : "OAuth"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    user.approved
                                                        ? "bg-green-900 text-green-300"
                                                        : "bg-yellow-900 text-yellow-300"
                                                }`}
                                            >
                                                {user.approved ? "Approved" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {!user.approved && (
                                                    <button
                                                        onClick={() => handleApprove(user.id, true)}
                                                        disabled={actionId === user.id}
                                                        className="bg-green-700 hover:bg-green-600 disabled:opacity-50 px-3 py-1.5 rounded-md text-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {user.approved && (
                                                    <button
                                                        onClick={() => handleApprove(user.id, false)}
                                                        disabled={actionId === user.id}
                                                        className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 px-3 py-1.5 rounded-md text-sm"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    disabled={actionId === user.id}
                                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1.5 rounded-md text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!users?.length && (
                            <p className="px-4 py-6 text-zinc-400">No users found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
