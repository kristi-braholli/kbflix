import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { ensureUserDataReady, findUserByEmail } from "@/lib/users";

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        throw new Error("Not signed in");
    }

    await ensureUserDataReady();

    const currentUser = await findUserByEmail(session.user.email);

    if (!currentUser) {
        throw new Error("Not signed in");
    }

    return { currentUser, session };
};

export default serverAuth;
