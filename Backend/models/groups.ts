import { model, Schema } from "mongoose";

export interface Group {
    _id: string;
    groupCode: string;
    name: string;
    leaderId: string;
    members: string[];
    assignments: string[];
}

export const groupModel = model<Group>(
    "groups",
    new Schema<Group>({
        _id: String,
        groupCode: String,
        name: String,
        leaderId: String,
        members: [String],
        assignments: [String],
    })
);
