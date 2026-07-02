import { NextApiRequest, NextApiResponse } from "next";

import { isAdminEmail } from "@/lib/admin";
import serverAuth from "@/lib/serverAuth";

const serverAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
    const { currentUser } = await serverAuth(req, res);

    if (!isAdminEmail(currentUser.email)) {
        throw new Error("Forbidden");
    }

    return { currentUser };
};

export default serverAdmin;
