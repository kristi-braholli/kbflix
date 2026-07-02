import { NextApiRequest, NextApiResponse } from "next";
import { compare } from "bcrypt";

import { isAdminEmail } from "@/lib/admin";
import { findUserByEmail } from "@/lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).end();
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "invalid_credentials" });
        }

        const user = await findUserByEmail(email);

        if (!user || !user.hashedPassword) {
            return res.status(200).json({ status: "invalid_credentials" });
        }

        const isCorrectPassword = await compare(password, user.hashedPassword);

        if (!isCorrectPassword) {
            return res.status(200).json({ status: "invalid_credentials" });
        }

        if (!user.approved && !isAdminEmail(user.email)) {
            return res.status(200).json({ status: "pending_approval" });
        }

        return res.status(200).json({ status: "ok" });
    } catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}
