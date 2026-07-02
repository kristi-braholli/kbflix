import {NextApiRequest, NextApiResponse} from "next";
import prismadb from "@/lib/prismadb";
import bcrypt from 'bcrypt';
import {isAdminEmail} from "@/lib/admin";
import {ensureUserDataReady, findUserByEmail} from "@/lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({message: 'Method not allowed'});
        return;
    }

    try {
        const {email, name, password} = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({error: 'Missing fields'});
        }

        await ensureUserDataReady();

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(422).json({error: 'Email taken'});
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const approved = isAdminEmail(email);

        await prismadb.user.create({
            data: {
                email,
                name,
                hashedPassword,
                image: '',
                emailVerified: new Date(),
                approved,
                favouriteIds: [],
            }
        });

        return res.status(200).json({
            success: true,
            pendingApproval: !approved,
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: 'Registration failed. Please try again.' });
    }

}
