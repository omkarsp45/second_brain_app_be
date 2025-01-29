import express, { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import { userMiddleware, JWT_SECRET_KEY } from "./middleware";
import { User, Content, Link } from "./db";
import { random } from "./utils"
const { ObjectId } = require("mongoose").Types;
const app = express();
app.use(express.json());
app.use(cors());

async function main() {
    await mongoose.connect("mongodb+srv://omkarspatil:BqnWhFkTKZGJQYfV@test.xslxo.mongodb.net/second-brain");
    console.log("Connected to Database")
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

app.get("/api/v1/content", userMiddleware, async function (req: Request, res: Response) {
    const _id = new ObjectId(req.body.userId.userId);
    if (!_id) {
        res.status(400).json({ message: "Missing userId" });
        return;
    }
    try {
        const content = await Content.find({ userId: _id });
        res.status(200).json({ data: content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
    return;
});

app.delete("/api/v1/content", userMiddleware, async function (req, res) {
    const contentId = new ObjectId(req.body.contentId);
    if (!contentId) {
        res.status(400).json({ message: "Missing Content" });
        return;
    }
    const _id = new ObjectId(req.body.userId.userId);
    if (!_id) {
        res.status(400).json({ message: "Missing userId" });
        return;
    }
    try {
        const deleted = await Content.deleteMany({ _id: contentId, userId: _id });
        res.status(200).json({ message: "Deleted", deleted })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
})

app.post("/api/v1/brain/share", userMiddleware, async function (req, res) {
    const share = req.body.share;
    const _id = new ObjectId(req.body.userId.userId);
    if (share) {
        const existingLink = await Link.findOne({ userId: _id });
        if (share === 'check') {
            if (existingLink) res.json({ message: true, hash: existingLink.hash });
            else res.json({ message: false })
            return;
        }
        if (share === 'true') {
            const hash = random(10);
            await Link.create({
                userId: _id,
                hash: hash
            })
            res.json({
                hash
            })
        }
        else {
            await Link.deleteOne({
                userId: _id
            })
            res.json({
                message: "Link Removed Successfully",
                status: true
            })
        }
    }
})

app.get("/api/v1/brain/:shareLink", async function (req, res) {
    const hash = req.params.shareLink;
    const link = await Link.findOne({ hash });
    if (!link) {
        res.status(411).json({ message: "Invalid Link" })
        return;
    }
    try {
        const content = await Content.find({
            userId: link.userId
        })
        const user = await User.findOne({
            _id: link.userId
        })
        res.json({
            username: user?.username,
            data: content
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error })
    }
})

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});