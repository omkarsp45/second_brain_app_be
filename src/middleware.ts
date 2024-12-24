import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const JWT_SECRET_KEY = "mysecretkey";

function userMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.token;
    if (typeof token !== "string") {
        res.status(401).json({ message: "You have not logged in before" })
        return;
    }
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    if (decodedToken) {
        req.body.userId = decodedToken;
        next();
    }
    else {
        res.status(401).json({
            message: "Token Expired or Invalid Token ",
        })
    }
}

export { userMiddleware, JWT_SECRET_KEY }