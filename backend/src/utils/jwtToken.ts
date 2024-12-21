import jwt from 'jsonwebtoken';
import { Response } from 'express'; 

const sendToken = (user: any, statusCode: number, res: Response): void => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: "2d",
    });

    const options = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none" as "none",
    };

    const userId = user.email;

    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        token,
        userId,
    })
};

export default sendToken;