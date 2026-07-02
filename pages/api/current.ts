import {NextApiRequest, NextApiResponse} from "next";
import {isAdminEmail} from "@/lib/admin";
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    try {
        const {currentUser, session} = await serverAuth(req, res);
        const {hashedPassword, ...safeUser} = currentUser;

        return res.status(200).json({
            ...safeUser,
            isAdmin: session.user.isAdmin ?? isAdminEmail(currentUser.email),
        });
    } catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}