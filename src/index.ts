import express, { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { userMiddleware, JWT_SECRET_KEY } from "./middleware";
import { User, Content, Link } from "./db";
const app = express();
const { ObjectId } = require("mongoose").Types;
app.use(express.json());

async function main() {
    await mongoose.connect("mongodb://localhost:27017/secondbrain");
}
main();

const UserSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(20),
});

const ContentSchema = z.object({
    link: z.string(),
    type: z.string(),
    title: z.string()
});

app.post("/api/v1/signup", async function (req: Request, res: Response) {
    const requiredBody = UserSchema.safeParse(req.body);
    if (!requiredBody.success) {
        res.status(400).json({
            message: "Invalid Data",
            error: requiredBody.error.errors
        })
        return;
    }
    const { username, password } = requiredBody.data;
    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            res.status(409).json({
                message: "User Already Exists"
            })
            return;
        } else {
            const hashed = bcrypt.hashSync(password, 10);
            await User.create({
                username: username,
                password: hashed,
            })
            res.json({
                message: "You are signed-up"
            })
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Sorry, something went wrong",
        })
    }

})

app.post("/api/v1/signin", async function (req: Request, res: Response) {
    const requiredBody = UserSchema.safeParse(req.body);
    if (!requiredBody.success) {
        res.status(400).json({
            message: "Invalid Data",
            error: requiredBody.error.errors
        })
        return;
    }
    const { username, password } = requiredBody.data;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            res.status(401).json({
                message: "User not exists\nPlease signup first"
            })
            return;
        }
        const match = bcrypt.compareSync(password, user.password);
        if (match) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY);
            res.json({
                message: "You are signed in",
                token: token
            })
        }
        else {
            res.status(401).json({
                message: "Incorrect Password"
            })
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Error occured while signing in\nPlease try again",
        })
    }
});

app.post("/api/v1/content", userMiddleware, async function (req: Request, res: Response) {
    const _id = req.body.userId.userId;
    const requiredBody = ContentSchema.safeParse(req.body);
    const newId = new ObjectId(_id);
    if (!requiredBody.success) {
        res.status(400).json({
            message: "Invalid Data",
            error: requiredBody.error.errors
        });
        return;
    }
    const { link, type, title } = requiredBody.data;
    try {
        const content = await Content.create({
            link: link,
            type: type,
            title: title,
            userId: newId
        });
        res.status(201).json({
            message: "Content created successfully",
            data: content
        });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({
            message: "Error occurred while saving content. Please try again."
        });
    }
});


app.get("/api/v1/content", function (req, res) {

})
app.delete("/api/v1/content", function (req, res) {

})
app.post("/api/v1/brain/share", function (req, res) {

})
app.get("/api/v1/brain/:shareLink", function (req, res) {

})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});