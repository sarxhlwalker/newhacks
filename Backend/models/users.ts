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
        _id: { type: String, required: true },
        sid: { type: String, required: true },
        username: { type: String, required: true },
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        password: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        groups: [{ type: String, required: true }],
    })
);
