import prisma from "../db";
import sendToken from "../utils/jwtToken";
import bcrypt from "bcryptjs";
import { Request, Response ,NextFunction} from "express";

const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        sendToken(user, 200, res);
    } catch (error) {
        next(error); 
    }
};

const loginUser = async(req:Request, res:Response) => {
    try {
        const {email, password} = req.body;
        const user = await prisma.users.findUnique({
            where: {
                email,
            },
        });

        if (!user || !user.password) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        sendToken(user, 200, res);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Server Error'});
        return;
    }
}

const logoutUser = async(req:Request, res:Response) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none" as "none",
    });

    res.status(200).json({
        success: true,
        data: {},
    });
}

// const getFiles = async(req:Request, res:Response) => {

// }

export { registerUser, loginUser, logoutUser };