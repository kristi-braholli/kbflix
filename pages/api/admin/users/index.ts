import { NextApiRequest, NextApiResponse } from "next";

import serverAdmin from "@/lib/serverAdmin";
import { listAllUsers } from "@/lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).end();
    }

    try {
        await serverAdmin(req, res);
        const users = await listAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        if (error instanceof Error && error.message === "Forbidden") {
            return res.status(403).json({ error: "Forbidden" });
        }

        console.log(error);
        return res.status(400).end();
    }
}
