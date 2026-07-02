import { NextApiRequest, NextApiResponse } from "next";

import serverAdmin from "@/lib/serverAdmin";
import { deleteUserById, setUserApproval } from "@/lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { currentUser } = await serverAdmin(req, res);
        const { userId } = req.query;

        if (typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid user id" });
        }

        if (req.method === "DELETE") {
            if (userId === currentUser.id) {
                return res.status(400).json({ error: "Cannot delete your own account" });
            }

            await deleteUserById(userId);
            return res.status(200).json({ success: true });
        }

        if (req.method === "PATCH") {
            const { approved } = req.body;

            if (typeof approved !== "boolean") {
                return res.status(400).json({ error: "Invalid request" });
            }

            await setUserApproval(userId, approved);
            return res.status(200).json({ success: true });
        }

        return res.status(405).end();
    } catch (error) {
        if (error instanceof Error && error.message === "Forbidden") {
            return res.status(403).json({ error: "Forbidden" });
        }

        console.log(error);
        return res.status(400).end();
    }
}
