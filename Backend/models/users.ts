import { model, Schema } from "mongoose";

export interface User {
    _id: string;
    sid: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    email: string;
    phone: string;
    groups: string[];
}

export const userModel = model(
    "users",
    new Schema<User>({
        _id: String,
        sid: String,
        username: String,
        firstname: String,
        lastname: String,
        password: String,
        email: String,
        phone: String,
        groups: [String],
    })
);
