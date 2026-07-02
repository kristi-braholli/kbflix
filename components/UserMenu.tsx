import React, { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import useCurrentUser from "@/hooks/useCurrentUser";

const UserMenu: React.FC = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: currentUser } = useCurrentUser();
    const [visible, setVisible] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const name = session?.user?.name || currentUser?.name || "User";
    const email = session?.user?.email || currentUser?.email || "";
    const isAdmin = session?.user?.isAdmin || currentUser?.isAdmin;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setVisible((current) => !current)}
                className="flex items-center gap-2 border border-zinc-700 rounded-md px-3 py-1.5 hover:bg-zinc-800 transition"
            >
                <img
                    src="/images/default-blue.png"
                    alt="profile"
                    className="w-7 h-7 rounded-md"
                />
                <span className="text-white text-sm hidden lg:inline max-w-[120px] truncate">
                    {name}
                </span>
            </button>

            {visible && (
                <div className="absolute right-0 mt-2 w-64 bg-black border border-zinc-700 rounded-md shadow-lg z-50">
                    <div className="px-4 py-4 border-b border-zinc-800">
                        <p className="text-white font-semibold truncate">{name}</p>
                        <p className="text-zinc-400 text-sm truncate">{email}</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                router.push("/admin/users");
                                setVisible(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white text-sm hover:bg-zinc-800"
                        >
                            Manage Users
                        </button>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth" })}
                        className="w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-zinc-800"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
