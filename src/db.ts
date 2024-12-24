import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
})

const ContentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
})

const linkSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
})

export const User = model("User", UserSchema);
export const Content = model("Content", ContentSchema);
export const Link = model("link", linkSchema);